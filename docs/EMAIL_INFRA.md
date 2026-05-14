# Email Infrastructure

The email pipeline is the most-built piece of PayNudge. Five Edge Functions,
two pgmq queues, two DLQs, eight tables, three external surfaces (Lovable
Email API, Lovable webhook callbacks, recipient interactions). This doc
explains how it all fits together.

## TL;DR diagram

```
                                                    Frontend / Backend
                                                          │
                                                          │ "send this email"
                                                          ▼
       ┌───────────────────────────────────────────────────────────┐
       │ send-transactional-email                                  │
       │  • resolve template from registry                         │
       │  • check suppressed_emails (fail-closed)                  │
       │  • get-or-create unsubscribe token                        │
       │  • render React Email → HTML + text                       │
       │  • inject open pixel + wrap pay-link                      │
       │  • enqueue to pgmq.transactional_emails                   │
       │  • INSERT email_send_log status='pending'                 │
       └───────────────────────┬───────────────────────────────────┘
                               │
                               │
  Supabase Auth events ────►   │   ◄──── pg_cron every 5s ────┐
                               │                              │
                               ▼                              ▼
       ┌──────────────────────────────────┐    ┌──────────────────────────┐
       │ auth-email-hook                  │    │ process-email-queue      │
       │ (HMAC-verified webhook)          │    │  • drain auth_emails     │
       │  • render React Email            │    │    then transactional    │
       │  • enqueue pgmq.auth_emails      │    │  • TTL/retry/DLQ checks  │
       │  • INSERT email_send_log pending │    │  • already-sent guard    │
       └──────────────────────────────────┘    │  • call sendLovableEmail │
                                               │  • on 429: cooldown      │
                                               │  • on 403: emails off    │
                                               │  • log + delete          │
                                               └────────────┬─────────────┘
                                                            │
                                                            ▼
                                                  Lovable Email API
                                                  → Mailgun → recipient
                                                            │
        ┌───────────────────────────────────────────────────┼───────────────────┐
        │                                                   │                   │
        ▼                                                   ▼                   ▼
  open/click on email                                bounce/complaint       unsubscribe
        │                                                   │                   │
        ▼                                                   ▼                   ▼
  GET /track-email-event           Lovable webhook → handle-email-suppression  GET /handle-email-unsubscribe
  • validate redirect              • upsert suppressed_emails                  • mark token used
  • INSERT email_events            • log to email_send_log                     • upsert suppressed_emails
```

## Lovable Email — what it actually is

Lovable Email is a hosted SMTP/HTTP send service that proxies to Mailgun
under the hood. It provides:

1. A `sendLovableEmail()` SDK (`@lovable.dev/email-js`) that takes a payload
   and posts to `https://api.lovable.dev` (overridable via `LOVABLE_SEND_URL`).
2. HMAC-signed webhook delivery for suppression events (bounces / complaints)
   and auth events.
3. A Supabase Auth Hook integration — registered in the Dashboard, points
   at `auth-email-hook` and signs the call with the same `LOVABLE_API_KEY`.
4. DKIM/SPF authentication on a sender subdomain (`notify.getpaynudge.com`)
   delegated to Lovable's nameservers.

It's NOT visible in the codebase as "the Lovable provider" — it just shows
up as `npm:@lovable.dev/email-js`, `npm:@lovable.dev/webhooks-js`, and the
`LOVABLE_API_KEY` env var. The send URL is the giveaway.

To replace with Resend: swap `sendLovableEmail()` for Resend's API call,
swap `verifyWebhookRequest()` for Resend's signature verifier (or your own
HMAC), re-delegate `notify.getpaynudge.com` DNS to Resend's required records.

## DNS / sender domain

| Record | Pointed at | Purpose |
| --- | --- | --- |
| `notify.getpaynudge.com` | Lovable nameservers | Sender subdomain — DKIM/SPF/DMARC managed by Lovable |
| `getpaynudge.com` | (your DNS host, normal A/MX) | Display domain in From header |

The `From` header reads `PayNudge <noreply@getpaynudge.com>` (root domain
for branding) but actual SMTP authentication uses `notify.getpaynudge.com`
(subdomain delegated to Lovable). This is the `display_from_root` pattern
from Lovable's email setup — better deliverability + cleaner branding.

## The two queues

| Queue | DLQ | TTL (default) | Used for |
| --- | --- | --- | --- |
| `auth_emails` | `auth_emails_dlq` | 15 min | Signup confirm, magic link, password reset, invite, email change, reauthentication. Time-sensitive. |
| `transactional_emails` | `transactional_emails_dlq` | 60 min | Payment reminders, contact-form notifications. Tolerant of delay. |

Dispatcher always drains `auth_emails` first, so a backlog of reminders
can never block a signup confirmation.

TTL config lives in `email_send_state.{auth_email_ttl_minutes,
transactional_email_ttl_minutes}`. When a message exceeds TTL, the dispatcher
moves it to DLQ with reason "TTL exceeded (X minutes)" rather than sending —
because at that point the email is more confusing than useful.

## The dispatcher's run loop

`process-email-queue` runs every 5 seconds via pg_cron. Each run:

```
1. JWT role check: must be service_role (defense in depth)
2. Read email_send_state.retry_after_until
   → if in future: return { skipped, reason: 'rate_limited' } and exit
3. For each queue ['auth_emails', 'transactional_emails']:
   3a. read_email_batch(queue, batch_size=10, vt=30)
   3b. Pre-load failed-attempt counts for these messages from email_send_log
   3c. For each message in batch:
       - If queued_at + ttl_minutes < now → moveToDlq, continue
       - If failed_attempts ≥ MAX_RETRIES (5) → moveToDlq, continue
       - If email_send_log already has status='sent' for this message_id
         → delete from queue (race with VT expiry), continue
       - Try: sendLovableEmail(payload)
         - 429 → log 'rate_limited', set retry_after_until, return early
         - 403 → moveToDlq("Emails disabled"), return early
         - other error → log 'failed', leave in queue (VT expires → retry)
         - success → log 'sent', delete from queue, count
       - sleep send_delay_ms (default 200ms) if more messages remain
4. Return { processed: count }
```

## How retries work

**Not pgmq's `read_ct`.** That counter increments for every message in a
batch claimed by a worker, including messages that were never attempted
because a 429 stopped processing early. Using it would over-count and
prematurely DLQ valid messages.

Instead, the dispatcher **counts `email_send_log` rows with status='failed'**
for each message_id. That's a true retry count: only real send-failures
increment it. After 5 failures, the message is DLQ'd.

## How rate-limiting works

Lovable Email returns 429 with a `Retry-After` header (seconds). The
dispatcher:

1. Reads `retryAfterSeconds` from the structured `EmailAPIError` (or defaults to 60).
2. Computes `now + retryAfterSeconds` and writes to `email_send_state.retry_after_until`.
3. Returns immediately (don't process the rest of the batch — they'd 429 too).

Subsequent pg_cron ticks check `retry_after_until` first and skip the run
if still in cooldown. Once the cooldown passes, dispatcher resumes from
where it left off (messages stayed in the queue with VT expired).

## How "already-sent" deduplication works

Two layers:

1. **Pre-send DB check**: For each message, query `email_send_log` for
   `(message_id, status='sent')`. If found, this message was already sent
   by another worker — skip and delete from queue.
2. **Partial unique index** `idx_email_send_log_message_sent_unique` on
   `(message_id) WHERE status='sent'`. If two workers race past the
   pre-send check, the second INSERT into `email_send_log` with status='sent'
   will fail at the DB level, preventing the inconsistent state.

This matters because pgmq's visibility timeout (30s) can expire if the
Lovable API takes that long to respond, allowing another worker to claim
the same message. Without these guards, a slow API call could result in a
duplicate send.

## Suppression flow

Triggered two ways:

### Bounces / complaints (Mailgun → Lovable webhook → us)

1. Mailgun reports a permanent bounce or spam complaint to Lovable.
2. Lovable POSTs HMAC-signed payload to `handle-email-suppression`.
3. Function `verifyWebhookRequest` checks signature + timestamp.
4. Upserts `suppressed_emails` with reason `'bounce' | 'complaint'`.
5. Inserts `email_send_log` row with status `'bounced' | 'complained'` and
   a human-readable error message ("Permanent bounce — email address is
   invalid or rejected" etc.).

### One-click unsubscribe

1. Every transactional email contains a link to
   `<supabase-url>/functions/v1/handle-email-unsubscribe?token=<token>`.
2. Recipient clicks the link.
3. Function looks up the token in `email_unsubscribe_tokens`.
4. If valid + unused: marks `used_at`, upserts `suppressed_emails` with
   reason `'unsubscribe'`, returns a confirmation HTML page.
5. If invalid: returns an error HTML page.

### Send-time check (fail-closed)

`send-transactional-email`:
- SELECT `suppressed_emails` WHERE email = recipient.
- If found: log status='suppressed', return success=false reason='email_suppressed'. Do not enqueue.
- If query errors: refuse to send (fail-closed). Don't risk emailing a
  suppressed recipient because the suppression check timed out.

## Open / click tracking

Per-send unique tracking ID format: `{invoice_id}_{message_id}`.

### Open tracking
- `send-transactional-email` injects a `<img src="...?t=<id>&e=open" />`
  before `</body>` if `templateData.invoiceId` is present.
- Recipient opens email → image fetch → `track-email-event` returns 1×1 GIF
  with `Cache-Control: no-store`, INSERTs `email_events` with `event_type='open'`.

### Click tracking + open-redirect defense
- `send-transactional-email` finds occurrences of `templateData.payLink` in
  the rendered HTML and replaces them with `...?t=<id>&e=click&r=<encoded payLink>`.
- Recipient clicks → `track-email-event` validates that `r` (querystring)
  matches `invoices.payment_link` for this invoice on origin + pathname
  exactly. If yes: 302 redirect, INSERT email_events. If no: 400.

The validation is the security gate. Without it, the URL pattern
`/track-email-event?t=...&e=click&r=https://phishing.site` would let an
attacker piggyback on PayNudge's domain to redirect victims anywhere. With
it, the only valid `r` value is the one we shipped in the email — so the
redirect can only land on what the user themselves had stored.

## Auth Email Hook (auth-email-hook)

Registered manually in Supabase Dashboard → Authentication → Hooks. NOT
in code or migrations — a fresh project will have NO auth emails at all
until this is re-registered.

### Setup steps (for rebuild)

1. Deploy `auth-email-hook` Edge Function.
2. Get the function URL: `https://<project>.functions.supabase.co/auth-email-hook`.
3. Supabase Dashboard → Authentication → Hooks → "Send Email Hook":
   - URL: paste function URL.
   - Secret: the `LOVABLE_API_KEY` value (or whatever HMAC secret you want;
     must match the function's `verifyWebhookRequest` secret).
4. Disable Supabase's default auth email sending (the hook replaces it).

### How it processes a hook event

1. Lovable posts HMAC-signed payload to function.
2. `verifyWebhookRequest` checks signature, timestamp, payload schema.
3. Map `payload.data.action_type` (signup/invite/magiclink/recovery/email_change/reauthentication)
   to a React Email template.
4. Render with template props from `payload.data` (siteName, siteUrl,
   recipient, confirmationUrl, token, email, newEmail).
5. Render to both HTML and plain text.
6. Insert `email_send_log` status='pending' (BEFORE enqueue, in case enqueue crashes).
7. `enqueue_email` to `auth_emails` queue.

### Templates

Six React Email components in `_shared/email-templates/`:

- `signup.tsx` — "Confirm your email" (signup confirmation)
- `invite.tsx` — "You've been invited"
- `magic-link.tsx` — "Your login link"
- `recovery.tsx` — "Reset your password"
- `email-change.tsx` — "Confirm your new email"
- `reauthentication.tsx` — "Your verification code"

Subjects map in `EMAIL_SUBJECTS` constant.

The `/preview` sub-route renders any template with `SAMPLE_DATA` for visual
QA. Only callable with `Authorization: Bearer ${LOVABLE_API_KEY}`.

## Transactional templates

Stored in `_shared/transactional-email-templates/`:

| File | Registered as | Notes |
| --- | --- | --- |
| `payment-reminder.tsx` | `payment-reminder` | Supports `voiceBody` / `voiceSubject` override. See `AI_VOICE_SYSTEM.md`. |
| `contact-form-notification.tsx` | `contact-form-notification` | Has fixed `to` recipient — listed in `PUBLIC_TEMPLATES` set, so callable anonymously. |

### Adding a new template

1. Create `_shared/transactional-email-templates/<name>.tsx`. Default-export
   nothing — instead, export a `template` const matching the `TemplateEntry`
   interface from `registry.ts`:
   ```ts
   export const template = {
     component: MyEmail,
     subject: 'My email subject', // or (data) => `Subject ${data.x}`
     to: 'fixed@recipient.com',   // optional; if set, recipientEmail is ignored
     displayName: 'My email',
     previewData: { ... },
   } satisfies TemplateEntry
   ```
2. Import + register in `_shared/transactional-email-templates/registry.ts`:
   ```ts
   import { template as myTemplate } from './my-template.tsx'
   export const TEMPLATES = {
     'payment-reminder': paymentReminder,
     'contact-form-notification': contactFormNotification,
     'my-template': myTemplate,
   }
   ```
3. If the template has a fixed recipient AND should be callable without
   user JWT, add the name to `PUBLIC_TEMPLATES` in `send-transactional-email/index.ts`.

## Required env / secrets summary

| Secret | Owner | Purpose |
| --- | --- | --- |
| `LOVABLE_API_KEY` | Lovable workspace | API key + webhook signing secret. Used by `auth-email-hook`, `process-email-queue`, `handle-email-suppression`, `preview-transactional-email`, `voice-trainer`, `process-reminders`. |
| `LOVABLE_SEND_URL` | Optional | Override the Lovable send endpoint. Default `https://api.lovable.dev`. Used by `process-email-queue` only. |

## Replacing Lovable Email with Resend (cost analysis)

If the future-you decides to lift this whole pipeline elsewhere:

1. **`process-email-queue`** — replace `sendLovableEmail(payload, { apiKey, sendUrl })`
   with Resend's API call. Resend takes `{ from, to, subject, html, text }` and
   returns `{ id }`. Map `payload` accordingly. Resend rate-limits at 10
   req/s by default — adjust `send_delay_ms` to >= 100ms.
2. **`auth-email-hook`** — Resend doesn't have a webhook for "render this
   auth email for me" the way Lovable does. Two options:
   - Keep auth emails in Supabase's built-in flow (free, deliverability OK).
   - Wire your own custom auth email function: implement Supabase's
     "Send Email Hook" with Resend's REST send instead of Lovable's SDK.
     The function shape stays mostly the same; just swap the SDK call.
3. **`handle-email-suppression`** — Resend has webhook events for
   `email.bounced`, `email.complained`, `email.delivered`. Verify with
   Resend's `Svix-Signature` HMAC. Rest of the function (upsert
   `suppressed_emails`, log) is unchanged.
4. **DNS** — un-delegate `notify.getpaynudge.com` from Lovable, add Resend's
   required CNAME/TXT records (DKIM + SPF + DMARC). Resend's dashboard walks
   you through this.
5. **No code changes needed** in `send-transactional-email`,
   `handle-email-unsubscribe`, `track-email-event`, or any of the templates.
   They're provider-agnostic.

Estimated effort: 2-3 hours including DNS propagation wait.
