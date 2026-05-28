# Audit checklist

Run every applicable category against the target. Each finding records: severity · location (file:line) · the violated rule · the offending snippet · the token/rule-compliant fix.

## 1 — Token discipline (`08-design/4-design-tokens`)

- [ ] **blocking** No hardcoded hex/rgb/hsl colors — must be `var(--color-…)` or a Tailwind token class.
- [ ] **blocking** No hardcoded px/rem font sizes or spacing — must come from `font.size.*` / `space.*` tokens.
- [ ] **warning** Semantic tokens used in components, not raw neutral ramps.
- [ ] **warning** Radius, shadow, border-width, motion come from tokens.
- [ ] **blocking** Adapter values match `tokens.json` (no drift); generated files unedited.
- Exception: breakpoint **px literals inside `@media` conditions** are allowed (var() is illegal there) **only if** annotated with the mirrored breakpoint token.

## 2 — Mobile-first (`08-design/1-mobile-first`)

- [ ] **blocking** Base layer has no width media query; base = mobile core.
- [ ] **blocking** No `max-width` used as the primary responsive axis.
- [ ] **warning** Breakpoints match `breakpoint.*` tokens; no ad-hoc pixel breakpoints.
- [ ] **note** Fluid `clamp()`/relative units preferred over fixed steps where reasonable.

## 3 — Progressive enrichment (`08-design/2-responsive-enrichment`)

- [ ] **blocking** Mobile core completes the task alone; no required action gated behind a breakpoint.
- [ ] **blocking** No task-critical content hidden from mobile (`display:none` on required content).
- [ ] **warning** Enriched regions are tagged (`data-enrich`/comment) and revealed via `min-width` only.
- [ ] **warning** Enrichment is additive — same IA, not a different content model.

## 4 — Mobile-only UX (`08-design/3-mobile-only-ux`)

- [ ] **warning** Each mobile-only pattern declares a desktop equivalent with the same outcome.
- [ ] **blocking** No action trapped behind a gesture with no button fallback.
- [ ] **warning** Breakpoint-switched (not user-agent sniffed).

## 5 — Components & options (`08-design/5-components-variants`)

- [ ] **warning** UI uses inventory components, not ad-hoc forks of them.
- [ ] **warning** Variation via options/props, not copy-pasted variants.
- [ ] **note** Documented states present (focus, disabled, loading, error where applicable).
- [ ] **note** Component matches its `design/components/<name>.md` spec.

## 6 — Accessibility (`08-design/6-accessibility`)

- [ ] **blocking** Body text ≥ AA (4.5:1); UI/large text ≥ 3:1.
- [ ] **blocking** Visible focus on every interactive element.
- [ ] **warning** Touch targets ≥ 44×44px on mobile.
- [ ] **warning** Semantic structure: single `<h1>`, ordered headings, landmarks, buttons-vs-links.
- [ ] **note** `prefers-reduced-motion` honored; meaningful `alt`.

## Report format

```
# Design audit — <target>
Verdict: PASS | PASS-WITH-WARNINGS | FAIL   (FAIL if any blocking)

## Blocking (N)
- <file:line> [08-design/4-design-tokens] hardcoded `#3b82f6` → `var(--color-brand-primary)`

## Warnings (N)
- …

## Notes (N)
- …

## Summary
<one line: what to fix first>
```
