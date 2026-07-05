# Write-system procedure (shared)

Followed by `define/04-write-material` (in draft mode). Writes the canonical design-system artifacts from a finalized token set. Read alongside `design-system-contract.md` (layout + sections) and `token-schema.md` (token shapes + adapter rules).

## Inputs

- A finalized token set (schema-shaped) with a responsive strategy and a component list.
- Provenance metadata: origin (reference description / brief summary), date, version.

## Process

1. **Create the design home** `design/` if absent (or the recorded sub-package root).
2. **Write `design/tokens.json`** — W3C DTCG, every required group from `token-schema.md`, `{alias}` references for semantic→ramp links. This is the source of truth.
3. **Generate `design/adapters/tokens.css`** — flatten tokens to `--group-…-name` custom properties under `:root`, resolve aliases to `var(--…)`, add the "GENERATED — do not edit" banner.
4. **Generate `design/adapters/theme.css`** — Tailwind v4 `@theme` mapping (or a v3 `tailwind.config.js` extend if the project is on v3; record which). Same banner.
5. **Write `design/design-system.md`** with the contract's required sections:
   - Provenance (origin, date, `version:` line).
   - Foundations (narrative; point to `tokens.json` for values, don't restate every number).
   - Responsive strategy (named breakpoints; mobile core / enriched-only / mobile-only — aligned with the `08-design` rules).
   - Component inventory table (component · purpose · options/variants · responsive divergence · spec file).
   - Open questions (assumptions, unresolved choices).
6. **Do not author component spec files here** — list them in the inventory; `component` writes the specs on demand.

## Atomicity

- Write `tokens.json` and regenerate **both** adapters in the same pass; never leave them inconsistent.
- If `design/tokens.json` already exists, diff against it: bump the version per the contract's rule and summarize what changed instead of silently overwriting.

## Report

- List every written/regenerated path.
- State the version and a one-line provenance.
- Surface unresolved Open questions for the user to close.
- Suggest next step: `/design:destructure` (challenge the direction) or `/design:adjust` (freeze the contract).

## Test

`design/tokens.json`, `design/adapters/tokens.css`, `design/adapters/theme.css`, and `design/design-system.md` all exist; the adapters' values match `tokens.json`; `design-system.md` has all five required sections and a `version:` line.
