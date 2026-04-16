---
name: Domain architecture
description: Split-domain routing — marketing on getpaynudge.com, app on app.getpaynudge.com/app/*, DomainRouter component enforces cross-domain redirects
type: feature
---
## Domain Architecture

**Marketing domain:** https://getpaynudge.com
- Serves: /, /how-it-works, /pricing, /faq, /contact, /help, /privacy, /terms, /templates/*
- Serves auth pages: /login, /signup, /forgot-password, /reset-password

**App domain:** https://app.getpaynudge.com
- Serves: /app/dashboard, /app/invoices, /app/billing, /app/settings, /app/admin/*
- All routes under /app/* are protected (require auth)

**DomainRouter component** (src/components/DomainRouter.tsx):
- On marketing domain: redirects /app/* → app subdomain
- On app domain: redirects marketing/auth pages → marketing domain
- On app domain: bare / → /app/dashboard
- Skipped entirely on localhost/lovable.app

**Auth flow:**
1. User visits app.getpaynudge.com/app/dashboard (unauthenticated)
2. ProtectedRoute redirects to getpaynudge.com/login?returnTo=/app/dashboard
3. After login, Login.tsx redirects to app.getpaynudge.com + returnTo path
4. Supabase session cookie works cross-subdomain

**SEO:**
- All /app/* routes are noindex, nofollow
- Canonical URLs use app subdomain for app pages, root domain for marketing
- Breadcrumb schema only on marketing pages

**Stripe checkout:**
- success_url and cancel_url point to app.getpaynudge.com/app/billing

**Important:** Both domains must be connected in Lovable as custom domains. Do NOT set one as primary (that would redirect the other).
