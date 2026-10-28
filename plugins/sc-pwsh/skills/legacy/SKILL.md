---
name: legacy
description: >-
  Detect PowerShell constructs that the host a script declares rejects, then migrate them file by file after confirmation.
author: François-Xavier Guillois
version: 0.1.0
vibe_version: ">=1.0.0"
permissions:
  - bash
  - files
tags:
  - scripting
  - audit
  - powershell
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

# sc-pwsh Legacy

Finds constructs that fail on the host a script declares (7-only syntax in a script that runs on Windows PowerShell 5.1, or a 5.1-only parameter in a script for 7), then migrates them one file at a time.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | List constructs rejected by the declared host, each with the host that rejects it and its file | current directory, optional target host |
| 02 | `migrate` | Apply the portable form to each confirmed entry, verify the parse after each file | scan manifest |

## Default flow

Always sequential: `scan` → `migrate`.

1. `scan` reads the host each file declares (via `sniff`), parses the files with that host's own parser, and emits a manifest.
2. `migrate` applies the manifest file by file, after confirmation.

## References

- `references/powershell-versions.md` — measured host differences, each entry tied to a measurement row.

## Transversal rules

- Report only constructs listed in `references/powershell-versions.md`. A difference that was not measured is outside the scan. A parse error that matches no row is a defect, reported as a plain parse error and never migrated.
- Each entry names the construct, the file, and the host that rejects it. A host whose binary is absent yields **not verified**, never a deduced result.
- The target host is the one the file declares. Undetermined: ask for the target, or report against both hosts with every entry `INFO` and the assumption named.
- Never remove a working construct without giving its portable form inline.
- Show a diff and ask for confirmation before writing. Nothing is modified without it.
- One file at a time; re-parse each file after modification and stop on a new parse error.
- Never touch `.git`, `node_modules`, `.venv`, `venv`, `site-packages`.
