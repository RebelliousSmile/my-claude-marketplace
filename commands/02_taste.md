---
name: 'aidd:10:taste'
description: 'Assess whether a file, plan, or document is still current or has become obsolete by comparing its claims against the actual codebase'
argument-hint: '<file-path>'
model: haiku
---

# Taste

## Goal

Determine if $ARGUMENTS is still relevant — or obsolete — by cross-referencing its claims against the current state of the codebase.

## Process

1. Read the target file
2. Extract all verifiable claims stated in the document itself: file references, component/function/variable names, line numbers, class names, colors, branch names, issue statuses, ADR references (explicit file paths or decision numbers)
   - If no extractable claims found → output `Verdict : N/A — conceptual document, no verifiable claims` and stop
3. For each claim, verify against the actual codebase (read files, grep, git branch list, tracker CLI)
   - Skip issue status claims if no tracker is detectable
4. Output verdict + evidence table

## Verdict

| Verdict | Condition |
|---|---|
| **Actuel** | ≥80% of claims match the current codebase |
| **Partiel** | 20–79% of claims match — list matched claims, then stale/missing claims |
| **Obsolète** | <20% of claims match — work already done or superseded |

## Output format

```
Verdict : Actuel | Partiel | Obsolète

| Claim | Trouvé dans le code | Statut |
|---|---|---|
| {claim} | {file:line or "non trouvé"} | ✅ Actuel / ⚠️ Modifié / ❌ Obsolète |

Conclusion : {one sentence — keep / delete / update — list which claims are stale}
```
