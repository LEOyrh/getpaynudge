---
name: IndexNow auto-trigger
description: After ANY SEO-affecting change (sitemap.xml, robots.txt, index.html JSON-LD/meta, usePageMeta.ts canonical/structured-data logic, new marketing/template route), call submit-indexnow edge function to ping Bing/Yandex
type: preference
---
## IndexNow auto-trigger rule

After editing any SEO-affecting file, ALWAYS call the `submit-indexnow` edge function (no body = pings all known URLs) to notify Bing/Yandex.

**Triggers (re-ping required):**
- `public/sitemap.xml`
- `public/robots.txt`
- `index.html` (title, meta, JSON-LD)
- `src/hooks/usePageMeta.ts` (canonical, structured data, robots logic)
- Any new marketing or `/templates/*` route added to App.tsx
- Any change to plan pricing in `src/config/brand.ts` (mirrored in JSON-LD)

**How:** `supabase--curl_edge_functions` POST `/submit-indexnow` with empty body `{}`.

**Key file:** `public/4fe07780644e47d2b82d48fc5258fc7e.txt` must exist and match the `KEY` constant in `supabase/functions/submit-indexnow/index.ts`. If rotating the key, update both and warn the user that frontend Publish is required before the next IndexNow call will pass key validation.

**Caveat to surface to user:** sitemap/index.html/usePageMeta changes only go live after Publish. IndexNow ping should happen after publish, not before — but pinging immediately is harmless (search engines re-fetch on their own schedule).
