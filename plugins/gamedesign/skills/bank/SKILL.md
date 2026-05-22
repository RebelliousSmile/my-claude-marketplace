---
name: bank
description: Manages the 8-MINE resource registry (bank.yml). Use when initializing the project bank, refreshing resource paths after adding lore or code files, or auditing lore-vs-code integrity. Do NOT use for writing timelines or arc specs - use `dialogic-draft` instead.
---

# bank

Maintains `bank.yml`, the single source of truth for all 8-MINE resources (lore, code, personas, output styles, tracking). Two actions: `init` rebuilds or refreshes the registry from the codebase; `challenge` audits every declared path and surfaces lore-vs-code mismatches.

## Available actions

| #   | Action      | Role                                               | Input                        |
| --- | ----------- | -------------------------------------------------- | ---------------------------- |
| 01  | `init`      | Scan codebase and write/update `bank.yml`          | project root                 |
| 02  | `challenge` | Audit `bank.yml` paths and lore-vs-code integrity  | `bank.yml` (+ all referenced paths) |

## Default flow

Non-sequential. Trigger-to-action mapping:

- "init bank", "refresh bank", "update bank.yml" → `init`
- "challenge bank", "audit bank", "check bank integrity" → `challenge`

## Transversal rules

- Never edit `bank.yml` manually outside of `init` — always re-run `init` after adding a canon resource.
- `challenge` is read-only: it reports, never writes.
- All resource paths in `bank.yml` are relative to the project root.

## External data

- `aidd_docs/memory/internal/bank.yml` - the registry file this skill manages
- `aidd_docs/memory/internal/bank.yml` - pipeline overview and resource role definitions
