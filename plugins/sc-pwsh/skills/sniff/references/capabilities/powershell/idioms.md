---
paths:
  - "**/*.ps1"
  - "**/*.psm1"
  - "!**/node_modules/**"
---
# PowerShell Idioms — Code Quality Pivot

Criteria for `/sc-pwsh:audit`. Loaded at audit time, never installed to `.claude/rules/`.

Every rule was **measured** on Windows PowerShell 5.1.22621.4249 and PowerShell 7.6.9 (Windows). The tag `[Fn.m]` names the measurement row that backs it (task journal of 2026-10-28). Other versions and non-Windows hosts were not measured: say so rather than extrapolate. Error messages are localized: match an `ErrorId` or an exception type, never a message text.

A host-specific rule applies to a file only if the host it declares includes the affected one: `both` includes 5.1 and gets a verdict. An `undetermined` host also includes 5.1 but gets `info`, with the assumption named — the declaration is missing, so the verdict is not. A rule that holds on both hosts applies everywhere.

## Encoding

- Never rely on the default encoding of `Set-Content`, `Add-Content`, `Out-File` or `>`: 5.1 writes ANSI (`Set-Content`, `Add-Content`) or UTF-16 LE with BOM (`Out-File`, `>`); 7 writes UTF-8 without BOM. [F1.1–F1.4]
- `-Encoding UTF8` on `Set-Content` / `Out-File` writes a BOM on 5.1 and none on 7. [F1.5, F1.6]
- `[System.IO.File]::WriteAllText` writes UTF-8 without BOM on both hosts: the one write that yields identical bytes. [F1.7]
- `Get-Content` without `-Encoding` misreads a UTF-8 file without BOM on 5.1 (`é` becomes two characters) and reads it correctly on 7. An explicit-encoding read was not measured. [F1.8]
- A script holding non-ASCII literals and saved as UTF-8 **without BOM** is read as ANSI by 5.1 (corrupted literals) and correctly by 7; with a BOM both read it correctly. Flag it when the script can run on 5.1. [F1.9, F1.10]

## Syntax gated by host

These parse on 7 and fail to **parse** on 5.1 (the whole script then does not run):

- `??` and `??=`. [F2.1, F2.7]
- Ternary `cond ? a : b`. [F2.3]
- Pipeline chain operators `&&` and `||`. [F2.4, F2.5]
- Null-conditional access `?.` / `?[` after `${name}`, after a property access (`$o.A?.B`, `$o.A?[0]`) or after a parenthesised expression (`(Get-Item .)?.Name`). [F2.10–F2.15]

Do not flag `?.` or `?[` after a **bare variable** (`$name?.Prop`): it is read as a variable named `name?` on both hosts, not as the operator. [F2.2, F2.8, F2.16]

`ForEach-Object -Parallel` parses on 5.1 and fails at run time (unresolved parameter set), so the parser cannot reveal it: search for it. [F2.6, F7.7]

## Errors

- A non-terminating error (`Get-Item` on a missing path, `Write-Error`) is **not** caught by `try`/`catch` unless the call has `-ErrorAction Stop` or `$ErrorActionPreference = 'Stop'` is in force. Flag a `catch` that depends on one such call without either. [F3.1–F3.4]
- `throw` and .NET exceptions are terminating and are caught. [F3.5, F3.7]
- A native command's non-zero exit code is not an error: `catch` does not fire; read `$LASTEXITCODE`. [F3.6]
- `-ErrorAction SilentlyContinue` hides the error but still records it in `$Error`. [F3.8]

## ShouldProcess and `-WhatIf`

- A function that changes state and offers `-WhatIf` / `-Confirm` declares `[CmdletBinding(SupportsShouldProcess)]`: without it `-WhatIf` is an unknown parameter. [F4.3]
- Inside such a function `-WhatIf` reaches the cmdlets it calls (`Remove-Item` keeps the file); `$WhatIfPreference = $true` reaches them too. [F4.1, F4.2, F4.6]
- It does **not** reach .NET calls: `[System.IO.File]::Delete` deletes despite `-WhatIf`. Guard each such call with `$PSCmdlet.ShouldProcess(...)`. [F4.4, F4.5]

## Strict mode and native commands

- Without `Set-StrictMode`, an undefined variable is silently `$null`. With `-Version Latest`, an undefined variable and a missing property both throw. [F5.1–F5.3]
- `$ErrorActionPreference = 'Stop'` does not make a native non-zero exit fatal on either host. [F5.6]
- `$PSNativeCommandUseErrorActionPreference = $true` makes it fatal on **7 only**; on 5.1 the variable does not exist by default and setting it has no effect, so the script continues. A script relying on it is wrong on 5.1. [F5.5, F5.7]

## Arguments to native executables

Measured with a `powershell.exe` receiver only. On 5.1 (`$PSNativeCommandArgumentPassing` does not exist) versus 7 (`Windows`):

- Embedded double quotes in an argument are lost on 5.1 (`say "hi"` → `say hi`), kept on 7. [F6.1, F6.2, F6.6]
- An empty-string argument is dropped on 5.1, passed on 7. [F6.3]
- A quoted path with a space ending in a backslash is merged with the next argument on 5.1, passed correctly on 7. [F6.5]
- An argument with plain spaces is identical on both. [F6.4]

A native call that passes quotes, empty strings or a trailing-backslash path in a script that can run on 5.1 is `info` only: whether the receiver parses arguments like `powershell.exe` was not measured. Check with the real receiver.

## Parsing a file

`[System.Management.Automation.Language.Parser]::ParseFile` needs no module on either host and does not execute the file. Its errors carry an `ErrorId` (for example `MissingEndCurlyBrace`, `UnexpectedToken`). The parser of 5.1 is the one that reveals 7-only syntax in a file. It resolves no alias: `GetCommandName()` returns the name as written (`iex`, `gci`, `%`) and resolution needs `Get-Command`, which depends on the aliases defined on the host. [F7.1–F7.11]

## Out of scope

No rule here covers testing, performance, data access or lint-rule sets: nothing about them was measured. `Pester` 5 and `PSScriptAnalyzer` were not available when this pivot was written.
