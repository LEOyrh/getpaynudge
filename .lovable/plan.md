

# Plan: Go-Live Readiness — Contact Form, Expanded FAQ, Help Docs, Email Tracking, and Cleanup

## Current State Assessment

**Built and working:**
- Marketing site (homepage, how it works, pricing, templates, privacy, terms)
- Auth (signup, login, forgot/reset password)
- Invoice CRUD with payment link field
- Reminder automation (process-reminders edge function)
- Billing with Stripe (checkout, subscription check, customer portal)
- Admin panel (users, invoices, finance)
- SEO basics (OG tags, schema markup, robots.txt, canonical)
- Dashboard with stats

**Missing or needs fixing (from OG prompt + your requests):**

### 1. Contact form is fake
The current Contact page uses a `setTimeout` to fake a send. It doesn't actually deliver the message anywhere. Need to wire it to actually send an email to `support@getpaynudge.com` via the transactional email system.

### 2. FAQ needs expansion — more self-service troubleshooting
Current FAQ has ~13 questions across 4 categories. Need to add:
- **Getting Started**: How to create your first invoice, how to set up reminders, what happens after signup
- **Using the App**: How to pause/resume reminders, how to mark paid, how to add a payment link, how to edit an invoice, what statuses mean
- **Troubleshooting**: Reminder didn't send, client says they didn't get the email, how to change reminder schedule, invoice limit reached
- **Account**: How to change email, how to delete account, how to update business name

### 3. No help/documentation page
Create a `/help` or `/docs` page with a quick-start guide:
- Step 1: Create your account
- Step 2: Add your first invoice (with payment link)
- Step 3: Reminders are set automatically
- Step 4: Track activity and mark paid
- Include screenshots/descriptions of key UI areas

### 4. Support email — simple approach
Add `support@getpaynudge.com` as the visible support channel across the app. Add a help link in the app sidebar. No on-call or live chat needed for now.

### 5. Open & click tracking for reminder emails
Currently referenced on the homepage, How It Works, and Pricing pages but NOT built. Two options:

**Option A (Recommended for MVP):** Remove tracking claims from marketing pages (already partially done in brand.ts but not in Index.tsx, HowItWorks.tsx, Pricing.tsx). Be honest about what's built.

**Option B (Build it):** Implement tracking via:
- A tracking pixel endpoint (edge function) that logs opens
- Wrapping payment links through a redirect endpoint that logs clicks
- New `email_events` table for open/click events
- Dashboard cards for open rate and click rate

### 6. Pricing page still lists unbuilt features
`Pricing.tsx` feature comparison table still shows "Open tracking", "Click tracking", "Team access", "Priority support" — need to clean those up to match the updated `brand.ts`.

### 7. Index.tsx still claims "Open & Click Tracking"
Feature card on homepage still promotes this.

### 8. HowItWorks.tsx still mentions "Open and click tracking"

---

## Proposed Plan

### Step 1: Wire up Contact form
- Create a `contact-form` edge function that sends the message to `support@getpaynudge.com` via the transactional email system
- Update Contact.tsx to call it

### Step 2: Expand FAQ
- Add 15–20 more FAQs covering Getting Started, Using the App, Troubleshooting, and Account management
- Use accordion-style collapsible sections for better UX

### Step 3: Create Help/Quick Start page
- New `/help` route under MarketingLayout
- Sections: Getting Started, Managing Invoices, Reminders, Billing, Account
- Written as practical how-to content, not marketing fluff
- Link from app sidebar ("Help" link) and marketing footer

### Step 4: Add support touchpoints
- Add "Help" link to app sidebar
- Add support email in app footer/settings
- Ensure Contact page is linked from app and marketing

### Step 5: Clean up unbuilt feature claims
- Remove "Open & Click Tracking" feature card from Index.tsx
- Remove tracking mentions from HowItWorks.tsx
- Remove tracking/team rows from Pricing.tsx comparison table
- Replace with features that ARE built (e.g., "Payment link in reminders", "Activity timeline")

### Step 6: Build email open & click tracking (if you want it)
This is a significant feature. If you want it now:
- Create `email_events` table (invoice_id, event_type, timestamp, metadata)
- Create `track-email-event` edge function (tracking pixel for opens, redirect for clicks)
- Update `send-transactional-email` to inject tracking pixel and wrap payment links
- Update Dashboard to show open/click rates

---

## Questions for you

I want to confirm one thing before proceeding:

