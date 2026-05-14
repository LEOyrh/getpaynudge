# Stripe Integration

Two completely separate Stripe integrations live in this codebase. Don't
confuse them.

## Integration 1: per-user Stripe Connect (read user's invoices)

**Purpose**: A PayNudge user pastes their own Stripe restricted API key,
PayNudge reads their open + overdue invoices and imports them locally so
reminder cadences can be configured.

**Stripe account**: The user's own Stripe account. PayNudge does not have
Connect onboarding — the user creates a restricted key in their own Stripe
Dashboard with `Invoices: Read` permission and pastes it.

**Storage**: `stripe_connections` table.
- `encrypted_api_key bytea` — the restricted key, encrypted via
  `pgp_sym_encrypt(plaintext, server_secret)`. Server secret is the
  Edge Function env var `STRIPE_KEY_ENCRYPTION_SECRET` (NOT in the database).
- `api_key_last4 text` — last 4 chars (e.g., "ABCD") for safe display.
- `stripe_account_id text` — `acct_*` from `/v1/account`.

**Wire**:
1. User clicks "Connect Stripe" in the app → posts the key to `connect-stripe`.
2. `connect-stripe` validates the key against `/v1/account` and probes
   `/v1/invoices?limit=1` to confirm the read scope.
3. If valid, calls `encrypt_stripe_key()` SQL function → stores the bytea.
4. User can later trigger `sync-stripe-invoices`, which calls
   `decrypt_stripe_key()`, paginates Stripe `/v1/invoices?status=open`,
   and imports up to 500 invoices, idempotent via `stripe_invoice_map`.
5. User can disconnect via `disconnect-stripe` (deletes connection row;
   imported invoices stay).

**Functions**: `connect-stripe`, `disconnect-stripe`, `sync-stripe-invoices`.

**Security pattern**: The encryption secret is held by Edge Functions, not
the database. A leaked DB dump is insufficient — an attacker also needs the
Edge Function env. The `stripe_connections_safe` view (used by the frontend)
excludes the encrypted column entirely, so even an RLS bypass via the table
can't leak it to the client.

## Integration 2: PayNudge's own subscription billing (charge users)

**Purpose**: Charge users for PayNudge subscriptions (Solo $9/mo, Studio $29/mo).

**Stripe account**: PayNudge's own. Account ID visible in the Dashboard URL:
`acct_1TJltnAJV5JIDaSe`.

**Functions**: `check-subscription`, `create-checkout`, `customer-portal`,
`admin-stats` (for MRR/tier counts).

**Auth**: `STRIPE_SECRET_KEY` env var (one shared secret across all functions).

**Trial**: 7-day free trial baked into `create-checkout` via
`subscription_data.trial_period_days = 7`.

**Webhooks**: NONE wired. Subscription state is pulled on-demand by the
frontend (which calls `check-subscription` post-checkout and on the billing
page). Means a downgrade or cancellation isn't reflected in `user_plans`
until the user next hits the billing page. For a real product this should
be replaced with a Stripe webhook into a `stripe-webhook` Edge Function
that updates `user_plans` synchronously.

## The 3-source plan-tier drift

This is the bug that's been on the open-decisions list. It's **harmless at
archive time** because no real users upgraded — everyone defaulted to the
'free' tier path. But if you re-launch this code, fix this first.

There are three sources of truth for "what plans exist", and they don't agree:

### Source 1: `src/config/brand.ts` `plans[]` (the marketing landing page truth)

```ts
plans = [
  { id: "free",   name: "Free",   price: 0,  activeInvoices: 3 },
  { id: "solo",   name: "Solo",   price: 9,  activeInvoices: 25,  highlighted: true },
  { id: "studio", name: "Studio", price: 29, activeInvoices: -1 },
]
```

### Source 2: `src/config/stripe.ts` (the live Stripe products)

```ts
stripePlans = {
  solo:   { productId: "prod_UMKTujHPntf68n", priceId: "price_1TNboLAJV5JIDaSeXraEH73v" },
  studio: { productId: "prod_UMKTAkSvp6iNLd", priceId: "price_1TNbokAJV5JIDaSegGPDQmcP" },
}
```

This matches the live Stripe Dashboard at archive time (2 active products).

### Source 3a: `check-subscription` (Edge Function plan key map)

```ts
const planKeyMap: Record<string, string> = {
  "prod_ULkKOb5YXF3omw": "starter",
  "prod_ULkKBYqnmDokUG": "pro",
  "prod_ULkKetWVQnfmPl": "business",
};
```

These product IDs **do not exist** in the live Stripe account — they were
the IDs of an older 4-tier plan layout (free/starter/pro/business) that was
later replaced with the current 3-tier (free/solo/studio). When this function
runs against a real subscription, the productId won't match any key, and
`planKey` falls through to `'free'`.

### Source 3b: `get_invoice_limit_for_user()` SQL function

```sql
RETURN CASE COALESCE(_plan, 'free')
  WHEN 'business' THEN -1
  WHEN 'pro'      THEN 60
  WHEN 'starter'  THEN 20
  ELSE 3 -- free
END;
```

Same drift: knows the OLD 4-tier names. Does NOT know about `'solo'` or
`'studio'`. A user with `user_plans.plan_key = 'solo'` would fall through
to `3` (free tier), so the `enforce_invoice_limit_trigger` would block them
at 3 active invoices despite paying for 25 (Solo) or unlimited (Studio).

### Why this never bit anyone

`check-subscription` always wrote `'free'` (because no live productId matched
the planKeyMap). So `user_plans.plan_key` was always `'free'`. So
`get_invoice_limit_for_user` returned 3 for everyone. The trigger consistently
enforced the free-tier limit. The marketing site advertised 25 / unlimited
for Solo / Studio, but no one actually subscribed to test the broken path.

### How to fix (if rebuilding)

Three coordinated edits:

1. **`check-subscription` planKeyMap** → use the current product IDs:
   ```ts
   const planKeyMap = {
     "prod_UMKTujHPntf68n": "solo",
     "prod_UMKTAkSvp6iNLd": "studio",
   }
   ```
2. **New SQL migration** to update `get_invoice_limit_for_user`:
   ```sql
   CREATE OR REPLACE FUNCTION public.get_invoice_limit_for_user(_user_id UUID)
   RETURNS INTEGER LANGUAGE plpgsql STABLE SECURITY DEFINER
   SET search_path = public AS $$
   DECLARE _plan TEXT;
   BEGIN
     IF public.has_role(_user_id, 'admin'::app_role) THEN RETURN -1; END IF;
     SELECT plan_key INTO _plan FROM public.user_plans WHERE user_id = _user_id;
     RETURN CASE COALESCE(_plan, 'free')
       WHEN 'studio' THEN -1
       WHEN 'solo'   THEN 25
       ELSE 3
     END;
   END; $$;
   ```
3. **(Highly recommended)** Wire a Stripe webhook → `stripe-webhook` Edge
   Function that updates `user_plans` on `customer.subscription.created |
   updated | deleted` events. Stop relying on the frontend to call
   `check-subscription` to keep the DB in sync.

## Domain handling for billing redirects

`create-checkout` hardcodes the success/cancel redirects:

```ts
const billingBase = origin.includes("localhost") || origin.includes("lovable.app")
  ? origin
  : "https://app.getpaynudge.com";
```

So a checkout initiated from `getpaynudge.com` (marketing) lands the user
on `app.getpaynudge.com/billing` post-checkout, not back on the marketing
domain. Localhost dev and Lovable preview URLs preserve the origin so the
flow works in dev.

## Live Stripe products at archive (2026-05)

From the live Dashboard `https://dashboard.stripe.com/acct_1TJltnAJV5JIDaSe/products?active=true`:

| Product | productId | priceId | Price |
| --- | --- | --- | --- |
| PayNudge Solo | `prod_UMKTujHPntf68n` | `price_1TNboLAJV5JIDaSeXraEH73v` | $9/mo |
| PayNudge Studio | `prod_UMKTAkSvp6iNLd` | `price_1TNbokAJV5JIDaSegGPDQmcP` | $29/mo |

Disable both at archive — see `ARCHIVE_NOTES.md` checklist.

## Required Stripe scopes (for the per-user Connect side)

The user-pasted restricted key needs:

- **Invoices: Read** (mandatory — `connect-stripe` probes for this)
- **Customers: Read** (used by `sync-stripe-invoices` when invoice rows
  lack `customer_name`/`customer_email` and need to fetch the customer
  object directly)

Anything more is optional. PayNudge never writes back to the user's Stripe
account — it's read-only.
