# Memory: index.md
Updated: today

# Project Memory

## Core
PayNudge positioning: "The accounts-receivable autopilot for solo operators."
Pricing: 3 tiers — Free $0 (3 inv) / Solo $9 (25 inv) / Studio $29 (unlimited). NEVER reintroduce the old starter/pro/business 4-tier structure.
Differentiators (in marketing copy): integrations sync, AI in user's voice, predicted pay date. Always lead with these vs. "polite reminders."
Dark theme + lime accent (`#D7FF1E` equiv via `--primary`). Inter Tight headings 800 tight-tracking, Inter body. Sharp corners, flat surfaces.
Single SPA: marketing at root, app at /app/* (subdomain split). Lovable Cloud backend. Stripe for SaaS billing only.

## Memories
- [Positioning + competitors](mem://features/positioning) — Wedge, 5 differentiators, 3-tier pricing, Stripe legacy mapping, competitor matrix
- [Brand config](mem://features/brand) — Centralized brand constants, pricing plans, domain config
- [Design tokens](mem://design/tokens) — Lime accent, dark palette, font families
- [Domain architecture](mem://features/domain-arch) — Root = marketing, /app/* = dashboard, subdomain split at deploy time
