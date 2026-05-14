# Supabase Schema

The full schema is in `supabase/migrations/*.sql` (15 files, applied in
timestamp order). This doc summarizes the **runtime state** at archive time:
what's in the database, why, and which pieces are NOT in migrations.

## Project IDs

| Field | Value |
| --- | --- |
| Lovable Supabase project_id | `zplvyglorabxdufjdelh` |
| Region | (whatever Lovable provisioned — check Supabase Dashboard if rebuilding) |

The `project_id` is in `supabase/config.toml`. To rebuild on a new Supabase
project, this is one of the first values to swap.

## Extensions

| Extension | Schema | Used for |
| --- | --- | --- |
| `pg_net` | `extensions` | pg_cron's `net.http_post` to invoke Edge Functions |
| `pg_cron` | (default) | Scheduled jobs (only `process-email-queue` is registered) |
| `supabase_vault` | (default) | Storing the service-role key for cron callbacks |
| `pgmq` | (default) | Message queues for emails |
| `pgcrypto` | `public` | `pgp_sym_encrypt` for Stripe API keys |

All `CREATE EXTENSION IF NOT EXISTS` calls are in the `email_infra` migration
(`20260408015027_email_infra.sql`). pgcrypto is in the Stripe Connect migration
(`20260419041711_*.sql`).

## Enums

```sql
public.app_role        AS ENUM ('admin', 'moderator', 'user')
public.invoice_status  AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled')
```

## Tables

### `profiles`
Per-user metadata extending `auth.users`. Auto-created on signup via the
`handle_new_user` trigger.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid UNIQUE FK → auth.users(id) ON DELETE CASCADE | |
| `full_name` | text | Pulled from `raw_user_meta_data->>'full_name'` |
| `business_name` | text | |
| `created_at`, `updated_at` | timestamptz | `update_updated_at_column` trigger |

RLS: users SELECT/INSERT/UPDATE own row.

### `invoices`
Core domain object. Either created manually by the user or imported from
Stripe via `sync-stripe-invoices`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid (no FK) | RLS scopes by `auth.uid() = user_id` |
| `client_name`, `client_email` | text | |
| `invoice_number` | text NOT NULL | For Stripe imports without `invoice.number`, falls back to `STRIPE-<last8>` |
| `amount` | numeric(12,2) | |
| `currency` | text DEFAULT 'USD' | |
| `issue_date`, `due_date` | date | |
| `status` | invoice_status DEFAULT 'draft' | Status changes auto-logged to `invoice_activities` via `log_invoice_status_change` trigger |
| `notes` | text | |
| `payment_link` | text | Used for the email CTA button + click-tracking validation |
| `source` | text DEFAULT 'manual' CHECK IN ('manual','stripe') | |

Triggers:
- `update_invoices_updated_at` BEFORE UPDATE
- `log_invoice_status` AFTER UPDATE → INSERT into invoice_activities on status change
- `enforce_invoice_limit_trigger` BEFORE INSERT → checks `get_invoice_limit_for_user`,
  raises `check_violation` (errcode 23514) if cap reached. Bypassed for admins
  and `-1` (unlimited) plans.

RLS: users full CRUD on own rows.

### `invoice_reminders`
The cadence config attached to each invoice. The default cadence
(see `defaultCadence` in `src/config/brand.ts`) is `[-3, 0, +3, +7, +14]`
days from `due_date`.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `invoice_id` | uuid FK → invoices(id) ON DELETE CASCADE | |
| `reminder_type` | text CHECK IN ('before_due','on_due','after_due') | |
| `days_offset` | int DEFAULT 0 | Always positive; `before_due` subtracts, `after_due` adds |
| `enabled` | boolean DEFAULT true | |

RLS: ALL via existence check on parent invoice.

### `invoice_activities`
Audit log. Soft-delete via `archived_at` (admins can archive/restore via
`admin-stats action=archive-activity|restore-activity`).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `invoice_id` | uuid FK → invoices(id) ON DELETE CASCADE | |
| `activity_type` | text | e.g., `'status_change'`, `'reminder_sent'` |
| `description` | text | |
| `archived_at` | timestamptz | NULL = visible to user; non-NULL = admin-only |
| `created_at` | timestamptz | |

RLS:
- Owners SELECT non-archived only.
- Admins SELECT all (including archived).
- Owners INSERT for their own invoices.
- RESTRICTIVE deny: authenticated UPDATE and DELETE both blocked.
  Hard-delete is service-role only; archive/restore is via Edge Function.

### `voice_profiles`
The AI voice training storage. One row per user.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid UNIQUE | RLS-scoped |
| `samples` | jsonb DEFAULT `'[]'` | The user's pasted sample emails (not currently used for re-analysis after extraction) |
| `tone_profile` | jsonb | The structured tone profile returned by the AI gateway. Schema in `AI_VOICE_SYSTEM.md`. |
| `analyzed_at` | timestamptz | |
| `created_at`, `updated_at` | timestamptz | |

Note: a `voice_enabled BOOLEAN DEFAULT false` column was added in migration
`20260419042134` and immediately removed (last migration). The current behavior
is "if `tone_profile` is non-null AND `LOVABLE_API_KEY` is set, use voice" —
no per-user opt-in flag.

RLS: users full CRUD on own row.

### `user_roles`
Role assignments. Used by `has_role()` for admin gating across the app.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid FK → auth.users(id) ON DELETE CASCADE | |
| `role` | app_role | |
| (unique on user_id, role) | | |

Seed: `INSERT INTO user_roles (user_id, role) VALUES ('ce4e96a5-cef9-4d3e-be93-04b4e3a3a24b', 'admin');`
This UUID is a dangling FK on a fresh `auth.users` table. To rebuild: either
manually INSERT into `auth.users` with this UUID, or change the seed to use
the actual UUID assigned to the admin email after first signup.

RLS:
- Admins SELECT all.
- Service role ALL.
- RESTRICTIVE deny on INSERT/UPDATE/DELETE for authenticated and anon
  (forces all role assignment through service role).

### `user_plans`
Mirror of the user's Stripe subscription tier. Maintained by `check-subscription`
on each call (which is invoked from the frontend after checkout completes and
periodically by the billing UI).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid UNIQUE | |
| `plan_key` | text DEFAULT 'free' | One of: `free`, `starter`, `pro`, `business` (per the DB function) — but the Stripe products live as `solo` and `studio`. See drift notes in `STRIPE_INTEGRATION.md`. |
| `product_id` | text | Stripe `prod_*` |
| `created_at`, `updated_at` | timestamptz | |

RLS: users SELECT own row. Service role ALL.

### `stripe_connections`
Per-user encrypted Stripe restricted API key (for the user's own Stripe
account, used to read their invoices). NOT for PayNudge's own Stripe billing.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid UNIQUE | |
| `encrypted_api_key` | bytea | `pgp_sym_encrypt(plaintext, server_secret)`. Server secret = `STRIPE_KEY_ENCRYPTION_SECRET` Edge Function env var. |
| `api_key_last4` | text | Safe to display (e.g., "rk_live_…ABCD") |
| `stripe_account_id` | text | `acct_*` from Stripe `/v1/account` |
| `stripe_account_email`, `stripe_account_name` | text | |
| `last_sync_at`, `last_sync_status`, `last_sync_error` | | `'success' | 'error'` |
| `invoices_synced_count` | int DEFAULT 0 | Lifetime imports counter |
| `created_at`, `updated_at` | timestamptz | `trg_stripe_connections_updated_at` |

RLS:
- Service role ALL.
- Admins SELECT.
- **No "users SELECT own" policy on purpose.** Users go through the
  `stripe_connections_safe` view to see their own connection metadata
  without exposing `encrypted_api_key`.

### `stripe_invoice_map`
Idempotency map for Stripe invoice imports.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `user_id` | uuid | |
| `invoice_id` | uuid FK → invoices(id) ON DELETE CASCADE | |
| `stripe_invoice_id` | text | |
| `stripe_account_id` | text | |
| `last_synced_at` | timestamptz | |
| (unique on stripe_account_id, stripe_invoice_id) | | |
| (unique on user_id, stripe_invoice_id) | | |

RLS: users SELECT own. Admins SELECT. Service role ALL. RESTRICTIVE deny on
client-side INSERT/UPDATE/DELETE.

### `email_send_log`
Audit trail for every email send attempt. Written by all email-sending
functions and the suppression handler.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `message_id` | text | UUID generated by sender; matches the `message_id` field in the queue payload |
| `template_name` | text | e.g., `'payment-reminder'`, `'signup'`, or the queue name as fallback |
| `recipient_email` | text | |
| `status` | text CHECK | `'pending' | 'sent' | 'suppressed' | 'failed' | 'bounced' | 'complained' | 'dlq'` |
| `error_message` | text | |
| `metadata` | jsonb | |
| `created_at` | timestamptz | |

Indexes:
- `idx_email_send_log_created` (created_at DESC)
- `idx_email_send_log_recipient` (recipient_email)
- `idx_email_send_log_message` (message_id)
- **`idx_email_send_log_message_sent_unique`** (message_id) WHERE status='sent'
  — partial unique index, defense against duplicate sends on visibility-timeout
  expiry races.

RLS: service role can SELECT/INSERT/UPDATE.

### `email_send_state`
Single-row config + rate-limit cooldown table.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | int PK CHECK (id=1) | Forces single row |
| `retry_after_until` | timestamptz | If set and in future, dispatcher skips |
| `batch_size` | int DEFAULT 10 | Messages per dispatcher run |
| `send_delay_ms` | int DEFAULT 200 | Delay between sends within a batch |
| `auth_email_ttl_minutes` | int DEFAULT 15 | Drop auth emails older than this → DLQ |
| `transactional_email_ttl_minutes` | int DEFAULT 60 | Drop transactional emails older than this → DLQ |
| `updated_at` | timestamptz | |

Initial row: `INSERT (id) VALUES (1) ON CONFLICT DO NOTHING`.

RLS: service role ALL.

### `suppressed_emails`
Append-only suppression list. Written by `handle-email-suppression` (bounces
+ complaints from Mailgun via Lovable webhook) and `handle-email-unsubscribe`
(one-click unsubscribe link). Checked by `send-transactional-email` before
every send (fail-closed: if the suppression check errors, the send is
refused).

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `email` | text UNIQUE | Lowercased on write |
| `reason` | text CHECK IN ('unsubscribe','bounce','complaint') | |
| `metadata` | jsonb | |
| `created_at` | timestamptz | |

RLS: service role SELECT/INSERT only. **No DELETE/UPDATE policies on purpose** —
this is append-only; you can't "un-suppress" by mutating this table.

### `email_unsubscribe_tokens`
One token per email address. Generated lazily on first send. The unsubscribe
link in every transactional email contains this token.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `token` | text UNIQUE | 32-byte hex, generated via `crypto.getRandomValues` |
| `email` | text UNIQUE | Lowercased |
| `created_at`, `used_at` | timestamptz | `used_at` set when unsubscribe link is clicked |

RLS: service role SELECT/INSERT/UPDATE (mark as used). No DELETE.

### `email_events`
Open + click events from the `track-email-event` Edge Function.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | uuid PK | |
| `invoice_id` | uuid (no FK) | First half of `tracking_id` (split on `_`) |
| `tracking_id` | text | Format: `{invoice_id}_{message_id}` |
| `event_type` | text | `'open' | 'click'` |
| `metadata` | jsonb | `{ ip, user_agent }` |
| `created_at` | timestamptz | |

Indexes: idx_email_events_invoice (invoice_id), idx_email_events_tracking (tracking_id).

RLS:
- Service role INSERT.
- Authenticated users SELECT events for their own invoices (joined via invoices.user_id).
- Admins SELECT all.

## Views

### `stripe_connections_safe`
`SECURITY INVOKER` view that exposes everything from `stripe_connections`
EXCEPT `encrypted_api_key`. WHERE clause: `user_id = auth.uid() OR has_role(auth.uid(), 'admin')`.
GRANTed SELECT to `authenticated`.

This is how the frontend reads the user's Stripe connection state.

### `client_pay_behavior`
`SECURITY INVOKER` aggregate view per (user_id, client_name). Computes:
- total_invoices, outstanding_count
- paid_count, avg_days_late, on_time_rate, last_paid_at
- score: `70 * on_time_rate + 30 * (1 - clamp(avg_days_late / 30, 0, 1))`,
  clamped 0..100, NULL when paid_count = 0.

GRANTed SELECT to `authenticated`. Underlying invoices RLS still applies
because `security_invoker = true`.

## Functions

| Function | Purpose | Security |
| --- | --- | --- |
| `update_updated_at_column()` | Reusable BEFORE-UPDATE trigger for `updated_at` columns | (trigger only) |
| `handle_new_user()` | AFTER INSERT on auth.users → INSERT profile | DEFINER |
| `log_invoice_status_change()` | AFTER UPDATE on invoices → INSERT activity row on status change | DEFINER |
| `set_stripe_connections_updated_at()` | BEFORE UPDATE trigger | (trigger only) |
| `has_role(_user_id, _role)` | Used in RLS policies. STABLE SECURITY DEFINER to avoid RLS recursion. | DEFINER |
| `get_invoice_limit_for_user(_user_id)` | Returns the active-invoice cap. **Stale plan keys** — see `STRIPE_INTEGRATION.md`. | DEFINER |
| `enforce_invoice_limit()` | BEFORE INSERT trigger on invoices, raises check_violation if over cap | DEFINER |
| `encrypt_stripe_key(_plaintext, _secret)` | `pgp_sym_encrypt` wrapper. Granted to service_role only. | DEFINER |
| `decrypt_stripe_key(_ciphertext, _secret)` | `pgp_sym_decrypt` wrapper. Granted to service_role only. | DEFINER |
| `enqueue_email(queue_name, payload)` | `pgmq.send` wrapper, auto-creates queue on undefined_table. Granted to service_role only. | DEFINER |
| `read_email_batch(queue_name, batch_size, vt)` | `pgmq.read` wrapper. Granted to service_role only. | DEFINER |
| `delete_email(queue_name, message_id)` | `pgmq.delete` wrapper. Granted to service_role only. | DEFINER |
| `move_to_dlq(source_queue, dlq_name, message_id, payload)` | Send to DLQ + delete from source, both with auto-create-on-missing. Granted to service_role only. | DEFINER |

All public-schema functions use `SET search_path = public` (or
`public, extensions` where pgcrypto is needed) to prevent search-path attacks
on SECURITY DEFINER functions.

## Triggers

| Table | Trigger | When | Function |
| --- | --- | --- | --- |
| auth.users | `on_auth_user_created` | AFTER INSERT | `handle_new_user` |
| profiles | `update_profiles_updated_at` | BEFORE UPDATE | `update_updated_at_column` |
| invoices | `update_invoices_updated_at` | BEFORE UPDATE | `update_updated_at_column` |
| invoices | `log_invoice_status` | AFTER UPDATE | `log_invoice_status_change` |
| invoices | `enforce_invoice_limit_trigger` | BEFORE INSERT | `enforce_invoice_limit` |
| user_plans | `update_user_plans_updated_at` | BEFORE UPDATE | `update_updated_at_column` |
| stripe_connections | `trg_stripe_connections_updated_at` | BEFORE UPDATE | `set_stripe_connections_updated_at` |
| voice_profiles | `update_voice_profiles_updated_at` | BEFORE UPDATE | `update_updated_at_column` |

## pgmq queues

| Queue | Purpose | DLQ |
| --- | --- | --- |
| `auth_emails` | Auth event emails (signup/recovery/etc) — drained first by dispatcher | `auth_emails_dlq` |
| `transactional_emails` | Payment reminders + contact form notifications + future templates | `transactional_emails_dlq` |

Created idempotently in the `email_infra` migration. The wrapper RPCs
(`enqueue_email` etc.) auto-create the queue on `undefined_table` so emails
are never lost if a queue gets dropped.

Visibility timeout (vt) when reading: 30 seconds. Dispatcher must process
within that window or another worker can claim the message.

## Vault secrets

| Name | Value | Purpose |
| --- | --- | --- |
| `email_queue_service_role_key` | The Supabase service_role JWT | Used by the pg_cron job to authenticate its `net.http_post` call to `process-email-queue` |

**Not in migrations.** Set dynamically by Lovable's `setup_email_infra` tool.
To rebuild on a new Supabase project: insert via `vault.create_secret(...)`.

## pg_cron jobs

| Name | Schedule | Action |
| --- | --- | --- |
| `process-email-queue` | every 5 seconds | `SELECT net.http_post(<edge_fn_url>, headers => jsonb_build_object('Authorization', 'Bearer ' || (SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name = 'email_queue_service_role_key')))` (gated on `email_send_state.retry_after_until > now()` and `pgmq.metrics_all()` showing queued messages) |

**Not in migrations.** See `CRON_AND_VAULT.md` for the full setup pattern.

## What's missing from this DB at archive

- A pg_cron job for `process-reminders` — never registered. Reminders relied
  on either manual triggering or external cron. (Verify by `SELECT * FROM cron.job;`
  before archive.)
- Stripe webhook → `check-subscription` — never wired. Subscription state was
  pulled on-demand by the frontend rather than push-updated by a webhook.
  Means a user who downgrades via `customer-portal` won't have their
  `user_plans` updated until they next visit the billing page.
