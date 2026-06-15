# Deviation ledger — template (copycat P3 mechanism)

> "DRY/SOLID-reusable first, pixel-identical otherwise" degenerates into laxity without a
> trace. A tolerated visual deviation — where reusable/clean CSS is deliberately chosen
> over matching the mockup pixel-for-pixel — MUST have an entry here. **No entry → the
> default is render-strictly-identical** (the deviation is treated as drift and fixed).
>
> Where a deviation maps to a contract component, cross-reference it: add
> `deviation_refs: [<id>...]` on that component in `components.json` so the **fidelity
> gate** (not the vocabulary lint) can tell a sanctioned deviation from accidental drift.
> The charter (`design-system.md`) LINKS here; it does not duplicate entries.

## Entry format

Each deviation is one entry. `id` is stable and referenced from `components.json`.

```
### DEV-<NNN> — <short title>

- date:          <YYYY-MM-DD>
- component:     <component key in components.json>  (or — if token-only)
- selector(s):   <mockup selector ↔ contract selector>
- breakpoint:    <mobile | tablet | desktop | all>
- mockup value:  <prop = value>
- contract value:<prop = value>   (what ships instead)
- justification: <why the deviation buys SOLID/DRY/reusable CSS — concrete, not "cleaner">
- gate evidence: <QA method + measured delta, e.g. "fidelity gate: lede fontSize 16→17px, +1px, accepted to keep one fluid scale token">
- approver:      <name>
```

## Example

```
### DEV-001 — Hero lede uses the shared fluid type scale

- date:          2026-06-15
- component:     c.hero-lede
- selector(s):   .page-hero__lede ↔ .mau-section--hero p.has-md-font-size
- breakpoint:    mobile
- mockup value:  fontSize = 16px
- contract value:fontSize = 17px (clamp from the shared body scale)
- justification: the mockup hand-tuned 16px on mobile only; adopting the single fluid
                 body token (clamp 16→19px) removes a one-off breakpoint override and
                 keeps every lede on one scale. +1px at 375 is below perceptual threshold.
- gate evidence: fidelity gate, mobile, lede fontSize delta +1px, no other prop affected.
- approver:      FX
```

## Index (optional quick scan)

| id | component | breakpoint | prop | mockup → contract | approver |
|----|-----------|------------|------|--------------------|----------|
| DEV-001 | c.hero-lede | mobile | fontSize | 16 → 17px | FX |
