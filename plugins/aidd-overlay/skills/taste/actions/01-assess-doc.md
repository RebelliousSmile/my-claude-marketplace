# Assess-doc

Reads one `.md` file or scans all `.md` files in the project, extracts verifiable claims, checks each against the live codebase, and returns a verdict table with suggested actions.

## Inputs

- `$ARGUMENTS` (optional) — string: path to the `.md` file to assess. If omitted, activates **scan mode**.

## Outputs

**Single-file mode:**

```
Verdict: Current | Partial | Obsolete

| Claim | Found in code | Status |
|-------|---------------|--------|
| {claim} | {file:line or "not found"} | ✅ Current / ⚠️ Modified / ❌ Obsolete |

Stale passages:
- §{section title} — "{quoted passage}" → {reason it is stale}

Suggested actions:
- {delete | update | keep} — {reason, stale claims listed if update}
```

**Scan mode:**

```
Scan complete — {N} files assessed

| File | Verdict | Stale claims | Stale passages | Suggested action |
|------|---------|--------------|----------------|-----------------|
| {path} | Current / Partial / Obsolete / N/A | {N} | {list or —} | delete / update / keep / — |

Summary: {N} obsolete, {N} partial, {N} current, {N} N/A

Root causes (stale values shared across ≥2 files):

| Root cause | Stale value | Correct value (if known) | Files impacted |
|-----------|-------------|--------------------------|----------------|
| {description} | {wrong value} | {right value or —} | {N} — {list} |

Fix plan (ordered by impact, highest first):

| # | Action | Reason | Files |
|---|--------|--------|-------|
| 1 | {delete/rewrite/update} | {root cause or local reason} | {file list} |
```

## Claim types reference

@../assets/claim-types.md

## Ground rule

**Taste verifies claims against the live codebase only — never against other documents.**
Cross-document coherence (does doc A agree with doc B?) is not in scope here; that belongs to `reconcile-normative` or `foresee`. Any finding that cannot be verified by reading a file, running a grep, or querying git must be skipped.

## Process

### Single-file mode

1. Read the target file at `$ARGUMENTS`.
2. Extract all verifiable claims of the types listed in `@../assets/claim-types.md`.
3. If no extractable claims are found, output `Verdict: N/A — conceptual document, no verifiable claims` and stop.
4. For each claim, verify against the **live codebase** using the appropriate method:
   - **File path**: read the referenced file — confirm it exists and the referenced element is present.
   - **Directory path**: check the directory exists.
   - **Markdown hyperlink** (relative only): resolve the link path relative to the file's directory; check the target exists. Skip anchor-only links (`#…`) and external URLs.
   - **Function / class / component name**: grep the codebase for the identifier.
   - **Branch name**: `git branch -a | grep <branch>`.
   - **Issue / PR reference**: `gh issue view <n>` or `glab issue view <n>` (skip if no tracker CLI).
   - **ADR / DEC reference**: check the file exists in `aidd_docs/internal/decisions/` or equivalent.
   - **Version number**: compare with `package.json` / `composer.json` / `pyproject.toml`.
   - **Command name**: check the command exists in `SKILL.md` router tables or shell PATH.
5. Classify each claim:
   - ✅ **Current** — exact match
   - ⚠️ **Modified** — element exists but content differs from the claim
   - ❌ **Obsolete** — not found
6. Identify **stale passages**: for each ⚠️ or ❌ claim, locate the section or paragraph it belongs to. Quote the passage (≤ 2 sentences) and state why it is stale.
7. Compute match percentage: Current claims / total claims.
   - ≥80% → **Current** | 20–79% → **Partial** | <20% → **Obsolete**
8. Output the verdict line, the full claim table, the stale passages block, and the suggested actions block.

### Scan mode (no argument)

1. List all `.md` files in the project:
   ```bash
   # macOS / Linux
   find . -type f -name "*.md" \
     -not -path "*/node_modules/*" \
     -not -path "*/.git/*" \
     -not -path "*/vendor/*" | sort

   # Windows (PowerShell)
   Get-ChildItem -Recurse -Filter "*.md" |
     Where-Object { $_.FullName -notmatch 'node_modules|\.git|vendor' } |
     Sort-Object LastWriteTime | Select-Object -ExpandProperty FullName
   ```
2. Sort by modification date ascending (oldest first).
3. **Spawn one haiku sub-agent per file in parallel** (background: true). Each agent receives the file path and runs the single-file process (steps 1–8 above). Each agent returns:
   ```json
   { "file": "<path>", "verdict": "Current|Partial|Obsolete|N/A", "stale_claims": N, "stale_passages": ["§Title", …], "suggested_action": "keep|update|delete|—" }
   ```
4. Wait for all agents to complete.
5. Aggregate all returned results into the scan output table, sorted by verdict severity (Obsolete → Partial → Current → N/A).
6. **Root-cause grouping** — after all files are assessed:
   a. Collect all ❌ Obsolete claims across every file.
   b. Normalise each stale value (trim, lowercase). Group claims that share the same normalised stale value or the same wrong identifier.
   c. For each group with ≥2 impacted files, emit one **Root cause** row: stale value, correct value if determinable from the verification step, list of impacted files.
   d. Root causes with more impacted files rank first.
7. **Fix plan** — produce an ordered action list:
   a. `delete` entries first — files where every claim is ❌ Obsolete and no salvageable content exists.
   b. `rewrite` entries — files driven by a root cause that touches ≥3 claims.
   c. `update` entries — files with 1–2 localised stale claims.
   d. Within each tier, order by number of stale claims descending.
8. If invoked as a sub-phase of `harvest`, return the summary metrics to the orchestrator. Otherwise, display the full output (table + root causes + fix plan).

## Test

Invoke with a known `.md` file containing at least one file path reference; verify the output includes a Verdict line, a populated claim table with at least one row, and a Suggested actions block.

Invoke with a `.md` file containing a relative Markdown link to a non-existent file; verify that link appears as ❌ Obsolete in the claim table.

Invoke in scan mode; verify the output includes the scan table, the Summary line, a Root causes section (even if empty: `No shared root causes detected`), and a Fix plan section.
