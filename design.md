# Design — SwotLabs AGI

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

Built by `hallmark redesign` on 2026-07-24. Audience: enterprise data and AI
leaders at UK & EU utilities, energy, aviation and retail. Primary action: open
a conversation after reading proof. Tone: technical.

## Genre

modern-minimal, dark register. Declarative, specific, technical copy. Restraint
over decoration; the accent is a highlighter, never a colour block.

## Macrostructure family

- **Marketing pages** (`/`): **Split Studio** — every major block is a diptych,
  text on one half and proof on the other, alternating direction down the page.
  Varies only in which archetype fills the proof half.
- **Content pages** (`/work/[slug]`): **Long Document** — continuous prose with
  inline heads, a spec table for metrics, no marketing furniture.
- **App / lab pages** (`/accent-lab`): utility surface. No enrichment, no hero.

## Theme

Custom, anchored on the brand accent. The accent hue drives every neutral: the
paper, surfaces, rules and muted text all carry a trace of the anchor's chroma,
so switching accent re-tints the whole canvas rather than dropping a foreign
hue onto neutral grey.

Four accent anchors ship (`lime` is default). Hue is the only thing that moves
between them; lightness and chroma stay on the same curve.

| Anchor | Hue | Accent |
| --- | --- | --- |
| lime (default) | 130 | `oklch(82% 0.17 130)` |
| cyan | 205 | `oklch(84% 0.12 205)` |
| orange | 55 | `oklch(76% 0.16 55)` |
| blue | 260 | `oklch(68% 0.18 260)` |

Neutral ramp, where `H` is the active anchor hue:

- `--color-paper` — `oklch(14% 0.012 H)` — page canvas, never `#000`
- `--color-paper-2` — `oklch(18% 0.014 H)` — raised surface
- `--color-paper-3` — `oklch(22% 0.014 H)` — highest surface
- `--color-rule` — `oklch(30% 0.012 H)` — hairlines and borders
- `--color-neutral` — `oklch(58% 0.010 H)` — disabled, placeholder
- `--color-muted` — `oklch(74% 0.008 H)` — secondary prose
- `--color-ink` — `oklch(95% 0.008 H)` — primary text
- `--color-accent-ink` — `oklch(16% 0.02 H)` — text on an accent fill
- `--color-focus` — same value as `--color-accent`

Elevation is carried by lightness, never by shadow. No glow shadows on dark.
Accent coverage stays under 3% of any viewport.

## Typography

Three families — the 2+1 ceiling.

- **Display**: Space Grotesk, weight 700, `font-style: normal`. Tracking `-0.03em`.
- **Body**: Geist, weight 400. Line-height 1.6.
- **Outlier**: JetBrains Mono, weight 500, uppercase, tracking `0.14em`. One
  role only: **technical metadata labels** (sector tags, spec keys, field
  labels). Never body copy, never headings, never buttons.

Scale is a 1.25 major third:

- `--text-xs` 0.8rem · `--text-sm` 0.875rem · `--text-base` 1rem
- `--text-md` 1.25rem · `--text-lg` 1.5625rem · `--text-xl` 1.9531rem
- `--text-2xl` 2.4414rem · `--text-3xl` 3.0518rem
- `--text-display` `clamp(2.5rem, 4.5vw + 1rem, 5.25rem)` — 84 px ceiling

Headings contrast body by 300 weight units (400 body → 700 headings). Hero `h1`
stays at or under 50 characters. Numbers in any data role carry
`font-variant-numeric: tabular-nums`.

## Spacing

4-point named scale in `tokens.css`. Pages use named tokens, never raw values.
Section rhythm is deliberately uneven — `--space-4xl` above a section that
opens an argument, `--space-2xl` above one that continues it. Equal padding on
every section is banned.

## Motion

- Easings: `--ease-out` `cubic-bezier(0.16, 1, 0.3, 1)`, `--ease-in`
  `cubic-bezier(0.7, 0, 0.84, 0)`, `--ease-in-out` `cubic-bezier(0.65, 0, 0.35, 1)`.
- Durations: `--dur-micro` 120ms · `--dur-short` 220ms · `--dur-long` 420ms.
- **Reveal pattern: fade only.** No translate, no per-element scroll stagger
  beyond a 500 ms cap. One orchestrated entrance on first load; below the fold
  content is simply present.
- No infinite loops, no parallax, no scroll-scrubbing, no custom cursor.
- Reduced motion: opacity-only, ≤ 150 ms.

## Microinteractions stance

- Silent success. A submitted form states the outcome in place; no celebratory
  toast, no pulsing check.
- Hover tooltip delay 800 ms, focus delay 0 ms.
- Focus rings appear instantly, never transitioned, ≥ 3:1 against their
  backdrop. `outline-none` without a replacement ring is banned.
- One hover signal per element — a colour shift or a 1 px translate, not both.

## CTA voice

- **Primary**: accent fill, `--color-accent-ink` label, `--radius-control`
  (6 px), no glow shadow. Label is an imperative under three words.
- **Secondary**: 1 px rule border, ink label, same radius, same padding rhythm.
- Never two full-width buttons stacked in a hero.

## Per-page allowances

- Marketing pages: typography only. **No enrichment** — no WebGL, no ambient
  3D, no decorative blob. The type and the grid carry the page.
- Content pages: typography only.
- Lab pages: no enrichment, no hero.

## What pages MUST share

- The wordmark (Space Grotesk 700, accent on `swot`).
- The accent anchor and its ≤ 3% coverage discipline.
- The three families and the mono's single metadata role.
- CTA voice — radius, padding rhythm, fill logic.
- The section head pattern: **display heading, no eyebrow**. Eyebrows are off
  by default; a mono label is allowed only when it tags genuinely ordinal or
  tabular content, and it stacks above its heading in the same column.

## What pages MAY differ on

- Macrostructure within the page-type family.
- Which archetype fills the proof half of a diptych (spec list, logo wall,
  stat pair, quote, table).
- Section padding rhythm.

## Exports

Drop-in formats for re-using this design system in other projects. Values shown
for the default `lime` anchor (hue 130).

### tokens.css

```css
:root {
  --color-paper:      oklch(14% 0.012 130);
  --color-paper-2:    oklch(18% 0.014 130);
  --color-paper-3:    oklch(22% 0.014 130);
  --color-rule:       oklch(30% 0.012 130);
  --color-neutral:    oklch(58% 0.010 130);
  --color-muted:      oklch(74% 0.008 130);
  --color-ink:        oklch(95% 0.008 130);
  --color-accent:     oklch(82% 0.170 130);
  --color-accent-ink: oklch(16% 0.020 130);
  --color-focus:      oklch(82% 0.170 130);

  --font-display: "Space Grotesk", ui-sans-serif, system-ui, sans-serif;
  --font-body:    "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-outlier: "JetBrains Mono", ui-monospace, monospace;

  --space-3xs: 0.125rem;  --space-2xs: 0.25rem;  --space-xs: 0.5rem;
  --space-sm:  0.75rem;   --space-md:  1rem;     --space-lg: 1.5rem;
  --space-xl:  2.5rem;    --space-2xl: 4rem;     --space-3xl: 6rem;
  --space-4xl: 9rem;

  --text-xs: 0.8rem;      --text-sm: 0.875rem;   --text-base: 1rem;
  --text-md: 1.25rem;     --text-lg: 1.5625rem;  --text-xl: 1.9531rem;
  --text-2xl: 2.4414rem;  --text-3xl: 3.0518rem;
  --text-display: clamp(2.5rem, 4.5vw + 1rem, 5.25rem);

  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in:     cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;  --dur-short: 220ms;  --dur-long: 420ms;

  --rule-hair: 1px;
  --radius-control: 6px;
  --radius-panel: 10px;

  --z-base: 1;  --z-raised: 10;  --z-dropdown: 100;
  --z-sticky: 200;  --z-modal: 400;  --z-toast: 500;  --z-tooltip: 600;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper:      oklch(14% 0.012 130);
  --color-ink:        oklch(95% 0.008 130);
  --color-accent:     oklch(82% 0.170 130);
  --font-display:     "Space Grotesk", ui-sans-serif, sans-serif;
  --font-body:        "Geist", ui-sans-serif, sans-serif;
  --font-outlier:     "JetBrains Mono", ui-monospace, monospace;
  --text-display:     clamp(2.5rem, 4.5vw + 1rem, 5.25rem);
  --ease-out:         cubic-bezier(0.16, 1, 0.3, 1);
}
```

### DTCG `tokens.json`

```json
{
  "color": {
    "paper":  { "$value": "oklch(14% 0.012 130)", "$type": "color" },
    "ink":    { "$value": "oklch(95% 0.008 130)", "$type": "color" },
    "accent": { "$value": "oklch(82% 0.170 130)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Space Grotesk", "$type": "fontFamily" },
    "body":    { "$value": "Geist", "$type": "fontFamily" }
  },
  "space": {
    "lg": { "$value": "1.5rem", "$type": "dimension" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background:         14% 0.012 130;
  --foreground:         95% 0.008 130;
  --primary:            82% 0.170 130;
  --primary-foreground: 16% 0.020 130;
  --muted:              30% 0.012 130;
  --muted-foreground:   74% 0.008 130;
  --border:             30% 0.012 130;
  --input:              30% 0.012 130;
  --ring:               82% 0.170 130;
  --radius:             6px;
}
```
