# Scan

Detect PowerShell files without a manifest, report the host each file targets, and emit the pivot manifest for `/sc-pwsh:audit`. Nothing is written.

## Process

### Step 1 — Find files within the bound

Start from the current directory. **Bound: 3 directories below the start directory.** Exclude `.git`, `node_modules`, `.venv`, `venv`, `site-packages`.

Collect `*.ps1`, `*.psm1`, `*.psd1`, `*.Tests.ps1` and `PSScriptAnalyzerSettings.psd1`. Then count — without reading — the `*.ps1` and `*.psm1` files deeper than the bound, with the same exclusions: these are reported as **not scanned**.

If no `*.ps1` or `*.psm1` is found within the bound, abort:
```
❌ sc-pwsh sniff — no PowerShell file within 3 directories of <start directory>
   (<n> deeper, not scanned — rerun from a deeper folder)
   Aborting.
```
A `*.psd1` alone is a data file, not a PowerShell signal.

### Step 2 — Read the declared host, per file

Read text only, never execute. Signals, and what each means (each was measured on both hosts; rows of the `-File` launch [F8.1–F8.5], module manifest [F8.6–F8.8]):

| Signal | Reading |
|---|---|
| `#Requires -Version 7` | **PowerShell 7 only** — 5.1 refuses to start the script |
| `#Requires -Version 5.1` | runs on **both**; not a restriction to 7 |
| `#Requires -Version <other>` | report the raw value; the host stays **undetermined** (only 5.1 and 7 were measured) |
| `#Requires -PSEdition Core` | **PowerShell 7 only** — 5.1 refuses |
| `#Requires -PSEdition Desktop` | **Windows PowerShell 5.1 only** — 7 refuses |
| `PowerShellVersion` / `CompatiblePSEditions` in a `*.psd1` | host of the **module**, enforced at import; applies to a script only if it imports that module — otherwise the script's host stays undetermined |
| Shebang `#!/usr/bin/env pwsh` | **not read**: a plain comment on Windows; the effect off Windows is not measured |
| None of the above | **undetermined** |

Several `#Requires` lines in one file: report each. Two files declaring different hosts in one project: report each file with its own host. Never aggregate to one project host.

### Step 3 — Detect tools, as facts

These signals report facts only; none was measured and none feeds a rule.

| Tool | Signals |
|---|---|
| Pester | a `*.Tests.ps1` (also counted as a `*.ps1`), `Describe`/`It` blocks, `Invoke-Pester`, `#Requires -Modules Pester` |
| PSScriptAnalyzer | `PSScriptAnalyzerSettings.psd1`, `Invoke-ScriptAnalyzer` |

Also report, read-only, the installed versions: `Get-Module -ListAvailable Pester, PSScriptAnalyzer` on an available host (say which one). Absent tools are stated as absent.

### Step 4 — Map to pivots

#### Capability pivots (loaded at audit time by `/sc-pwsh:audit` — never installed to disk)

| Capability | Condition | Pivot path |
|---|---|---|
| PowerShell idioms | at least one `*.ps1` or `*.psm1` found | `powershell/idioms.md` |

No perf or data pivot exists: their absence is declared, not hidden behind an empty file.

### Step 5 — Detect gaps

A **gap** is a capability detected for which the plugin has no pivot. Report only meaningful ones, for example:
- Pester detected — no testing pivot in plugin
- PSScriptAnalyzer detected — no lint-rule pivot in plugin
- a `*.psm1` module with a `*.psd1` — no module-authoring pivot in plugin

## Output

```
📊 sc-pwsh sniff — pivot manifest

Scope: <start directory> — bound 3 directories
Files: <n> *.ps1, <n> *.psm1, <n> *.psd1 (<n> deeper, not scanned)

Host per file:
  <path>   PowerShell 7 only   (#Requires -Version 7)
  <path>   Windows PowerShell 5.1 only   (#Requires -PSEdition Desktop)
  <path>   both                (#Requires -Version 5.1)
  <path>   undetermined        (no declaration)

Tools (facts):
  Pester             ❌ not detected (installed: <version> on Windows PowerShell 5.1)
  PSScriptAnalyzer   ❌ not detected (not installed)

Capability pivots (loaded at audit time — not installed):
  powershell/idioms.md   ✅

Skills support:
  /sc-pwsh:audit ✅ (powershell/idioms.md will be loaded)

Gaps (no plugin pivot):
  Pester — no testing pivot in plugin

Written: nothing.
```

List one line per file when there are few; group by declared host and show a count per group when there are many, naming the undetermined group explicitly.
