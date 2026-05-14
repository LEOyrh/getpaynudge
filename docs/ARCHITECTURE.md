# Architecture

## What PayNudge does (in one paragraph)

A user signs up, optionally connects their Stripe account, and PayNudge syncs
their open + overdue invoices into Supabase. For each invoice, the user can
configure a reminder cadence (e.g., 3 days before due, on due, 3/7/14 days
overdue). A pg_cron job triggers `process-reminders` daily; for any invoice
whose reminder is due today, the function renders an email — either from a
canned tone template (friendly/professional/firm) or, if the user has trained
a voice profile, in the user's own writing voice via the AI Voice Trainer —
and enqueues it. A second pg_cron job triggers `process-email-queue` every 5
seconds, which drains the queue, sends via Lovable Email (which proxies to
Mailgun), respects 429 backoff, retries with TTL/DLQ, logs every attempt,
honors the suppression list, and tracks opens + clicks via injected pixel and
wrapped payment-link redirects.

## Stack

- **Frontend**: Vite + React 18 + TypeScript + shadcn/ui + Tailwind. Domain split:
  marketing site at `getpaynudge.com`, app at `app.getpaynudge.com`.
- **Backend**: Supabase (Auth, Postgres with RLS, Edge Functions on Deno, pgmq,
  pg_cron, supabase_vault, pgcrypto, pg_net).
- **Payments — own subscriptions**: Stripe (one Stripe account, products/prices
  defined in `src/config/stripe.ts`).
- **Payments — user invoices**: Stripe Connect via per-user restricted API key
  (read-only access to that user's invoices). Keys are stored encrypted in
  Postgres using `pgp_sym_encrypt`.
- **Email**: Lovable Email API (proxies to Mailgun) with React Email templates
  rendered server-side. Three webhook surfaces: auth-email-hook (Supabase auth
  events), handle-email-suppression (bounces/complaints), handle-email-unsubscribe
  (one-click unsubscribe).
- **AI**: Lovable AI Gateway → Google `gemini-3-flash-preview` with tool-calling
  for structured output. See `AI_VOICE_SYSTEM.md`.
- **Bot challenge**: Cloudflare Turnstile (verify-turnstile Edge Function).
- **SEO ping**: IndexNow submission via submit-indexnow.

## Data flow: a reminder being sent

```
                                                     ┌──────────────────────────┐
                                                     │ pg_cron (daily)          │
                                                     │ → process-reminders      │
                                                     └──────────┬───────────────┘
                                                                │
                          for each invoice_reminders row whose trigger date is today:
                                                                ▼
                ┌────────────────────────────────────────────────────────────┐
                │ process-reminders                                          │
                │                                                            │
                │  1. Lookup voice_profiles for this user                    │
                │  2. If tone_profile + LOVABLE_API_KEY present:             │
                │     POST ai.gateway.lovable.dev (Gemini)                   │
                │     → returns { subject, body } in user's voice            │
                │  3. supabase.functions.invoke('send-transactional-email',  │
                │       { templateName: 'payment-reminder',                  │
                │         templateData: { …, voiceBody?, voiceSubject? }})   │
                └─────────────────────────────┬──────────────────────────────┘
                                              │
                                              ▼
                ┌────────────────────────────────────────────────────────────┐
                │ send-transactional-email                                   │
                │                                                            │
                │  1. Resolve template from registry (payment-reminder)      │
                │  2. Check suppressed_emails (fail-closed)                  │
                │  3. Get-or-create unsubscribe token                        │
                │  4. Render React Email → HTML + plain text                 │
                │  5. Inject open pixel + wrap payment link via              │
                │       /functions/v1/track-email-event                      │
                │  6. enqueue_email RPC → pgmq.transactional_emails          │
                │  7. INSERT email_send_log row, status='pending'            │
                └─────────────────────────────┬──────────────────────────────┘
                                              │
                                              ▼
              ┌──────────────────────────┐
              │ pg_cron (every 5 sec)    │
              │ → process-email-queue    │ (auth_emails priority, then transactional_emails)
              └──────────┬───────────────┘
                         ▼
                ┌────────────────────────────────────────────────────────────┐
                │ process-email-queue                                        │
                │                                                            │
                │  1. JWT role check: must be service_role                   │
                │  2. Read email_send_state.retry_after_until — bail if      │
                │     in cooldown                                            │
                │  3. read_email_batch RPC — claim N messages with VT=30s    │
                │  4. For each message:                                      │
                │     - drop if TTL exceeded → DLQ                           │
                │     - drop if failed ≥ 5 times → DLQ                       │
                │     - skip if already 'sent' (race with VT expiry)         │
                │     - sendLovableEmail() with payload                      │
                │     - on 429 → record retry_after_until and STOP batch     │
                │     - on 403 → emails disabled → DLQ + STOP                │
                │     - on success → INSERT log 'sent', delete_email RPC     │
                │     - on other error → INSERT log 'failed', leave in queue │
                │                                                            │
                │  Calls Lovable Email with:                                 │
                │    from: "PayNudge <noreply@getpaynudge.com>"              │
                │    sender_domain: "notify.getpaynudge.com"  (DKIM auth'd)  │
                └─────────────────────────────┬──────────────────────────────┘
                                              │
                                              ▼
                                    Mailgun → recipient inbox
                                              │
                                              ▼
                ┌────────────────────────────────────────────────────────────┐
                │ Recipient interactions                                     │
                │                                                            │
                │  • Open  → fetches /track-email-event?t=...&e=open         │
                │            → returns 1×1 GIF, INSERT email_events          │
                │  • Click → fetches /track-email-event?t=...&e=click&r=...  │
                │            → validates r vs invoice.payment_link           │
                │            → 302 redirect to stored payment_link           │
                │            → INSERT email_events                           │
                │  • Bounce/complaint → Mailgun → Lovable webhook →          │
                │            handle-email-suppression                        │
                │            → upsert suppressed_emails (blocks future sends)│
                │  • Unsubscribe link → handle-email-unsubscribe             │
                │            → upsert suppressed_emails reason='unsubscribe' │
                └────────────────────────────────────────────────────────────┘
```

## Domain split

The site runs on two subdomains served from the same Vite build:

- `getpaynudge.com` (marketing): landing page, pricing, signup CTA, legal
  pages. Robots: indexable.
- `app.getpaynudge.com` (product): authenticated dashboard, invoices, billing,
  voice trainer, admin panel. Robots: noindex.

`src/config/brand.ts` exposes `isAppDomain()` / `isMarketingDomain()` /
`isLocalDev()` helpers. Routing is the same single React app — the helpers
just gate which routes/components render. `create-checkout` hardcodes the
post-checkout redirect to `app.getpaynudge.com` (not the request's `Origin`)
to ensure the user lands in the product UI even if checkout was initiated
from the marketing site.

## Plan / tier model

Three sources of truth that **drifted** by archive time. Documented in detail
in `STRIPE_INTEGRATION.md`. The plan model itself:

| Tier | active_invoices | Source | Notes |
| --- | --- | --- | --- |
| free | 3 | `src/config/brand.ts` plans[] | Default for new users |
| solo | 25 | `src/config/brand.ts` + `stripe.ts` | Live Stripe product `prod_UMKTujHPntf68n` ($9/mo) |
| studio | -1 (unlimited) | `src/config/brand.ts` + `stripe.ts` | Live Stripe product `prod_UMKTAkSvp6iNLd` ($29/mo) |

The DB function `get_invoice_limit_for_user` enforces a limit per insert via
the `enforce_invoice_limit` trigger. **This DB function still references the
old 4-tier model (free/starter/pro/business) and would not match the live
solo/studio plans.** This was harmless at archive time because no real users
upgraded — everyone defaulted to the 'free' branch. See `STRIPE_INTEGRATION.md`
for the full drift writeup.

## Auth flow

Standard Supabase Auth (email + password). The custom Auth Email Hook
(`auth-email-hook`) intercepts the 6 transactional auth emails (signup, invite,
magiclink, recovery, email_change, reauthentication), renders them via
React Email components in `_shared/email-templates/*.tsx`, and enqueues them
on the `auth_emails` pgmq queue (priority over `transactional_emails`).

The hook is registered in the Supabase Dashboard, NOT in code or migrations.
Re-registering it on a new Supabase project requires manually pasting the
function URL + the `LOVABLE_API_KEY` as the signing secret.

The seeded admin role (`ce4e96a5-cef9-4d3e-be93-04b4e3a3a24b` in `user_roles`)
unlocks the `/admin` panel which surfaces user lists, all invoices, all email
events, MRR/tier counts, and activity log. Implemented by `admin-stats` Edge
Function + `Admin*.tsx` components on the frontend. The seeded UUID was a
dangling FK on a fresh `auth.users` table — would need a manual auth.users
INSERT or seed re-write to use a real UUID after migration.

## RLS posture

Default-deny: every table has RLS enabled and explicit policies per role.
Patterns:

- **User tables** (profiles, invoices, invoice_reminders, voice_profiles,
  user_plans): users can SELECT/UPDATE/INSERT their own rows scoped by
  `auth.uid() = user_id`. Service role has full access.
- **Audit/log tables** (invoice_activities, email_send_log, email_events):
  users can SELECT their own (joined via invoices.user_id), service role
  writes, admins SELECT all. invoice_activities also has RESTRICTIVE policies
  blocking authenticated DELETE/UPDATE — only the `admin-stats` Edge Function
  (using service role) can archive/restore via soft-delete (`archived_at`).
- **Sensitive tables** (stripe_connections, suppressed_emails,
  email_unsubscribe_tokens, user_roles): no direct user SELECT. Users see
  their stripe connection metadata only via the `stripe_connections_safe`
  view (excludes the encrypted_api_key column). user_roles has RESTRICTIVE
  policies blocking ALL client-side mutation.
- **Helper view** `client_pay_behavior` uses `security_invoker = true` so the
  underlying invoices RLS still applies — users only see aggregated stats
  for their own clients.

## Why pieces exist that look weird

- **pgmq instead of just calling Mailgun synchronously**: rate limits.
  Lovable Email returns 429 with `Retry-After`. The dispatcher records the
  cooldown in `email_send_state.retry_after_until`, and pg_cron skips runs
  during the cooldown window. Without queueing, a burst of signups would
  fail emails individually.
- **Two separate queues** (auth_emails, transactional_emails): auth emails
  are time-sensitive (signup confirmation, password reset). The dispatcher
  always drains auth_emails before transactional_emails so a backlog of
  reminders can't delay a signup.
- **TTL on queued emails** (15 min auth, 60 min transactional): if a message
  sits longer than that, the user has likely given up — better to DLQ than
  send a confusingly-late email.
- **Unique partial index on `email_send_log` where status='sent'**: defense
  against the race where pgmq's visibility timeout expires and another worker
  picks up a message that was already sent. The pre-send DB check catches
  most races; this index is the DB-level safety net.
- **`stripe_connections_safe` view + table-level no-SELECT policy**: users
  need to know if they're connected (and see last4 + sync status), but the
  encrypted key column should never leave the database. The pattern: lock
  the table to service_role only for SELECT, expose a safe view that
  excludes the secret column.
- **`encrypt_stripe_key` / `decrypt_stripe_key` SQL functions taking a
  `_secret` parameter**: the encryption key is NOT stored in the database.
  It's an Edge Function env var (`STRIPE_KEY_ENCRYPTION_SECRET`) passed in
  per-call. This means a DB dump alone is insufficient to decrypt the keys —
  an attacker also needs the Edge Function secret.
- **`tracking_id = invoiceId_messageId`**: lets us aggregate opens/clicks
  per invoice (across multiple reminder sends) AND per individual send
  (which specific reminder got opened). The split-by-underscore in
  track-email-event extracts the invoice_id for the FK insert.
- **Click redirect validates `r` against `invoices.payment_link`**: open-redirect
  defense. Without it, anyone could craft a tracking URL that redirects to a
  phishing site, riding on the legit `*.functions.supabase.co` domain.
