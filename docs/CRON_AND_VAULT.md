# pg_cron and Vault

The cron job and vault secret that drive the email pipeline are NOT in
migrations. They were applied dynamically by Lovable's `setup_email_infra`
tool. This doc captures the pattern so a future rebuild can recreate them.

## Why they're not in migrations

The cron job's SQL contains the literal Edge Function URL (which differs per
Supabase project) and a vault lookup (which depends on a vault secret name
+ value). Static SQL can't express that — it would either hardcode the wrong
URL or fail to read a secret that doesn't exist yet. So the migration sets
up the schema and queues, and Lovable's external tool applies the dynamic
last-mile config when wiring a project.

For a manual rebuild on a fresh Supabase project, the steps below replace
that tool.

## Vault: storing the service-role key

The pg_cron job needs to call the `process-email-queue` Edge Function, which
requires `Authorization: Bearer <service-role-jwt>`. The service-role JWT
must be available to the cron job's `net.http_post` call.

Storing it in vault means:
- It's encrypted at rest.
- It's not exposed in `pg_cron.job` or `cron.job` (those tables are
  service-role visible only, but defense in depth).
- It can be rotated by updating the vault secret; the cron job picks up the
  new value via `vault.decrypted_secrets` view automatically.

### Setup SQL

```sql
-- Create / update the vault secret holding the service-role key
SELECT vault.create_secret(
  '<paste-service-role-jwt-here>',
  'email_queue_service_role_key',
  'Used by process-email-queue cron to authenticate Edge Function callbacks'
);

-- To rotate later:
-- SELECT vault.update_secret(<secret-id>, '<new-jwt>');

-- To delete (revert):
-- DELETE FROM vault.secrets WHERE name = 'email_queue_service_role_key';
```

The service-role JWT comes from Supabase Dashboard → Settings → API →
"service_role" key. **NEVER paste this into source control.** Apply the
SQL via the Dashboard SQL editor or the Supabase Management API.

## pg_cron: the dispatcher schedule

The cron job runs every 5 seconds and calls `process-email-queue` IF
either queue has messages AND no rate-limit cooldown is active.

### Setup SQL

```sql
-- Schedule the job. Replace <PROJECT_REF> with your Supabase project ref.
SELECT cron.schedule(
  'process-email-queue',
  '5 seconds',
  $$
  DO $job$
  DECLARE
    v_should_run BOOLEAN;
    v_service_key TEXT;
  BEGIN
    -- Check rate-limit cooldown
    SELECT (retry_after_until IS NULL OR retry_after_until <= now())
    INTO v_should_run
    FROM public.email_send_state
    WHERE id = 1;

    IF NOT v_should_run THEN RETURN; END IF;

    -- Check whether either queue has messages
    SELECT EXISTS (
      SELECT 1 FROM pgmq.metrics_all()
      WHERE queue_name IN ('auth_emails', 'transactional_emails')
        AND queue_length > 0
    ) INTO v_should_run;

    IF NOT v_should_run THEN RETURN; END IF;

    -- Pull service-role key from vault
    SELECT decrypted_secret INTO v_service_key
    FROM vault.decrypted_secrets
    WHERE name = 'email_queue_service_role_key';

    -- Fire the Edge Function
    PERFORM net.http_post(
      url := 'https://<PROJECT_REF>.functions.supabase.co/process-email-queue',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_service_key,
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  END $job$;
  $$
);

-- To verify:
-- SELECT * FROM cron.job WHERE jobname = 'process-email-queue';

-- To check recent runs:
-- SELECT * FROM cron.job_run_details
--   WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-email-queue')
--   ORDER BY start_time DESC LIMIT 20;

-- To revert:
-- SELECT cron.unschedule('process-email-queue');
```

### Why the inner DO block

`net.http_post` is async (returns a request ID immediately, the actual HTTP
call happens later via pg_net's worker). Wrapping in a DO block lets us:

1. Skip the HTTP entirely when we know the dispatcher would no-op anyway
   (cooldown active or queues empty). Cuts cron-side work + Edge Function
   invocations by ~95% during quiet periods.
2. Read the vault secret in the same transaction as the rate-limit + queue
   check, ensuring we don't fire HTTP after a state change.

### Why every 5 seconds

Tradeoff between latency and load. 5s is fast enough that auth emails
(signup confirm) feel near-instant. Slower than 1s avoids hammering the
cron worker. The `should_run` gating means the actual HTTP call only fires
when there's work to do, so the 5s interval costs almost nothing during
idle periods.

If you want to scale this up, two options:

- **Drop to 1-second cadence** — useful if you're processing hundreds of
  emails per minute and want lower latency. But pg_net's request queue can
  saturate; monitor `net._http_response` lag.
- **Trigger from the enqueue path** — instead of cron, have the
  `enqueue_email` function call `net.http_post` immediately after a
  successful send. Combine with a 30-second cron as a safety net for
  retries / TTL drains.

## What's NOT cron-scheduled

`process-reminders` was meant to run daily (the reminder cadence is
date-based at 1-day granularity), but a pg_cron job for it was never set up
in this project. Either it was being triggered manually for testing, or
the daily cadence was never tested live.

If you re-deploy and want daily reminders:

```sql
SELECT cron.schedule(
  'process-reminders-daily',
  '0 9 * * *',  -- 09:00 UTC daily
  $$
  DECLARE
    v_service_key TEXT;
  BEGIN
    SELECT decrypted_secret INTO v_service_key
    FROM vault.decrypted_secrets
    WHERE name = 'email_queue_service_role_key';

    PERFORM net.http_post(
      url := 'https://<PROJECT_REF>.functions.supabase.co/process-reminders',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || v_service_key,
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  END;
  $$
);
```

Note: `process-reminders` currently has `verify_jwt = false` and no internal
auth check. If you wire pg_cron to call it AND you want to keep the door
closed otherwise, add a service-role JWT check to the function (mirror the
pattern in `process-email-queue`).

## Inspecting cron state at runtime

Useful queries (all require service_role):

```sql
-- All scheduled jobs
SELECT jobid, jobname, schedule, command, active FROM cron.job;

-- Recent run history (last 50 runs across all jobs)
SELECT j.jobname, r.status, r.return_message, r.start_time, r.end_time
FROM cron.job_run_details r
JOIN cron.job j ON r.jobid = j.jobid
ORDER BY r.start_time DESC LIMIT 50;

-- Queue depths
SELECT queue_name, queue_length, oldest_msg_age_sec FROM pgmq.metrics_all();

-- Vault secrets (names only — values are decrypted via vault.decrypted_secrets)
SELECT name, description, created_at, updated_at FROM vault.secrets;

-- pg_net request log (last 100)
SELECT id, status_code, content_type, error_msg, created
FROM net._http_response
ORDER BY id DESC LIMIT 100;
```

## Rotating the vault secret

If the service-role key needs rotation (compromised, periodic rotation policy):

```sql
-- Get the secret ID
SELECT id FROM vault.secrets WHERE name = 'email_queue_service_role_key';

-- Update with the new JWT (from Supabase Dashboard → Settings → API)
SELECT vault.update_secret(
  '<secret-uuid>',
  '<new-service-role-jwt>'
);
```

The cron job picks up the new value on its next run — no restart needed.
The next `vault.decrypted_secrets` SELECT returns the rotated value.
