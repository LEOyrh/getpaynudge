# Project Memory

## Core
PayNudge micro-SaaS. Teal primary (166 72% 34%). DM Sans body, Plus Jakarta Sans headings.
Split-domain SPA: getpaynudge.com = marketing + auth, app.getpaynudge.com = authenticated app (no /app prefix).
Post-login redirects to app.getpaynudge.com/dashboard. Lovable Cloud backend. Stripe for billing.

## Memories
- [Brand config](mem://features/brand) — Centralized brand constants, pricing plans, domain config
- [Design tokens](mem://design/tokens) — Teal accent, white/charcoal palette, font families
- [Domain architecture](mem://features/domain-arch) — Split-domain: marketing on root, app on app.* subdomain, DomainRouter enforces boundaries
