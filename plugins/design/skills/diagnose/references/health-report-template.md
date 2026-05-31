# Design health report — <project>

> Produced by `diagnose/01-diagnose`. Read-only diagnosis of a production codebase with no clean design system.

## Headline

- **Design-system maturity**: none / ad-hoc / partial / tokenized.
- **Core trio status**: palette, type, icon set — coherent or scattered (one line each).
- **Top 3 risks**: …

## Sprawl metrics

| Dimension | Distinct values found | Healthy target | Verdict |
|---|---|---|---|
| Colors (hex/rgb/hsl) | e.g. 47 | ~1 ramp + semantics (~15) | overgrown |
| Font families | | 1–2 | |
| Font sizes | | a scale (~6–8) | |
| Spacing values | | one scale (~8–10) | |
| Radii | | ~4 | |
| Shadows | | ~4 | |
| Breakpoints | | 3–4 named | |

## By category (mirrors `08-design`)

- **Tokens (1)**: hardcoded-value density — % of CSS declarations using literals vs. variables; biggest offenders (file:line).
- **Mobile-first (2)**: count of `max-width`-first media queries; base-layer media queries; ad-hoc breakpoints.
- **Enrichment (3)**: content hidden from mobile that looks task-critical; non-additive divergence.
- **Mobile-only UX (4)**: gesture-only actions without fallback.
- **Components (5)**: duplicated/forked components (near-identical files); inline one-off styles.
- **Iconography (7)**: emoji used as icons (list locations — blocking smell); mixed icon sets.
- **Accessibility (6)**: contrast failures, missing focus styles, sub-44px targets, heading/landmark issues.

## De-facto tokens (reverse-engineered)

The most-used values per dimension — the implicit system the code already leans on, and the cleanest candidate to crystallize.

## Verdict

PASS-WITH-WARNINGS / NEEDS-WORK / CRITICAL, with the single most important thing to fix first.
