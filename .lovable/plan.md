

## Competitive landscape (what I found)

| Competitor | Real angle | Pricing | Weakness we can exploit |
|---|---|---|---|
| **paynudges.com** | Single $6.99 plan, "minimalist". Tiny feature set. | $6.99/mo flat | No tracking, no integrations, no segmentation. Generic. |
| **paynudge.app** | Heaviest feature set (WhatsApp via Whapi, multi-business, EN/RO, exports). EU-Romania flavor. | €0 → €29.90 → €49.90 | Pricing is steep; WhatsApp requires user's own Whapi account (friction); cluttered. |
| **paynudge.xyz** | Integration story (QuickBooks/Square/Jobber/Stripe sync) + one-tap **SMS draft from your own phone**. Trades-niche (cleaners, landscapers). | $29 flat, 14-day trial | Single plan, US/trades-coded, no free tier. |
| **paynudge.io** | Parked GoDaddy site. "Launching soon." | — | Not a real competitor. |
| **paynudge.eu** | **AI-rewritten reminders** + EU late-fee/legal-interest calculator. Lifetime €19 deal. | Free → €19 lifetime | Manual flow (copy/paste into your email client), not real automation. EU-only legal flavor. |
| **paynudge.pos-labs.com** | Philippines-targeted, generic copy, vague feature list. | "Free trial" | Regional, no depth. |

**Pattern:** they all promise "automated polite reminders." None of them combine: real automation + integrations + AI personalization + tracking + an honest free tier. Each has *one* angle. The market is fragmented and shallow — there's a clear opening for the **default professional choice in English-speaking markets**.

---

## Our positioning shift: from "another reminder app" → **"The accounts-receivable autopilot for solo operators"**

### The wedge (one sentence)

> "Connect your invoicing tool. We chase every late invoice for you in your voice — and tell you exactly when each client will pay."

Three ideas baked in that none of them have together:
1. **Connect, don't re-enter** (kill the manual data entry friction — biggest churn driver in this category).
2. **AI-personalized in your voice** (eu has AI but it's copy/paste; we make it auto-send).
3. **Predicted pay date** (nobody is doing this — a small ML/heuristic model that says "Acme typically pays 11 days late → expect ~Mar 28"). Massive perceived sophistication.

### Five concrete differentiators to build (priority order)

| # | Differentiator | Why it wins | Build effort |
|---|---|---|---|
| 1 | **Stripe / QuickBooks / Xero invoice sync** (read-only) | Removes #1 friction. paynudge.xyz has it but only on $29 plan. We ship it on free. | Medium — OAuth + ingestion edge function |
| 2 | **AI-personalized reminders ("in your voice")** — learns your tone from 2-3 sample emails you paste once, then writes every reminder in that style | eu has generic AI; we have *your* voice. Sticky moat. | Low–Medium — Lovable AI Gateway prompt with style sample |
| 3 | **Client Pay-Behavior Score + Predicted Pay Date** | Nobody else has this. Surfaces "Acme pays avg 9 days late" badge. Drives retention because it gets smarter the more invoices you log. | Medium — SQL aggregation + simple heuristic |
| 4 | **One-tap "Open SMS draft" from your phone** (mobile web → `sms:` link) | xyz's signature feature. Cheap to copy, immediately closes a feature gap. | Low — `<a href="sms:...">` link generator |
| 5 | **Public "Receivables Health" weekly email** to the user — "You're owed $X across N invoices, predicted to collect $Y this week" | Re-engagement loop. Pulls users back to the app. Brands us as the *finance* tool, not just an email-sender. | Low — cron edge function + email |

### Brand & visual differentiation

The other six all have either generic SaaS-blue or very plain layouts. We already have the **dark + lime "Quiet Authority"** direction (per `mem://design/tokens` and `.lovable/plan.md`) — that alone makes us look 2x more premium than every competitor in this list. We just need to lean harder on **trust signals** they're missing:

- **Real screenshots, not mocked tables** (replace the existing Hero illustration with a high-fidelity dashboard screenshot showing the Pay-Behavior Score — visual proof of our unique feature).
- **Live "outstanding chased today" counter** on the homepage (small, under hero — "$X recovered for users this week"). Even a static-looking ticker reads as social proof.
- **Customer voice section** with 2-3 testimonials (placeholder until we have real ones, then swap in).
- **Comparison table** ("vs. other reminder tools") — explicitly listing our integrations + AI voice + predicted pay date as ✅ vs. competitors' ❌. Aggressive but legitimate.

### Pricing repositioning

Current: Free (3) → $8 (20) → $22 (60) → $48 (unlimited). Four tiers is one too many for this market and our $22/$48 jumps look pricey vs. paynudges.com ($6.99 unlimited) and xyz ($29 unlimited).

Recommendation: **collapse to 3 tiers** that anchor against the field:

| Tier | Price | Limit | Hook |
|---|---|---|---|
| **Free** | $0 | 3 active invoices | All tracking + manual reminders |
| **Solo** | $9/mo | 25 active invoices | Auto-reminders, 1 integration, AI voice |
| **Studio** | $29/mo | Unlimited | All integrations, predicted pay dates, weekly health report, priority support |

Undercuts xyz at the high end, matches paynudges.com at the low end, but with a vastly stronger feature set than either. Drop the Business tier — it doesn't pull weight at this stage.

---

## What I'll change (file-level, one pass)

1. **`src/pages/Index.tsx`** — rewrite hero copy + add three new sections: live "$ recovered" stat strip, **Comparison table**, **Pay-Behavior Score** feature spotlight with screenshot.
2. **`src/config/brand.ts`** — collapse to 3-tier pricing (Free / Solo $9 / Studio $29).
3. **`src/pages/Pricing.tsx`** — sync to new tiers + add a comparison-vs-competitors block.
4. **`src/hooks/usePlanFeatures.ts`** — re-map feature gates to the new 3 tiers; add `aiVoice`, `integrations`, `predictedPayDate`, `weeklyHealthReport` flags (gated to Studio for now; UI placeholders, real builds in follow-up tasks).
5. **`src/pages/HowItWorks.tsx`** — reframe from generic 3-step to "Connect → We learn your voice → We predict & chase."
6. **New `src/pages/Compare.tsx`** — dedicated SEO landing page: "PayNudge vs. PayNudge.app, .xyz, .eu" — captures branded competitor searches.
7. **Memory updates** — record the positioning ("AR autopilot for solo operators"), the 5 differentiators, and the new pricing in `mem://features/positioning.md` + index.

**Out of scope this pass** (build next, in order): Stripe/QBO sync, AI-voice trainer, Pay-Behavior Score backend, weekly health report cron. This pass is **positioning + pricing + landing-page** only — the moves that get traffic to *believe* we're different. Then we build to back it up.

**Approve and I'll ship the positioning + pricing + landing changes in one pass, then we can pick which differentiator (sync, AI voice, pay-date prediction) to build first.**

