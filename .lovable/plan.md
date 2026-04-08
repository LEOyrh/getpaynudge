

# PayNudge — Revised Plan: Domain Architecture Clarification

## Domain Intent

You want:
- **paynudge.com** — marketing, SEO, pricing, templates, legal pages
- **app.paynudge.com** — dashboard, invoices, settings, billing (post-login)

## Reality in Lovable

Lovable deploys a **single React SPA** to one domain. We cannot natively deploy two separate subdomains from one project. Here's how we handle it:

### What we build now (single SPA, single deploy)

- All marketing routes at `/`, `/pricing`, `/how-it-works`, `/templates/*`, `/faq`, `/privacy`, `/terms`, `/contact`, `/login`, `/signup`
- All app routes at `/app/dashboard`, `/app/invoices`, `/app/invoices/new`, `/app/invoices/:id`, `/app/settings`, `/app/billing`
- Auth guards protect all `/app/*` routes
- Marketing layout (header/footer with nav) vs App layout (sidebar/topbar) are completely separate layout shells — they already feel like two different sites

### Subdomain split (when you're ready to go live)

When you connect a custom domain, you have two options:

1. **Keep it simple**: Deploy as-is to `paynudge.com`. Marketing lives at root paths, app lives at `/app/*`. Works perfectly, no extra config. Many SaaS products do this (e.g., Linear, Cal.com).

2. **True subdomain split**: Requires duplicating the project or using a reverse proxy/CDN (Cloudflare) to route `app.paynudge.com` to the same origin but rewrite paths. This is a deployment-time concern, not a code concern. The `/app/*` route prefix makes this trivial to split later.

### What this means for the plan

**No changes needed to the implementation plan.** The code structure already separates marketing vs app with distinct route prefixes and layout shells. The brand config will include both `domain` and `appDomain` constants so links/CTAs point to the right place. When deployed, a simple Cloudflare rule or future project split handles the subdomain routing.

Everything else in the 6-phase plan remains exactly as presented. Ready to start building Phase 1?

