---
name: Domain architecture
description: Split-domain routing — marketing on getpaynudge.com, app on app.getpaynudge.com (no /app prefix), DomainRouter enforces cross-domain redirects
type: feature
---
## Domain Architecture

**Marketing domain:** https://getpaynudge.com
- Serves: /, /how-it-works, /pricing, /faq, /contact, /help, /privacy, /terms, /templates/*
- Serves auth pages: /login, /signup, /forgot-password, /reset-password

**App domain:** https://app.getpaynudge.com
- Serves: /dashboard, /invoices, /billing, /settings, /admin/*
- NO /app prefix — routes are at root level on the subdomain
- All routes are protected (require auth)

**DomainRouter component** (src/components/DomainRouter.tsx):
- On marketing domain: redirects app paths (/dashboard, /invoices, etc.) → app subdomain
- On marketing domain: strips legacy /app/* prefix and redirects to app subdomain
- On app domain: redirects marketing/auth pages → marketing domain
- On app domain: bare / → /dashboard
- Skipped entirely on localhost/lovable.app

**Auth flow:**
1. User visits app.getpaynudge.com/dashboard (unauthenticated)
2. ProtectedRoute redirects to getpaynudge.com/login?returnTo=/dashboard
3. After login, Login.tsx redirects to app.getpaynudge.com + returnTo path
4. Supabase session cookie works cross-subdomain

**SEO:**
- All app routes are noindex, nofollow
- Canonical URLs use app subdomain for app pages, root domain for marketing
- Breadcrumb schema only on marketing pages

**Stripe checkout:**
- success_url and cancel_url point to app.getpaynudge.com/billing

**Important:** Both domains must be connected in Lovable as custom domains. Do NOT set one as primary.
