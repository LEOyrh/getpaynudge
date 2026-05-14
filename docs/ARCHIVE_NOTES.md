# Archive Notes

## Why archived (2026-05)

PayNudge was live for several weeks. Outcome:

- **1 spoof signup**, no real users.
- **3 other live products with the literal name "PayNudge"** discovered in
  market research:
  - paynudge.app — "Stop Chasing Payments. Get Paid Faster." (same positioning)
  - paynudge.xyz — "Payment Reminder Software for Small Business"
  - paynudges.com — has a "How it works" page
  - Plus Paynify on the App Store (near-name)
- **Stripe ships invoice payment reminders for free** as part of Stripe
  Invoicing. PayNudge's entire value prop ("sync Stripe + send reminders")
  is a thin wrapper over what Stripe already does.
- **Crowded category** owned from above by Stripe, Bill.com, Chaser,
  Paidnice, FreshBooks, QuickBooks, Square, Jobber, Anchor, Joist, plus
  Shopify-app entrants like Kindly and Payster.
- **Migration cost was high**: 16 Edge Functions, 11 user-data tables, hard
  Lovable dependencies (Email API + AI Gateway + Auth Email Hook + DNS
  delegation), encrypted Stripe key handling, pg_cron + vault setup not in
  migrations. Roughly 5-10 hours of focused work to lift cleanly.
- **Opportunity cost** of that 5-10 hours was material: priceaura (different
  positioning, less crowded) and urbankitstudio (the highest-traction
  property) are higher-EV bets.

The decision was: don't migrate. Archive instead.

## What's salvageable

The genuinely interesting IP — worth keeping for future use — is:

- **The AI Voice System** (`docs/AI_VOICE_SYSTEM.md`). Tone profile schema,
  analyze/render prompts, tool-calling shape, 5-stage escalation, soft-fallback
  pattern. Lift this into any future product where "writing in the user's
  voice" is part of the wedge.
- **The email pipeline architecture** (`docs/EMAIL_INFRA.md`). pgmq + DLQ +
  TTL + dispatcher with rate-limit cooldown + suppression + open/click
  tracking + open-redirect-defended click validator. This is a production-grade
  email infrastructure pattern that's reusable verbatim with any email provider.
- **The encrypted-API-key storage pattern** (`docs/STRIPE_INTEGRATION.md`).
  pgcrypto + secret-in-Edge-Function-env + table-no-SELECT + safe-view-with-SECURITY-INVOKER.
  Reusable for any third-party-credential-on-behalf-of-user product
  (e.g., a future product that integrates QuickBooks / Xero / PayPal
  per-user keys).
- **The pg_cron + vault pattern** (`docs/CRON_AND_VAULT.md`). Reusable for
  any Supabase project that needs scheduled Edge Function calls with
  rotated credentials.

The generic stuff — invoice CRUD, reminder cadence config, Stripe Connect
sync, plan-tier enforcement — is reproducible from scratch in any future
product without copy-pasting from this repo.

## Post-archive cleanup checklist

These are the external touch-points that will start failing or charging
after the Lovable project is deleted. Work through them in this order to
avoid surprise charges or broken state.

### 1. Stripe (PayNudge's own account)

Do BEFORE deleting the Lovable project so no one can sign up and get billed
during the cleanup window.

- [ ] Stripe Dashboard → Products → Archive **PayNudge Solo**
      (`prod_UMKTujHPntf68n`).
- [ ] Stripe Dashboard → Products → Archive **PayNudge Studio**
      (`prod_UMKTAkSvp6iNLd`).
- [ ] Stripe Dashboard → Customers — if there are any active customers
      (the 1 spoof signup didn't pay, but verify): cancel their subscriptions
      with prorated refund.
- [ ] Stripe Dashboard → Developers → Webhooks — confirm there are no live
      webhook endpoints pointing at this project (we never wired any, but
      worth confirming).
- [ ] Optional: Stripe Dashboard → Settings → Account — leave the account
      open (it's free and tied to your business; useful for future projects).

### 2. Vercel deployment

- [ ] Vercel Dashboard → getpaynudge project → Settings → "Pause production
      deployments" (so the live site goes down but the project history is
      preserved). Alternative: `vercel remove getpaynudge` to fully delete.
- [ ] Domain bindings: `getpaynudge.com` and `app.getpaynudge.com` are
      bound to the Vercel project. Either:
      - Leave them bound to a Vercel-hosted "site archived" page
        (1-line custom HTML), or
      - Unbind from Vercel; they'll 404 until DNS is reused or expires.

### 3. DNS

- [ ] DNS provider → remove `notify.getpaynudge.com` delegation to Lovable
      nameservers. (Without this, the records keep pointing at infrastructure
      you no longer own — minor SEO/security hygiene.)
- [ ] Decide on `getpaynudge.com` and `app.getpaynudge.com`:
      - Let the domain expire at the next renewal (recommended — the name
        is shared with three other products, no point renewing).
      - Or keep registered as a defensive registration. ~$10/yr.

### 4. Supabase

- [ ] Supabase Dashboard → Project (`zplvyglorabxdufjdelh`) → Settings →
      "Pause project". Pauses billing but preserves data + schema for
      eventual deletion or restore.
- [ ] Once you're confident you won't need a DB dump: Settings → "Delete project".
      Irreversible. Data is gone.
- [ ] If you want a DB snapshot first: Dashboard → Database → Backups →
      Download (or use `pg_dump` via the connection string in Settings → Database).
      Save to a private location. The schema is in git, but the live data
      (any real or test rows) is not.

### 5. Lovable

- [ ] Lovable Dashboard → workspace settings → check the workspace billing
      tier. If you're paying for a tier that exists primarily for this
      project, downgrade.
- [ ] Lovable workspace → "Email Setup" or wherever DNS delegation was
      configured → un-delegate `notify.getpaynudge.com`.
- [ ] Lovable Dashboard → projects → delete the PayNudge project.
      This removes:
      - The Lovable Email config + sender domain registration.
      - The Lovable AI Gateway access for this project (the `LOVABLE_API_KEY`
        scoped to this workspace stops authorizing email sends + AI calls).
      - Any Supabase Auth Email Hook tied to this workspace.

### 6. GitHub

- [ ] Repo settings → archive the repository (Read-only, won't accept new
      commits). Keeps the code visible as portfolio without inviting drive-by
      contributions or issue spam.
- [ ] Optional: add a `STATUS.md` at repo root pointing at
      `docs/ARCHIVE_NOTES.md` so anyone landing on the repo immediately
      sees the archive context.
- [ ] Branch cleanup: `claude/migrate-off-lovable` was the migration prep
      branch. Either merge to main (the cleanups are decisions-agnostic and
      safe) or delete the branch — your call. The archive docs are on this
      same branch.

### 7. Other

- [ ] Cloudflare (if Turnstile was set up there) → optional: delete the
      Turnstile site key for `getpaynudge.com`. Not required — the keys
      are free and inactive once Vercel is paused.
- [ ] IndexNow — no action needed; without `submit-indexnow` being called
      after archive, search engines will gradually drop the URLs from the
      index. If you want to accelerate: use the IndexNow API directly to
      submit each URL one more time with `noindex` headers, then take
      Vercel down.
- [ ] Email aliases — if `support@getpaynudge.com` and similar were
      forwarding to your personal inbox via Cloudflare Email Routing or
      Google Workspace, decide whether to keep them up or kill the routes.

## Pre-deletion sanity check

Right before you push the "delete Lovable project" button, run these to
confirm there's no active state worth keeping:

```sql
-- Any real users?
SELECT count(*) FROM auth.users;
SELECT count(*) FROM public.profiles WHERE business_name IS NOT NULL;

-- Any real Stripe connections?
SELECT user_id, stripe_account_email, last_sync_at, invoices_synced_count
FROM public.stripe_connections;

-- Any imported invoices?
SELECT count(*) FROM public.invoices WHERE source = 'stripe';

-- Any sent emails?
SELECT count(*), template_name FROM public.email_send_log
WHERE status = 'sent' GROUP BY template_name;

-- Any cron history showing the dispatcher worked?
SELECT count(*), max(start_time)
FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-email-queue');
```

If everything returns near-zero or "1 spoof user, 0 invoices, 0 sent emails",
you're good to delete without losing anything real.

## "Could I undo this?"

For ~6 months, yes:

- The git repo + `docs/` here capture everything except live secrets and
  external account state.
- Stripe products can be un-archived (so the live Stripe IDs in `src/config/stripe.ts`
  remain reusable).
- Domain registration: as long as you renew, you can re-bind to a new
  Vercel project at any time.
- A new Supabase project gets you a fresh `project_id`; swap it in
  `supabase/config.toml` + the relevant env vars and re-deploy.
- Auth Email Hook + pg_cron + vault secret all need manual setup —
  `docs/CRON_AND_VAULT.md` and `docs/EDGE_FUNCTIONS.md` cover the steps.
- Lovable Email subscription would need to be re-established. If you want
  to skip Lovable entirely, follow the Resend swap notes in `docs/EMAIL_INFRA.md`.

After ~6 months: domain may be lost (same name + 3 competitors → unlikely
you'd want it back anyway), Stripe account state has aged, and you'd
probably rebuild from `docs/AI_VOICE_SYSTEM.md` into a different product
rather than reviving PayNudge as-was.

## Branches at archive time

| Branch | State | Notes |
| --- | --- | --- |
| `main` | Production code that was running on `getpaynudge.com` + `app.getpaynudge.com`. | |
| `claude/migrate-off-lovable` | Phase 1 cleanups + this archive documentation. Decisions-agnostic — safe to merge. | The Phase 2 migration work was never done; the branch was repurposed for archive docs. |

## Other open items at archive (won't be addressed)

These were on the open-decisions list before archive was decided. Listed
here for completeness; none need action since the project is being killed.

- Email infra: keep Lovable vs replace with Resend. → Moot.
- AI Gateway: replace `ai.gateway.lovable.dev` with direct provider. → Moot.
- Stripe product ID drift in `check-subscription`. → Documented in
  `STRIPE_INTEGRATION.md`; harmless because no real users upgraded.
- Admin UUID `ce4e96a5-cef9-4d3e-be93-04b4e3a3a24b` dangling FK on fresh
  auth.users. → Moot.
- pg_cron not in migrations. → Documented in `CRON_AND_VAULT.md` for any
  future revival.
- New Supabase projects under Leo's team needed. → Moot for getpaynudge;
  still needed for priceaura.
