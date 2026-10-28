# Explain

Explain a PowerShell concept or pattern using real examples found in the current project.

## Inputs

- `topic` (required) — concept, pattern, or code excerpt (e.g. "non-terminating errors", "default encoding", "ShouldProcess", "why does this catch not fire")
- `path` (optional, default: current directory) — where to search for examples

## Process

### Step 1 — Identify the concept

| Category | Examples |
|---|---|
| Errors | terminating vs non-terminating, `-ErrorAction`, `try`/`catch`, `$Error` |
| Encoding | default encoding of writes and reads, BOM, `-Encoding` |
| Pipeline | objects vs text, `ForEach-Object`, `Where-Object`, output vs `Write-Host` |
| Scope | `$script:`, `$global:`, dot-sourcing, function scope |
| Native commands | `$LASTEXITCODE`, argument passing, `$PSNativeCommandUseErrorActionPreference` |
| Functions | `[CmdletBinding()]`, parameters, `SupportsShouldProcess`, `-WhatIf` |
| Strict mode | `Set-StrictMode`, undefined variables and properties |
| Hosts | Windows PowerShell 5.1 vs PowerShell 7, `#Requires`, syntax gated by host |

### Step 2 — Search the project for an example

Search `*.ps1` and `*.psm1` for the concept, within the `sniff` bound and exclusions. Pick the most illustrative real example (domain logic over boilerplate). None found: use an invented snippet in the project's style.

### Step 3 — Explain

1. **One-line definition**
2. **Why it exists** — the problem it solves, or what it protects against
3. **The project example** — real code, annotated inline
4. **Key rules** — 3 to 5 bullets: when to use, when not, common mistakes
5. **Run it** — the faulty code and its output on the targeted host, then the corrected code and its output, per the transversal rules

### Step 4 — Offer practice

End with:

```
---
Want to consolidate this with a practice exercise? Say "practice [topic]".
```
