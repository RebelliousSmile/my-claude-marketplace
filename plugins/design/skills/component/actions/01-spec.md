# 01 - spec

Write a reusable component's spec and register it in the inventory.

## Inputs

- `name` (required) — the component name.
- `intent` — what it's for; any known options/variants/states.
- `design/design-system.md` + `design/tokens.json`.

## Process

1. **Check the inventory** in `design-system.md`. If the component already exists, edit its spec rather than forking.
2. **Define the options model** before anything else: what varies (variant, size, booleans) and what stays fixed. Variation = options, never duplicated components. Set defaults so the bare component is usable.
3. **Fill `references/component-spec-template.md`**: purpose, anatomy, options table, states, tokens used, responsive divergence (incl. any mobile-only pattern + desktop equivalent), accessibility.
4. **Bind every value to a token** — list the exact tokens consumed; no literal colors/sizes.
5. **Write** `design/components/<name>.md`.
6. **Register/update** the component inventory row in `design/design-system.md` (purpose · options/variants · responsive divergence · spec file path).

## Outputs

`design/components/<name>.md` + an updated inventory table.

## Test

The spec lists an options model with defaults, documents the applicable states, names the tokens used (no literals), declares responsive divergence, and the inventory in `design-system.md` references the new file.
