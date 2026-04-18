---
name: positioning
description: Wedge, differentiators, competitor landscape, and 3-tier pricing for PayNudge
type: feature
---
**Wedge:** "The accounts-receivable autopilot for solo operators." One-liner: "Connect your invoicing tool. We chase every late invoice for you in your voice — and tell you exactly when each client will pay."

**5 differentiators (priority order):**
1. Stripe / QuickBooks / Xero invoice sync (read-only OAuth, on free tier)
2. AI-personalized reminders trained on user's own past emails ("in your voice")
3. Client Pay-Behavior Score + predicted pay date per invoice
4. One-tap `sms:` draft on mobile
5. Weekly Receivables Health email digest

**Pricing (3 tiers — replaced 4-tier starter/pro/business):**
- Free $0 — 3 active invoices, tracking, manual reminders
- Solo $9/mo — 25 invoices, auto cadence, AI voice, 1 integration
- Studio $29/mo — unlimited, all integrations, predicted pay dates, weekly health report

**Stripe product mapping (legacy reuse):** solo → old "starter" product, studio → old "pro" product. Old "business" product redirects to studio.

**Competitor positioning** (rendered on `/compare` and Pricing page comparison table):
- paynudges.com — $6.99 minimalist, no tracking/integrations
- paynudge.app — EU/Romania flavor, WhatsApp via Whapi, cluttered, expensive (€29.90/€49.90)
- paynudge.xyz — US trades niche, $29 flat, no free tier, has integrations + SMS
- paynudge.io — parked
- paynudge.eu — AI rewrites but copy/paste only (no real automation), EU legal angle, €19 lifetime
- paynudge.pos-labs.com — Philippines regional, generic

**Out of scope (build next):** Stripe/QBO sync OAuth, AI-voice trainer, Pay-Behavior Score backend (SQL aggregations + heuristic), weekly health report cron edge function, mobile `sms:` draft links.
