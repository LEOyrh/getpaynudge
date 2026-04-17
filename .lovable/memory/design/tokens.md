---
name: design-tokens
description: Dark-only palette, lime accent, Inter Tight typography, sharp corners
type: design
---
# Design Tokens — "Quiet Authority"

## Theme
Dark only. Forced via `class="dark"` on `<html>`. No light mode.

## Palette (HSL)
- `--background`: `0 0% 4%` (near-black #0A0A0A)
- `--foreground`: `0 0% 100%` (pure white)
- `--card`: `0 0% 7%`
- `--border`: `0 0% 14%`
- `--primary`: `72 100% 56%` (electric lime #D7FF1E) — used sparingly for CTAs, highlights, active states
- `--primary-foreground`: `0 0% 4%` (black on lime for max contrast)
- `--muted-foreground`: `0 0% 65%`
- `--destructive`: `0 84% 62%`

## Typography
- Headings: **Inter Tight** weight 800, `tracking-tightest` (-0.04em). Use `text-display` utility for hero-scale.
- Body: **Inter** weight 400-500.
- Monospace (rare): **JetBrains Mono**.
- Eyebrows / nav / buttons: `text-eyebrow` utility — uppercase, `tracking-[0.15em–0.2em]`, font-semibold.

## Shape
- Radius: `0.25rem` base. Sharp corners are the brand signal — avoid `rounded-full` for non-pill UI, avoid `rounded-xl/2xl`.
- Cards: flat black `bg-card`, 1px `border-border`, no shadow.
- Buttons: lime primary (black text), ghost-outline secondary with `border-foreground/20`.

## Accents & Effects
- `lime-underline` utility: thick lime underline behind text for emphasis (one word per page max).
- Subtle grain overlay (`body::before`, opacity 0.025) for premium texture.
- Sections separated by hard `border-t border-border` rules — no alternating background bands.

## Iconography
- `lucide-react` only. Lime = active/highlight. White/60 = default. No teal anywhere.

## Don'ts
- No teal `166 72% 34%` (legacy) anywhere.
- No `bg-secondary/30` section bands.
- No DM Sans / Plus Jakarta Sans (legacy fonts).
- No rounded squares for the logo — wordmark + lime square dot only.
