# PayNudge

Sync Stripe. Get paid without the awkward follow-up.

PayNudge connects your Stripe account, syncs open and overdue invoices, and sends reminders in your voice until each client pays.

## Stack

- Vite + React 18 + TypeScript
- Supabase (auth, Postgres, Edge Functions, pgmq, pg_cron)
- Stripe (subscription billing + per-user connected accounts)

## Local dev

```
npm install
npm run dev
```
