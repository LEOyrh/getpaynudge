# PayNudge — Archive Documentation

> **Status:** Archived 2026-05. This documentation was extracted from the running
> Lovable + Supabase deployment immediately before the Lovable project was deleted.
> The git history is the canonical source for everything not captured here; these
> docs exist to describe the **runtime configuration, infrastructure dependencies,
> and IP that aren't visible in source alone** (vault secrets, pg_cron schedules,
> external service wiring, Lovable-specific glue, drift between code and live state).

## Why these docs exist

The Lovable platform owned several things that are NOT recoverable from `git pull`:

- The `LOVABLE_API_KEY` secret used by the email pipeline AND the AI Voice gateway.
- The Auth Email Hook registration (Supabase Dashboard → Authentication → Hooks)
  that points `auth.users` events at `auth-email-hook`.
- DNS delegation of `notify.getpaynudge.com` to Lovable's nameservers for
  email sending domain authentication.
- A `pg_cron` job (`process-email-queue`) that runs every 5 seconds with a
  vault-stored service-role key.
- An AI Gateway endpoint (`ai.gateway.lovable.dev`) that proxied requests to
  `google/gemini-3-flash-preview` with Lovable-managed billing.
- The Stripe Live products and prices (Stripe Dashboard).

After the Lovable project is deleted, all of the above stop working. These docs
let a future reader (you, a contractor, an LLM) understand exactly what was
running so they can either (a) rebuild it on neutral infra, or (b) understand
*why* something in the source code is wired the way it is.

## File map

| File | Contents |
| --- | --- |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | System overview, data flow, tier/plan model. Start here. |
| [`SUPABASE_SCHEMA.md`](./SUPABASE_SCHEMA.md) | Every table, enum, function, trigger, view, queue, vault secret. The DB ground truth. |
| [`EDGE_FUNCTIONS.md`](./EDGE_FUNCTIONS.md) | All 19 Edge Functions: role, deps, env vars, JWT verification gate. |
| [`AI_VOICE_SYSTEM.md`](./AI_VOICE_SYSTEM.md) | The salvageable IP: voice trainer prompts, tool schemas, tone profile, render pipeline. |
| [`STRIPE_INTEGRATION.md`](./STRIPE_INTEGRATION.md) | Two integrations: per-user Connect (read invoices) + own subscription billing (charge users). Includes drift notes. |
| [`EMAIL_INFRA.md`](./EMAIL_INFRA.md) | Lovable Email + pgmq queue + dispatcher + suppression + unsubscribe + open/click tracking. |
| [`CRON_AND_VAULT.md`](./CRON_AND_VAULT.md) | pg_cron schedule, vault secret pattern, why neither is in migrations. |
| [`ARCHIVE_NOTES.md`](./ARCHIVE_NOTES.md) | Why archived, what's salvageable for future projects, post-archive cleanup checklist. |

## How to read this

If you're rebuilding PayNudge or salvaging pieces for a different product:

1. Read `ARCHITECTURE.md` for the mental model.
2. Read `AI_VOICE_SYSTEM.md` — that's the only piece worth lifting wholesale.
3. Skim `EDGE_FUNCTIONS.md` to see what each function does and whether you need it.
4. Use `SUPABASE_SCHEMA.md` as a reference when reading SQL migrations.

If you're auditing what existed at archive time:

1. Read `ARCHIVE_NOTES.md` for the post-archive checklist (Stripe products to
   disable, DNS to remove, Supabase project to pause).
2. Cross-reference `STRIPE_INTEGRATION.md` and `EMAIL_INFRA.md` for the external
   services that need to be wound down.
