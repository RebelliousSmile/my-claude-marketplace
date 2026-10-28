# PowerShell Version Reference

Host differences used by `01-scan`. Every rejection and difference was **measured** on Windows PowerShell 5.1.22621.4249 and PowerShell 7.6.9 (Windows) and cites its measurement row `[Fn.m]` (task journal of 2026-10-28). A construct without a row here is never reported. A portable form is given only when it was measured too; otherwise the cell says so and the choice is left to the user. Other versions and non-Windows hosts were not measured.

A file's host comes from `sniff` `scan`: `both` includes 5.1, so a construct rejected by 5.1 is a failure for it. `undetermined` also includes 5.1 but every entry for it is `INFO`, with the assumption named. Error messages are localized: match an `ErrorId` or an exception type.

## Rejected by Windows PowerShell 5.1

| Construct | Failure on 5.1 | Portable form | Row |
|---|---|---|---|
| `??`, `??=` | parse error — the script does not run | `if ($null -eq $v) { … } else { $v }` for `??` [F2.17]; `??=` form not measured | [F2.1, F2.7] |
| Ternary `cond ? a : b` | parse error | not measured — left to the user | [F2.3] |
| `&&`, `\|\|` between pipelines | parse error | not measured — `;` plus a test of `$?` does not have the same semantics; left to the user | [F2.4, F2.5] |
| `?.` / `?[` after `${name}`, a property access (`$o.A?.B`, `$o.A?[0]`) or a parenthesised expression (`(Get-Item .)?.Name`) | parse error | not measured — left to the user | [F2.10–F2.15] |
| `ForEach-Object -Parallel` | parses; **fails at run time** (parameter set unresolved) — the parser cannot reveal it | plain `ForEach-Object` — same output on both [F2.18] | [F2.6, F2.18] |
| `Get-Content -AsByteStream`, `Set-Content -AsByteStream` | unknown parameter | on 5.1: `-Encoding Byte`, which 7 rejects — a script running on both needs a branch on `$PSVersionTable.PSEdition` | [F9.4, F9.10, F9.16, F9.17] |
| `Join-Path a b c` (three segments) | positional-parameter error | `Join-Path (Join-Path a b) c` — identical result on both hosts | [F9.7, F9.18] |
| `Get-Date -AsUTC` | unknown parameter | `(Get-Date).ToUniversalTime()` — `Kind` is `Utc` on both | [F9.8, F9.19] |
| `ConvertFrom-Json -AsHashtable` | unknown parameter | none measured; without the switch the result is a `PSCustomObject` on both | [F9.9, F9.21] |

`?.` or `?[` after a **bare variable** (`$name?.Prop`) is not the operator: it reads a variable named `name?` on both hosts. Never report it. [F2.2, F2.8, F2.16]

## Rejected by PowerShell 7

This table applies to a file that 7 must accept: `7 only`, `both`, or `undetermined` (`INFO`). The table above applies to a file that 5.1 must accept: `5.1 only`, `both`, or `undetermined` (`INFO`).

| Construct | Failure on 7 | Portable form | Row |
|---|---|---|---|
| `-Encoding Byte` on `Get-Content` / `Set-Content` | `Byte` is not an encoding | on 7: `-AsByteStream`, which 5.1 rejects — a script running on both needs a branch on `$PSVersionTable.PSEdition` | [F9.4, F9.10, F9.16, F9.17] |
| `#Requires -PSEdition Desktop` | refused to start | — | [F8.4] |

## Different behaviour, no failure

| Construct | 5.1 | 7 | Row |
|---|---|---|---|
| `ConvertTo-Json` on a structure deeper than 2 levels, no `-Depth` | truncates **silently** | truncates with a warning | [F9.6] |
| `ConvertTo-Json -Depth 5` on 4 levels | complete | complete, identical | [F9.20] |

Pass an explicit `-Depth` whenever the data can be nested.

## Compatibility functions, informational

`Get-WmiObject` and `Get-EventLog` are cmdlets on 5.1 and **compatibility functions** on 7 under Windows; both run on both hosts. [F9.1, F9.2, F9.13, F9.14] Do not report them as rejected. Their availability off Windows was not measured: state it as unverified.

## Behaviours owned by the idioms pivot

Encoding of writes and reads (F1), arguments passed to native executables (F6) and `$PSNativeCommandUseErrorActionPreference` (F5.5, F5.7) diverge without failing. Their rules live in `../../sniff/references/capabilities/powershell/idioms.md`; `scan` points to them and does not restate them.

## Not measured

Replacements such as `Get-CimInstance` for `Get-WmiObject` were not measured and are not proposed. A construct absent from this file is outside the scan.
