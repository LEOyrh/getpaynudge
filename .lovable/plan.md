

# Site-wide Visual Overhaul: Bold, Dark, Confident

## Design Direction (the "why")

Going for **"Quiet Authority"** — black canvas, oversized white display type, single high-saturation accent for action moments only. Psychology: black + heavy serif/grotesque type signal seriousness, expertise, financial authority (think Stripe Press, Linear, Ramp, Mercury, Patrick Collison letterhead). White type on near-black reads as confident and definitive, not aggressive. We keep generous whitespace (welcoming, premium) so it feels brave without feeling like a debt-collector.

**Accent strategy:** swap teal → **electric lime/yellow `#D7FF1E`** as a single high-contrast accent used sparingly (CTAs, "Most Popular" tag, key highlights). Lime against black is the most attention-arresting combo in fintech right now (used by Linear's marketing, modern fintech) and reads as *energy + money* without being childish.

## What changes

### 1. Design tokens (`src/index.css` + `tailwind.config.ts`)
- Default theme becomes **dark** (forced). No light mode toggle on marketing/app.
- New palette:
  - `--background`: near-black `0 0% 4%`
  - `--foreground`: pure white `0 0% 100%`
  - `--card`: `0 0% 7%` with subtle `0 0% 14%` border
  - `--primary`: lime `72 100% 56%` with **black** foreground (high-contrast CTA)
  - `--muted-foreground`: `0 0% 65%` (readable but quieter)
  - `--destructive`: `0 84% 62%`
- Font swap: headings → **"Instrument Serif"** (editorial, confident, slight literary feel — matches "we get you paid" gravitas) OR **"Inter Tight"** at 800 with tight tracking. Body stays clean grotesque: **"Inter"** instead of DM Sans (sharper, more fintech).
  - Recommendation: **Inter Tight (heading, 800, tracking-tighter) + Inter (body)** — safer, more universally bold than serif, fits "sharp + brave."
- Add a custom utility for "display" type: `text-balance`, ultra-tight tracking, oversized scale (up to `text-7xl` for hero).

### 2. Marketing site (`Index.tsx`, `MarketingLayout.tsx`, all marketing pages)
- **Hero:** Massive white headline (`text-6xl md:text-8xl`, font-weight 800, tight tracking). Drop the pill badge or restyle as bare uppercase eyebrow text (`tracking-[0.2em]`). Replace soft radial gradient with a subtle noise/grain texture + thin lime underline accent under one word.
- **CTAs:** Primary = lime button with black text, sharp corners (radius 0). Secondary = ghost with white border.
- **Sections:** Hard horizontal rules between sections instead of background color shifts. Remove `bg-secondary/30` alternating bands.
- **Cards:** Flat black with 1px white/10 border, no shadow, sharper radius. Icons in lime, not teal.
- **Header:** Black, thin border-bottom, logo monospace-style wordmark (no rounded square). Mobile nav becomes full-screen overlay.
- **Footer:** Black, oversized brand wordmark, small uppercase link labels.

### 3. Authenticated app (`AppLayout.tsx`, all `pages/app/*`)
- Same dark palette, same fonts → consistent brand experience post-login.
- Sidebar: black, lime active-state indicator (left border), uppercase nav labels.
- Cards/tables: same flat dark treatment as marketing.
- Status badges: paid = lime, overdue = red, paused = white/20.

### 4. Favicon — "simplest but dopest"
- Concept: single bold lime "P" glyph on black square, sharp corners. No icon, no envelope, no bell — just the typographic mark. Generated as inline SVG at `public/favicon.svg` (32×32, scales perfectly), plus a 180×180 `apple-touch-icon.png`.
- Delete `public/favicon.ico` (current Lovable default).

### 5. Social / SEO image
- Generate a **1200×630 OG image** (`public/og-image.png`):
  - Black background, oversized white headline "Get paid. Without asking twice." with lime accent underline, small `PayNudge` wordmark bottom-left, subtle grain.
- Wire it into `index.html` (`og:image`, `twitter:image` with `summary_large_image`) and into `usePageMeta.ts` so every page advertises it.
- Add `<meta name="theme-color" content="#0A0A0A">` for mobile browser chrome.

### 6. Remove all Lovable artifacts
- Audit + remove: `public/favicon.ico` (Lovable default), `public/placeholder.svg` (Lovable heart), the `3d5b5fc43a4b49fa9d79fb7d8a38e80f.txt` verification file (keep — that's domain verification, not Lovable branding — will confirm before deleting).
- Search codebase for any `lovable`-named imports/assets and replace.

### 7. Memory updates
- Rewrite `mem://design/tokens` with new palette + fonts.
- Update `mem://index.md` Core rules: "Dark theme only. Black bg, white text, lime `#D7FF1E` accent. Inter Tight headings 800 tight-tracking, Inter body. Sharp corners (radius 0–4px), flat surfaces, generous whitespace."

## Out of scope (intentionally)
- Copywriting changes — visual overhaul only. Headlines stay as-is unless you want a copy pass after.
- Email template restyling — separate job; will flag if you want it next.

## Files touched
**Tokens & global:** `src/index.css`, `tailwind.config.ts`, `index.html`
**Layouts:** `src/layouts/MarketingLayout.tsx`, `src/layouts/AppLayout.tsx`
**Marketing pages:** `src/pages/Index.tsx`, `Pricing.tsx`, `HowItWorks.tsx`, `FAQ.tsx`, `Contact.tsx`, `Help.tsx`, `templates/TemplatesHub.tsx` + template subpages, `Login.tsx`, `Signup.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`
**App pages:** `Dashboard.tsx`, `Invoices.tsx`, `InvoiceDetail.tsx`, `NewInvoice.tsx`, `Billing.tsx`, `AppSettings.tsx`, admin pages
**Components:** `Turnstile.tsx`, `UpgradePrompt.tsx`, `templates/TemplateLayout.tsx`, button/card variant tweaks if needed
**SEO:** `src/hooks/usePageMeta.ts` (add og:image), `index.html` (og + twitter image, theme-color, favicon refs)
**New assets:** `public/favicon.svg`, `public/apple-touch-icon.png`, `public/og-image.png`
**Delete:** `public/favicon.ico`, `public/placeholder.svg`
**Memory:** `.lovable/memory/index.md`, `.lovable/memory/design/tokens.md`

## Approve and I'll ship it in one pass.

