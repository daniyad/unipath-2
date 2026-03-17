# STYLEGUIDE.md

## Design Language — Student × University Platform

> **One line:** Campus life, built with precision. Not an IT department.

---

## Design Principles

**High contrast, low noise** — Black, white, and one accent. Every element earns its place.

**Data at scale** — Lead with numbers, stats, and real proof. People trust platforms that show their work.

**Flat and fast** — No gradients, no heavy shadows, no decoration for its own sake. Speed is a feature.

**Expressive but grounded** — Bold typography does the heavy lifting. Color is reserved for action.

**Knows when to be serious** — Clean and calm in transactional spaces, confident in social ones.

---

## Colors

Black, white, and Tiger Yellow. That's the palette. No exceptions.

```css
/* Backgrounds */
--bg-base: #ffffff; /* Pure white — always the page background */
--bg-surface: #ffffff; /* Cards, modals */
--bg-subtle: #f5f5f5; /* Alt sections, input fills, sidebar */

/* Primary — Black */
--primary-900: #000000; /* Nav, buttons, headings, key UI */
--primary-700: #111111; /* Body text, secondary black surfaces */
--primary-400: #888888; /* Muted text, icons, placeholders */
--primary-200: #cccccc; /* Borders, dividers, disabled */
--primary-100: #f5f5f5; /* Subtle backgrounds */

/* Accent — Tiger Yellow */
--accent-500: #f5c100; /* Logo on dark, CTAs, notification dots */
--accent-400: #e0ae00; /* Yellow hover state */
--accent-100: #fef8d0; /* Yellow tint backgrounds */

/* Text */
--text-primary: #000000;
--text-secondary: #888888;
--text-disabled: #cccccc;

/* Borders — always 0.5px */
--border-default: #e5e5e5;
--border-strong: #cccccc;

/* Semantic */
--success: #2db87a;
--error: #e5484d;
```

**Rules:**

- Pure white is always the page background.
- Sections alternate white / `--bg-subtle` for rhythm.
- Black is structure and action. Use it for nav, buttons, headings.
- Yellow is reserved for one moment per view — a CTA, a logo, a badge. Never body text, never decorative fills.
- No gradients. No colored decorative areas. Let type carry the weight.

---

## Typography

One font family: DM Sans. Tight letter-spacing on display sizes. No decorative or editorial typeface — clarity over character.

```css
--font-body: 'DM Sans', system-ui, sans-serif;
```

| Role       | Size | Weight  | Letter Spacing |
| ---------- | ---- | ------- | -------------- |
| Hero       | 56px | 700     | -0.04em        |
| H1         | 40px | 700     | -0.03em        |
| H2         | 28px | 600     | -0.02em        |
| H3         | 20px | 600     | -0.01em        |
| Body       | 15px | 400     | 0              |
| Small / UI | 13px | 400–500 | 0              |
| Stat       | 28px | 700     | -0.05em        |
| Labels     | 11px | 500     | +0.08em (caps) |

**Rules:** Tight negative tracking on all display sizes is intentional. Max ~68 chars per line for body. Center only short hero taglines — everything else is left-aligned.

---

## Spacing & Radius

**Spacing scale (4px base):** `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

```css
--radius-sm: 4px; /* Tags, chips, badges */
--radius-md: 6px; /* Buttons, inputs */
--radius-lg: 10px; /* Content cards */
--radius-xl: 16px; /* Modals */
--radius-full: 9999px; /* Avatars, pills */
```

Cards use 24px minimum inner padding. Corners are clean — not bubbly.

---

## Key Components

**Navigation Bar**
Always black (`--primary-900`). Logo mark in `--accent-500` (yellow) on dark. Nav links in white at 75% opacity. Primary CTA: solid white fill, black text, `--radius-md`, weight 600. Secondary action: ghost "Log In" with 0.5px white border. Sticky on scroll, always fully opaque.

**Cards**
White surface, 0.5px `--border-default`, `--radius-lg`, 24px padding. Lead with a name or stat prominently. One clear action per card. Hover: 2px lift + faint shadow increase. No colored card fills.

**Buttons**

- Primary: `--primary-900` fill, white text, `--radius-md`, weight 600. Hover: softens to `#111`.
- Secondary: transparent, 1.5px `--primary-900` border, black text. Hover: `--bg-subtle` fill.
- Yellow CTA: `--accent-500` fill, `--primary-900` text, `--radius-md`, weight 600. Hover: `--accent-400`. One per view maximum.
- Ghost: transparent, 0.5px `--border-default`, `--text-secondary`. For low-priority actions like "Log in".
- All buttons: `scale(0.97)` on press.

**Avatars**
Always circular (`--radius-full`). No photo: black circle, white initials, weight 500. Never a gray silhouette.

**Tags / Chips**
`--bg-subtle` background, 0.5px `--border-default`, `--radius-sm`. 11px, uppercase, weight 500, letter-spacing: 0.06em. Yellow variant: `--accent-100` bg, 0.5px `--accent-500` border.

**Inputs**
`--bg-subtle` fill, 1.5px `--border-default`, `--radius-md`, 36px height. Focus: `--primary-900` border + faint black outer ring (box-shadow).

**Stat / Metric Cards**
`--bg-subtle` background, no border, `--radius-md`, 16px padding. Oversized stat number (DM Sans 700, -0.05em tracking) above a small-caps label. Grid of 2–4. These are proof — show real numbers.

---

## Borders

Always 0.5px. Never 1px or 2px except for the one featured/highlighted card in a comparison set (2px `--primary-900` border for that case only). Borders use `--border-default` (`#e5e5e5`) by default, `--border-strong` for emphasis. No colored borders outside the yellow chip variant.

---

## Motion

Fast feels respectful.

```css
--ease-default: cubic-bezier(0.16, 1, 0.3, 1); /* Most transitions */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Rare delight moments */

--duration-fast: 150ms; /* Hovers, color changes */
--duration-default: 250ms; /* Cards, dropdowns */
--duration-enter: 350ms; /* Modals, page transitions */
```

Always wrap in `prefers-reduced-motion`.

---

## Section Backgrounds

White (`#ffffff`) and off-white (`#f5f5f5`) only. Alternate for rhythm. Black surfaces: nav bar and footer only. No large mid-page black fills.

---

## Voice & Tone

Direct. Clear. Data-confident. Not chatty, not corporate.

| ❌ Don't                | ✅ Do                                |
| ----------------------- | ------------------------------------ |
| "No data available"     | "Nothing here yet — check back soon" |
| "An error has occurred" | "Something went wrong. Try again?"   |
| "Operation successful"  | "Done! You're all set."              |
| "Get started"           | "Set up your profile"                |

---

## What This Is Not

- ❌ A university portal — no institutional serifs, no navy/gold
- ❌ A LinkedIn clone — no data-dense rows, no achievement flexing
- ❌ A generic SaaS dashboard — no sidebar-dominated chrome
- ❌ Cookie-cutter edtech — no mascots, no gamification badge walls
- ❌ A gradient-heavy consumer app — flat surfaces only

---

_Living document — update as the product evolves._
