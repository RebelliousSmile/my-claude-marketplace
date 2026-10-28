---
name: teach
description: >-
  Explain PowerShell language behaviour (errors, encoding, pipeline, scope, native commands) in the current project context, with output actually run on the targeted host.
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

# sc-pwsh Teach

Contextual teaching for PowerShell. Finds examples of the requested concept in the current project, explains the theory with those examples as anchors, then offers a short practice exercise to consolidate understanding.

Scope: the language and its tooling. System administration cmdlets (managing Windows itself) are out of scope.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `explain` | Explain a concept or pattern using project code examples | topic or code excerpt |
| 02 | `practice` | Generate a targeted exercise based on project patterns | topic or previous explain |

## Default flow

Non-sequential — dispatch based on user intent:

- "explain / how does / what is / difference between / show me / why does" → `explain`
- "practice / exercise / quiz / test me / challenge me" → `practice`
- Ambiguous → `explain`, then offer `practice` at the end

## Transversal rules

- Always search the project for a real example of the concept before explaining.
- If none exists, explain with a minimal invented snippet in the project's style, and say it is invented.
- Keep theory brief — real code carries more weight than prose. State a rule only if `../sniff/references/capabilities/powershell/idioms.md` or `../legacy/references/powershell-versions.md` holds it, or after running it on the host; otherwise say it was not verified.
- For any language behaviour (terminating or non-terminating errors, default encoding, object pipeline, scope, `$LASTEXITCODE` of native commands): show the faulty code **with its output, run in the scratchpad on the targeted host**, then the corrected code. Never quote an output from memory.
- Name the host (Windows PowerShell 5.1 or PowerShell 7) each behaviour belongs to. When it differs between hosts, show both outputs. The targeted host is the one the project's scripts declare (`/sc-pwsh:sniff`); undetermined means ask, or show both.
- If the host's binary is absent, say the output was not run and give none.
- After `explain`, always offer `practice`.
- After `practice`, provide the solution and link back to the project example.
