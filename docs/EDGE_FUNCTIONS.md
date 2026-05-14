# Edge Functions

19 Edge Functions total (one is `_shared`, leaving 18 callable). Listed by
domain, with role, JWT verification, dependencies, and required env vars.

## JWT verification matrix

From `supabase/config.toml`:

| Function | verify_jwt | Why |
| --- | --- | --- |
| `auth-email-hook` | `false` | Called by Supabase auth (not a logged-in user). HMAC-verified instead. |
| `handle-email-suppression` | `false` | Called by Lovable webhook. HMAC-verified instead. |
| `handle-email-unsubscribe` | `false` | Called from email links (no JWT possible). Token-verified. |
| `preview-transactional-email` | `false` | Called from a dev/admin context with explicit Bearer apiKey check. |
| `process-email-queue` | `true` | Called by pg_cron with the vault-stored service-role JWT. Function ALSO checks claim role==service_role for defense in depth. |
| `process-reminders` | `false` | Currently called manually / by an unimplemented cron. Function uses service-role internally. **No external auth gate** — relies on Supabase project not exposing the URL. **Tighten this if reusing.** |
| `send-transactional-email` | `false` (in toml — but has internal auth) | Internal auth: Bearer must be either service-role JWT or a valid user JWT, except for the `contact-form-notification` template (anon-allowed because recipient is hardcoded). |
| `track-email-event` | `false` | Called from email pixel/click. Token in querystring (`tracking_id`). |
| `submit-indexnow` | `false` | Called from CI/manual. No auth gate. |
| All other functions | (default `true`) | Standard authenticated user calls. |

## Domain: AI Voice

### `voice-trainer`
**Role**: User-facing. Two actions: `analyze` (extract tone profile from
samples) and `render` (preview a reminder in the user's voice for a given
stage + invoice context).

**Auth**: User JWT required. Profile is RLS-scoped.

**Calls**: `https://ai.gateway.lovable.dev/v1/chat/completions` with
`google/gemini-3-flash-preview`.

**Env**: `LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

**Returns**: `{ tone_profile: {...} }` for analyze, `{ reminder: { subject, body } }` for render.

See `AI_VOICE_SYSTEM.md` for the full prompts and tool schemas.

## Domain: Email — Lovable integration

### `auth-email-hook`
**Role**: Receives Supabase Auth Email Hook events (signup, invite,
magiclink, recovery, email_change, reauthentication). Renders the matching
React Email template. Enqueues to `pgmq.auth_emails`.

**Auth**: HMAC-signed webhook. `verifyWebhookRequest` from `@lovable.dev/webhooks-js`
checks signature + timestamp + payload schema. Secret = `LOVABLE_API_KEY`.

**Sub-route**: `/preview` — accepts `{ type }`, returns rendered HTML for
that auth template. Auth: `Authorization: Bearer ${LOVABLE_API_KEY}`. Used
by Lovable's email preview UI in Supabase Dashboard.

**Hook registration**: NOT in code. Registered in Supabase Dashboard →
Authentication → Hooks → "Send Email Hook" pointing to this function URL,
with the same `LOVABLE_API_KEY` as the webhook secret.

**Templates**: 6 React Email components in `_shared/email-templates/*.tsx`:
signup, invite, magic-link, recovery, email-change, reauthentication.

**Env**: `LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

### `process-email-queue`
**Role**: The dispatcher. Drains both queues (`auth_emails` first, then
`transactional_emails`), respects rate-limit cooldown, sends via Lovable
Email, handles retries/TTL/DLQ. Triggered every 5s by pg_cron.

**Auth**: Bearer JWT must have role `service_role`. The pg_cron job pulls
the service-role JWT from `vault.decrypted_secrets`. Defense in depth on
top of Supabase's `verify_jwt = true` gateway check.

**Calls**: `sendLovableEmail()` from `@lovable.dev/email-js`. Default endpoint
`https://api.lovable.dev`; overridable via `LOVABLE_SEND_URL` env.

**Behavior**:
- Reads `email_send_state` for cooldown + batch_size + send_delay_ms + TTLs.
- Reads N messages from queue with vt=30s.
- Per message: TTL check → max-retries check → already-sent check → send →
  log result → delete from queue.
- 429 response → write `retry_after_until`, stop processing batch (remaining
  messages stay queued, retried next cycle).
- 403 response → "emails disabled for this project" → DLQ + stop.
- Other errors → log 'failed', message stays invisible until VT expires.
- Counts failed attempts via `email_send_log` queries (not pgmq's `read_ct`,
  which over-counts batched messages).

**Env**: `LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
`LOVABLE_SEND_URL` (optional).

### `send-transactional-email`
**Role**: User-facing entry point for sending non-auth transactional emails.
Resolves template from registry, checks suppression, generates/reuses
unsubscribe token, renders React Email → HTML+text, injects open pixel +
wraps payment link, enqueues to `pgmq.transactional_emails`.

**Auth**: Either a service-role key (e.g., from `process-reminders`) OR a
valid user JWT. Exception: templates in `PUBLIC_TEMPLATES` set
(currently just `contact-form-notification`) can be invoked anonymously
because the recipient is hardcoded in the template.

**Calls**: `enqueue_email` RPC. Does NOT call Lovable directly — that's the
dispatcher's job.

**Templates**: Two registered:
- `payment-reminder` (renders the payment reminder, supports voice override)
- `contact-form-notification` (sends to fixed recipient, callable anon)

Add new templates by creating `_shared/transactional-email-templates/<name>.tsx`
and registering it in `registry.ts`.

**Env**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`.

### `handle-email-suppression`
**Role**: Webhook receiver for Mailgun bounces/complaints (proxied through
Lovable). Upserts `suppressed_emails`. Append-only log entry to
`email_send_log` with status='bounced'/'complained'/'suppressed'.

**Auth**: HMAC-signed webhook. Same pattern as `auth-email-hook`.

**Env**: `LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

### `handle-email-unsubscribe`
**Role**: Receiver for the one-click unsubscribe link in every transactional
email. Validates token against `email_unsubscribe_tokens`, marks `used_at`,
upserts `suppressed_emails` with reason='unsubscribe', returns a confirmation HTML page.

**Auth**: Token in URL (no JWT possible from an email link).

**Env**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

### `track-email-event`
**Role**: Open + click tracking endpoint. Two routes via querystring:

- `?t=<trackingId>&e=open` → returns 1×1 transparent GIF, INSERTs `email_events`.
- `?t=<trackingId>&e=click&r=<url>` → validates `r` against the invoice's
  stored `payment_link` (must match origin + pathname exactly), returns 302
  redirect, INSERTs `email_events`.

The redirect-validation is the open-redirect defense. The function does NOT
trust `r` — it cross-checks against the invoice's stored payment_link.

**Auth**: None (public). Tracking ID is unguessable enough.

**Env**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

### `preview-transactional-email`
**Role**: Renders any registered transactional template with `previewData`
to HTML for preview/dev.

**Auth**: Bearer must equal `LOVABLE_API_KEY`.

**Env**: `LOVABLE_API_KEY`.

### `process-reminders`
**Role**: The reminder pipeline trigger. Walks all enabled `invoice_reminders`
for `sent` or `overdue` invoices, computes whether today is the trigger
date, optionally renders voice-rendered body via the AI gateway, then
invokes `send-transactional-email`. Logs activity per invoice.

**Auth**: Currently NONE (verify_jwt=false, no internal check). At archive
time this was probably called manually from an admin tool or local dev. If
re-deploying, add a service-role JWT check or restrict via Supabase function
secret query param.

**Cron**: Was meant to run daily but the pg_cron job is NOT in migrations
and may never have been registered. Verify with `SELECT * FROM cron.job;`
before archiving if you want to confirm what was running.

**Env**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`
(optional — if absent, voice rendering is skipped).

## Domain: Stripe (per-user Connect)

### `connect-stripe`
**Role**: Validates a user-provided Stripe restricted API key against
Stripe's `/v1/account` and `/v1/invoices?limit=1`, then encrypts via
`encrypt_stripe_key` and upserts to `stripe_connections`.

**Key validation**: Regex `^(rk|sk)_(live|test)_[A-Za-z0-9]+`. Probes
invoice-read permission to give an actionable error if the user pasted
a key without that scope.

**Auth**: User JWT.

**Env**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`,
`STRIPE_KEY_ENCRYPTION_SECRET`.

### `disconnect-stripe`
**Role**: DELETEs the user's row from `stripe_connections`. Does NOT delete
already-imported invoices.

**Auth**: User JWT.

**Env**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`.

### `sync-stripe-invoices`
**Role**: Decrypts the user's Stripe key, fetches up to 500 (5 pages × 100)
open invoices from Stripe, imports them as local `invoices` rows with
`source='stripe'`. Idempotent via `stripe_invoice_map`. Updates existing
mapped rows, inserts new ones, skips inserts that would exceed the user's
plan limit.

**Auth**: User JWT.

**Env**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`,
`STRIPE_KEY_ENCRYPTION_SECRET`.

## Domain: Stripe (PayNudge's own subscription billing)

These use `STRIPE_SECRET_KEY` (PayNudge's account), not the user's
encrypted key.

### `check-subscription`
**Role**: Looks up the user's Stripe customer by email, checks for
active/trialing subscription, mirrors plan tier to `user_plans`.

**Drift bug**: The `planKeyMap` references old product IDs
(`prod_ULkKOb5YXF3omw` → starter, etc.) that don't match the live products
defined in `src/config/stripe.ts` (`prod_UMKTujHPntf68n` → solo,
`prod_UMKTAkSvp6iNLd` → studio). At archive time this means any real
upgrade would fall through to `'free'` in `user_plans`. See
`STRIPE_INTEGRATION.md`.

**Auth**: User JWT.

**Env**: `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

### `create-checkout`
**Role**: Creates a Stripe Checkout Session for the requested `priceId`
with a 7-day trial. Hardcodes the success/cancel redirects to
`https://app.getpaynudge.com/billing` for non-localhost / non-Lovable
origins.

**Auth**: User JWT.

**Env**: `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

### `customer-portal`
**Role**: Creates a Stripe Billing Portal session for the user. Returns
the portal URL.

**Auth**: User JWT.

**Env**: `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Domain: Admin

### `admin-stats`
**Role**: All admin-panel data. Action-dispatched via `body.action`:

- `stats` (default): total users, total invoices, tier counts, MRR, projected annual.
- `users`: list all users with profiles.
- `user-detail` (requires `userId`): profile + all invoices + active Stripe subscription for that user.
- `all-invoices`: latest 500 invoices across all users.
- `archive-activity` / `restore-activity` (requires `activityId`): toggle
  `invoice_activities.archived_at`. The only path that mutates that table.
- `logs`: latest 500 send logs + email events + activities, tagged with
  `is_admin` flag (admin user IDs / emails are pre-loaded so logs from admin
  testing are visually distinguishable from real user activity).

**Auth**: User JWT + must have `user_roles.role = 'admin'` for the calling
user.

**Env**: `STRIPE_SECRET_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

## Domain: Misc

### `verify-turnstile`
**Role**: Validates a Cloudflare Turnstile challenge token server-side
before allowing certain actions (likely the contact form, possibly signup).

**Env**: `TURNSTILE_SECRET_KEY`.

### `submit-indexnow`
**Role**: Submits URLs to the IndexNow protocol (Bing + Yandex search engines)
when content updates. Standalone, not on the email pipeline.

## `_shared` directory

| File | Used by |
| --- | --- |
| `_shared/email-templates/{signup,invite,magic-link,recovery,email-change,reauthentication}.tsx` | `auth-email-hook` |
| `_shared/transactional-email-templates/payment-reminder.tsx` | `send-transactional-email` (registered in `registry.ts`) |
| `_shared/transactional-email-templates/contact-form-notification.tsx` | `send-transactional-email` (registered, allowed anonymous via `PUBLIC_TEMPLATES`) |
| `_shared/transactional-email-templates/registry.ts` | `send-transactional-email` template lookup |

## Required Edge Function secrets (for rebuild)

If you ever rebuild this on a new Supabase project, set the following secrets
via `supabase secrets set` (or the Dashboard):

| Secret | Used by | Notes |
| --- | --- | --- |
| `LOVABLE_API_KEY` | All Lovable Email + AI Voice functions | Lovable workspace API key |
| `LOVABLE_SEND_URL` | `process-email-queue` | Optional override |
| `STRIPE_SECRET_KEY` | check-subscription, create-checkout, customer-portal, admin-stats | PayNudge's own Stripe account secret |
| `STRIPE_KEY_ENCRYPTION_SECRET` | connect-stripe, sync-stripe-invoices | Random 32-byte secret used to encrypt user-provided Stripe keys |
| `TURNSTILE_SECRET_KEY` | verify-turnstile | Cloudflare Turnstile site secret |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | (auto-injected by Supabase) | |
