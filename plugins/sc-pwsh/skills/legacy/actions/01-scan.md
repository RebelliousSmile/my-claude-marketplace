# Scan

Find constructs that the host a script declares rejects. Emit a structured manifest for `02-migrate`. Nothing is written, no scanned file is executed.

## Inputs

- `target host` (optional) — `5.1` | `7`. Default: the host each file declares.

## Process

### Step 1 — Load version references

@../references/powershell-versions.md

Only the constructs listed there are scanned.

### Step 2 — Resolve the host per file

Run sniff `scan` on the current directory (same bound: 3 directories, same exclusions). It gives each `*.ps1` / `*.psm1` its declared host: `7 only`, `both`, `5.1 only`, `undetermined`.

If it finds no PowerShell file, abort:
```
❌ sc-pwsh legacy — no PowerShell file within the scan bound. Run from a folder that holds the scripts.
```

Resolve the host that must accept each file:

| Declared host | Hosts that must accept the file |
|---|---|
| `7 only` | 7 |
| `5.1 only` | 5.1 |
| `both` | 5.1 and 7 |
| `undetermined` | 5.1 and 7, every entry `INFO`, the assumption named |

An explicit `target host` overrides the declaration; say so in the output.

### Step 3 — Check availability of each parser

`powershell.exe` is the 5.1 parser, `pwsh` the 7 one. Look each up; do not run the scanned file. A missing binary makes every entry that needs it **not verified**, never deduced from the other host.

### Step 4 — Parse with the host's own parser

For each file and each host that must accept it, call `[System.Management.Automation.Language.Parser]::ParseFile` in that host. It does not execute the file. Report each parse error with its `ErrorId` and position; the other files are still scanned.

A parse error on the host that must accept the file is a rejected construct. Match it to a row of `powershell-versions.md` by locating the construct, not by message text (messages are localized). A parse error that matches no row (a missing brace, for example) is reported as a plain parse error with its `ErrorId`, under `Parse errors outside the table`: it is a defect, not a host difference, and `migrate` never touches it.

A `#Requires -PSEdition Desktop` or `Core` that the other host refuses is a rejected construct too: it is read from the file text, not from the parser.

### Step 5 — Search what the parser cannot reveal

Search text, in the files whose host list includes the rejecting host, for the constructs of `powershell-versions.md` that parse but fail elsewhere: `ForEach-Object -Parallel`, `Join-Path` with three or more positional segments, `Get-Date -AsUTC`, `ConvertFrom-Json -AsHashtable`, `-Encoding Byte`, `-AsByteStream`. `ConvertTo-Json` without `-Depth` is searched too, but it does not fail: it is reported as a behaviour difference. Each hit is a **candidate**; a call that sits in a comment or string is not a hit.

`$name?.Prop` without braces is never reported.

### Step 6 — Output manifest

```
📊 sc-pwsh legacy — scan results

Scope: <start directory> — bound 3 directories (<n> deeper, not scanned)
Parsers: powershell.exe 5.1 ✅ · pwsh 7 ✅      (✘ absent → entries not verified)

Rejected by Windows PowerShell 5.1:
  HIGH    <path>:<line>  ??            parse error  (host: both)       [F2.1]
  HIGH    <path>:<line>  Join-Path a b c   positional error (host: both) [F9.7]
Rejected by PowerShell 7:
  HIGH    <path>:<line>  -Encoding Byte   (host: 7 only)               [F9.4]
Different behaviour, no failure:
  INFO    <path>:<line>  ConvertTo-Json without -Depth  (host: both)   [F9.6]
Undetermined host (assumed 5.1 + 7):
  INFO    <path>:<line>  ??            parse error on 5.1               [F2.1]
Parse errors outside the table:
  <path>:<line>  <ErrorId>
Not verified:
  <path>  5.1 parser absent — host-gated syntax unchecked

→ migrate will modify <n> files.
```

Order: failures first (`HIGH`), then behaviour differences and entries of an undetermined host (`INFO`). A difference without a failure is never `HIGH`, and an undetermined host is never `HIGH`. Each entry carries its measurement row.

Then proceed to `02-migrate`.

## Test — non-régression (faux positifs)

Replay `scan` on a test file holding each case below and check:

- `$a?.Length` without braces is **not** reported.
- A `??` inside a comment or a string literal is **not** reported.
- `Get-WmiObject` is **not** reported as rejected on 7.
- A file declaring `#Requires -Version 7` is not reported for a 7-only construct, but is reported for `-Encoding Byte`.
- A file declaring `#Requires -PSEdition Desktop` is reported when 7 must accept it, and not otherwise.
- A file with an undetermined host and a `??` is reported `INFO`, never `HIGH`.
- With `powershell.exe` hidden, the entries that need the 5.1 parser read **not verified**, not clean.
