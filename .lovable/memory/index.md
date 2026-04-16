# Project Memory

## Core
PayNudge micro-SaaS. Teal primary (166 72% 34%). DM Sans body, Plus Jakarta Sans headings.
Split-domain SPA: getpaynudge.com = marketing, app.getpaynudge.com = authenticated app under /app/*.
Auth pages on marketing domain. Post-login redirects to app.getpaynudge.com/app/dashboard.
Lovable Cloud backend. Built-in email. Stripe for SaaS billing only.

## Memories
- [Brand config](mem://features/brand) — Centralized brand constants, pricing plans, domain config
- [Design tokens](mem://design/tokens) — Teal accent, white/charcoal palette, font families
- [Domain architecture](mem://features/domain-arch) — Split-domain: marketing on root, app on app.* subdomain, DomainRouter enforces boundaries
