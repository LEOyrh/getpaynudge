

# Plan: Admin Panel, Billing UI Fixes, and Pay Link Field

## What you asked for (grouped)

1. **Admin panel** — pages to manage all users/customers, view all invoices, debug customer issues, and a finance dashboard (subscription counts by tier, projected MRR)
2. **Billing page fixes** — align Subscribe buttons, make feature lists progressive ("Everything in Starter, plus…"), remove unbuilt features (Open & click tracking, Team access, Priority/Dedicated support)
3. **Pay link field** — add a `payment_link` column to invoices and a field on the New Invoice form; pass it through to reminder emails

---

## 1. Admin Panel

### Admin access control
- Create a `user_roles` table with RLS and a `has_role()` security-definer function (per project guidelines)
- Insert a row granting `admin` role to `admin@getpaynudge.com`
- Create an `AdminRoute` wrapper component that checks `has_role` via an edge function or a simple RPC call
- Skip subscription checks for admin users in AuthContext

### Admin pages (under `/app/admin/*`)
- **Users** (`/app/admin/users`) — list all profiles with email, signup date, subscription tier (fetched via an edge function that calls Stripe). Search/filter.
- **User Detail** (`/app/admin/users/:id`) — profile info, subscription status, all invoices for that user
- **All Invoices** (`/app/admin/invoices`) — paginated table of every invoice across all users with filters (status, date range, user)
- **Finance Dashboard** (`/app/admin/finance`) — cards showing: total users, subscribers by tier (Starter/Pro/Business), MRR, projected annual revenue. Uses an edge function that queries Stripe subscriptions.

### Edge function: `admin-stats`
- Authenticated + admin-role check
- Queries Stripe for active subscriptions, groups by product ID, returns tier counts + MRR
- Queries the `profiles` table for total user count

### Sidebar
- Add an "Admin" section in the sidebar (only visible to admin users) with links to Users, Invoices, Finance

---

## 2. Billing Page & Pricing Fixes

### Update `src/config/brand.ts` plan features
Remove unbuilt features and make lists progressive:

- **Starter**: "Up to 10 active invoices", "Custom reminder schedule", "3 reminder tones", "Activity timeline", "Email support"
- **Pro**: "Up to 50 active invoices", "Everything in Starter", "Pay link in reminders" (this is built), "Priority email support"
- **Business**: "Unlimited active invoices", "Everything in Pro", "Dedicated email support"

Remove: "Open & click tracking", "Team access", "Dedicated support" (as standalone), "Priority support" (replaced with clearer wording)

### Fix button alignment in `Billing.tsx`
- Use `flex flex-col justify-between h-full` on each card so the Subscribe button is always pinned to the bottom regardless of feature list length

---

## 3. Pay Link Field

### Database migration
```sql
ALTER TABLE public.invoices ADD COLUMN payment_link text;
```

### New Invoice form (`NewInvoice.tsx`)
- Add optional `payment_link` field (URL input) to the form schema and UI
- Save it on insert

### Invoice Detail (`InvoiceDetail.tsx`)
- Display the payment link if present
- Pass `payLink` to `send-transactional-email` when sending reminders (the email template already supports it)

### Process-reminders function
- Check if the existing `process-reminders` edge function passes `payLink` — if not, update it to include `invoice.payment_link`

---

## Implementation order
1. Database migration (add `payment_link` column + `user_roles` table + `has_role` function + seed admin role)
2. Update brand config (fix plan features)
3. Fix Billing page card alignment
4. Add pay link to New Invoice form and Invoice Detail
5. Create `admin-stats` edge function
6. Create admin pages (Users, Invoices, Finance)
7. Add admin sidebar links + AdminRoute guard

