# Audit

Orchestrate a PowerShell code quality review: detect the applicable pivots, load them from the plugin, and delegate analysis to `aidd-dev:04-audit`.

## Transversal rules

- Invoke `sniff` `scan` only. Audit is read-only.
- Never install any file to `.claude/rules/` or any project path.
- All knowledge is read from `${SC_PWSH_PLUGIN_ROOT}/skills/sniff/references/capabilities/` at runtime.

## Process

### Step 1 — Detect the scope (invoke scan only)

Run sniff `scan` on the current directory to get the pivot manifest and the host declared by each file.

If `scan` finds no `*.ps1` or `*.psm1` within its bound, abort:
```
❌ sc-pwsh audit — no PowerShell file within the scan bound. Run from a folder that holds the scripts.
```

### Step 2 — Load capability pivots

For each capability in the manifest, load its pivot:

```
${SC_PWSH_PLUGIN_ROOT}/skills/sniff/references/capabilities/<pivot-path>
```

Collect the loaded pivots into one acceptance-criteria document, one section per pivot, each headed by its title. Today `powershell/idioms.md` is the only pivot; no testing, performance or data pivot exists.

### Step 3 — Identify review targets

From the `scan` output, the targets are the `*.ps1` and `*.psm1` files within the bound, each with its declared host. Files beyond the bound are named as **not scanned**, never as clean.

### Step 4 — Delegate to aidd-dev:04-audit

Resolve `aidd-dev:04-audit` from the host's available-skills catalogue and read its complete `SKILL.md`. Invoke its `code-quality` pillar with:

- the targets of Step 3 as the audit scope, with the declared host of each file;
- the pivots of Step 2 as supplementary, stack-specific lenses;
- the review dimensions below;
- an instruction that every loaded pivot be accounted for either by a concrete finding, a "reviewed — no finding" coverage note, or an "unscannable" coverage note with its reason.

Preserve the AIDD audit's own report schema and artifact path. Do not introduce a retired reviewer agent type or impose a second scoring rubric on the delegated report.

If the package, canonical skill, or `code-quality` pillar is unavailable, stop the delegation, name the missing capability, and return no substitute generic audit.

#### Review dimensions

Each is read from the syntax tree of the host's own parser (`[System.Management.Automation.Language.Parser]::ParseFile`, which does not run the file) together with the pivot.

| Dimension | What to look for | Reading |
|---|---|---|
| Dynamic evaluation | `Invoke-Expression` / `iex` | `info`: the detection by name was measured, the danger was not; the argument's origin is stated when readable |
| Plain-text secrets | literals assigned to variables named like a password, token or key; `ConvertTo-SecureString -AsPlainText` | heuristic, **not measured**: always `info`, never self-confirmed |
| Blanket error suppression | `-ErrorAction SilentlyContinue` on a call, or `$ErrorActionPreference = 'SilentlyContinue'` | `info`: the error is hidden but still recorded in `$Error` (pivot, Errors); no count threshold was measured, so the number of calls is reported, not judged |
| Destructive without `ShouldProcess` | a function that removes or overwrites and lacks `[CmdletBinding(SupportsShouldProcess)]`; a .NET delete call not guarded by `$PSCmdlet.ShouldProcess` | pivot, ShouldProcess |
| Strict mode | no `Set-StrictMode` in a script that reads variables or properties | `info`: strict mode is a project convention, not a defect (pivot, Strict mode) |
| Aliases in a script | `%`, `?`, `gci`, `iex`, … | `info`: the parser returns the name as written; resolve with `Get-Command` on the declared host, whose result depends on that host's aliases |
| Host-gated syntax | 7-only syntax in a file declared `both` (verdict) or `undetermined` (`info`, assumption named) | needs the 5.1 parser; if `powershell.exe` is absent, the entry is **not verified** |
| Encoding | a write without an explicit encoding; non-ASCII literals without a BOM | pivot, Encoding: a verdict when the declared host includes 5.1 (`both`), `info` when `undetermined`, none when `7 only` |

#### Severity discipline

- Condition every verdict on the host the file declares or that was measured, never on the platform assumed. A `both` host includes 5.1 and gets a verdict.
- An undetermined host, or a signal whose effect was not measured, yields `info`.
- A parse error in one file is reported with its `ErrorId`; the audit of the other files continues.
- Never state that code is dead or unused.
- Error messages are localized: match an `ErrorId` or a type, never a message text.

### Step 5 — Present results

Read the resulting `code-quality.md` artifact. Return its path and a compact delegation receipt that maps every loaded pivot to `finding`, `reviewed — no finding`, or `unscannable`. Do not copy the report into a competing local report format.

## Output format

```text
🔍 sc-pwsh audit — PowerShell code quality

Pivots loaded: <n>
Review scope: <n> files — host: <n> 7 only, <n> 5.1 only, <n> both, <n> undetermined (<n> deeper, not scanned)
Delegated to: aidd-dev:04-audit / code-quality
Artifact: <aidd_docs/tasks/.../code-quality.md>

Pivot receipt:
  <pivot-path>  <finding | reviewed — no finding | unscannable>
```
