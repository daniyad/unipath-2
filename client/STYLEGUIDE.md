# STYLEGUIDE.md

## Design Language — Student × University Platform

> **One line:** Feels like campus life built it, not an IT department.

---

## Design Principles

**People over platform** — Faces, names, and communities lead. Data supports.

**Warm, not sterile** — Off-white backgrounds, soft shadows, a little texture. Lived-in, not clinical.

**Expressive but grounded** — Bold typography and confident color, but every screen has one clear focus. No visual noise.

**Delightful in the details** — Hover states, empty states, and transitions are not afterthoughts. They're where personality lives.

**Knows when to be serious** — Casual in social spaces, clear and calm in transactional ones.

---

## Colors

Anchored in a **warm cream base**, a **deep indigo** as the brand primary, and **amber** for moments of delight.

```css
/* Backgrounds */
--bg-base: #f7f4ef; /* Warm cream — never use pure white as a page bg */
--bg-surface: #ffffff; /* Cards, modals */
--bg-subtle: #efece6; /* Sidebar, input backgrounds */

/* Primary — Indigo */
--primary-700: #3d2fa0; /* Buttons, active states, key links */
--primary-500: #5b4fcf; /* Hover, focus rings */
--primary-100: #edeafb; /* Chip/tag backgrounds, subtle tints */

/* Accent — Amber (use sparingly) */
--accent-500: #f5a623; /* CTAs, notification dots, celebration */
--accent-100: #fef6e4; /* Toast backgrounds, warm empty states */

/* Text */
--text-primary: #1a1523;
--text-secondary: #5c5470;
--text-disabled: #a89ec0;

/* Borders */
--border-default: #ddd8ee;
--border-strong: #b8b0d4;

/* Semantic */
--success: #2db87a;
--error: #e5484d;
```

**Rules:**

- `--bg-base` is always the page background. The warmth is intentional.
- Indigo is for action — don't fill large decorative areas with it.
- Amber is for joy — one CTA or notification dot per view, not paragraph text.

---

## Typography

**Display (headings):** `Bricolage Grotesque` — editorial, characterful, campus-magazine energy.
**Body / UI:** `DM Sans` — warm, readable, approachable.

```css
--font-display: 'Bricolage Grotesque', system-ui, sans-serif;
--font-body: 'DM Sans', system-ui, sans-serif;
```

| Role       | Size | Weight  | Font           |
| ---------- | ---- | ------- | -------------- |
| Hero       | 56px | 800     | Bricolage      |
| H1         | 40px | 700     | Bricolage      |
| H2         | 28px | 700     | Bricolage      |
| H3         | 20px | 600     | DM Sans        |
| Body       | 15px | 400     | DM Sans        |
| Small / UI | 13px | 400–600 | DM Sans        |
| Labels     | 11px | 600     | DM Sans (caps) |

**Rules:** `letter-spacing: -0.02em` on Hero and H1. Max ~68 chars per line for body. Center only short hero taglines — everything else is left-aligned.

---

## Spacing & Radius

**Spacing scale (4px base):** `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

```css
--radius-sm: 6px; /* Inputs, small chips */
--radius-md: 12px; /* Buttons, small cards */
--radius-lg: 16px; /* Content cards */
--radius-xl: 24px; /* Modals, featured cards */
--radius-full: 9999px; /* Avatars, tags, pills */
```

Cards need `24px` minimum inner padding. Rounded but not bubbly.

---

## Key Components

**Cards** are the core unit — they should feel like social posts, not data rows. Lead with a visual, show the person's name prominently, one clear action on hover.

**Buttons** use `--radius-md`, weight 600, `DM Sans`. Primary = `--primary-700`. On hover: darken + subtle indigo glow.

**Avatars** are always circular. No photo? Show initials on a warm gradient — never a gray silhouette.

**Tags / Chips** — `--primary-100` background, `--radius-full`, 11px uppercase caps, weight 600.

**Inputs** — `--bg-subtle` fill, `1.5px` border. On focus: `--primary-500` border + `--primary-100` outer glow.

---

## Motion

Fast feels respectful. Expressive animation is saved for meaningful moments.

```css
--ease-default: cubic-bezier(0.16, 1, 0.3, 1); /* Most UI transitions */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Delight moments */

--duration-fast: 150ms; /* Hovers, color changes */
--duration-default: 250ms; /* Cards, dropdowns */
--duration-enter: 350ms; /* Modals, page transitions */
```

Card hover: lifts `2px` + shadow increase. Button press: scales to `0.97`. Always wrap in `prefers-reduced-motion`.

---

## Voice & Tone

Write like a person, not a system.

| ❌ Don't                | ✅ Do                                |
| ----------------------- | ------------------------------------ |
| "No data available"     | "Nothing here yet — check back soon" |
| "An error has occurred" | "Something went wrong. Try again?"   |
| "Operation successful"  | "Done! You're connected."            |
| "Get started"           | "Set up your profile"                |

Tone: direct, warm, low-stakes casual. Smart without being smug.

---

## What This Is Not

- ❌ A university portal — no institutional serifs, no navy/gold, no stock campus photos
- ❌ A LinkedIn clone — no data-dense rows, no achievement-flexing layouts
- ❌ A generic SaaS dashboard — no sidebar-dominated interfaces with tiny content areas
- ❌ Cookie-cutter edtech — no cartoon mascots, no excessive gamification badges

---

_Living document — update as the product evolves._
