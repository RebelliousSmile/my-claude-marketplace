---
name: sniff
description: >-
  Detect PowerShell scripts, the host each one targets (Windows PowerShell 5.1 or PowerShell 7), and the test and lint tools in use, without a manifest.
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

# sc-pwsh Sniff

PowerShell stack detector and pivot manifest producer. Read-only.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scan` | Find PowerShell files within a depth bound, report the host each file declares, the tools detected and the gaps, and emit the capability pivot manifest | current directory |

## Default flow

`scan`.

## Conceptual model

- PowerShell has no project manifest. The project root is not readable: the scan starts from the user's current directory and stops at a written depth bound.
- A **host** is the runtime a script targets: Windows PowerShell 5.1 (Desktop) or PowerShell 7 (Core). The two diverge on encoding, syntax, native-command arguments and several defaults, so the host is reported **per file**, never summed into a project verdict.
- A **capability pivot** is the PowerShell knowledge `sc-pwsh:audit` loads at audit time (`skills/sniff/references/capabilities/powershell/idioms.md`). It is never installed to the project.
- Project conventions (strict mode, dry-run default, `#Requires` habits) belong to the project's own memory, not to a pivot.

## Transversal rules

- If no `*.ps1` or `*.psm1` exists within the bound, abort with an explicit message and write nothing.
- Never write, move or execute a scanned file. The scan reads text only.
- A file beyond the bound is reported as **not scanned**, never as absent.
- Read only host signals whose effect was measured. A signal without a measured effect is not read, and the host stays **undetermined**.
- Report tools as facts (Pester, PSScriptAnalyzer), not as pivots. Report gaps: a capability detected without a matching plugin pivot.
