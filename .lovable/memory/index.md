# Project Memory

## Core
PayNudge micro-SaaS. **Dark only**: bg #0A0A0A, white text, electric lime accent #D7FF1E (HSL 72 100% 56%) used sparingly.
Inter Tight 800 tracking-tightest for headings, Inter for body. Sharp corners (radius 0.25rem). Flat surfaces, no shadows.
Hard `border-t border-border` rules between sections — never alternating bg bands.
Split-domain SPA: getpaynudge.com = marketing + auth, app.getpaynudge.com = authenticated app (no /app prefix).
Post-login redirects to app.getpaynudge.com/dashboard. Lovable Cloud backend. Stripe for billing.

## Memories
- [Brand config](mem://features/brand) — Centralized brand constants, pricing plans, domain config
- [Design tokens](mem://design/tokens) — Dark palette, lime accent, Inter Tight, sharp corners, "Quiet Authority" direction
- [Domain architecture](mem://features/domain-arch) — Split-domain: marketing on root, app on app.* subdomain, DomainRouter enforces boundaries
