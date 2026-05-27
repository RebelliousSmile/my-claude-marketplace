# Decision Document Protocol

Reference for detecting and assessing decision/spike documents in `assess-doc`.

## Detection markers

A file is a **decision document** if its first 20 lines contain any of:

| Marker | Examples |
|--------|---------|
| Frontmatter decision field | `> **Décision** :`, `> **Decision:**` |
| Status field | `> **Statut** :`, `> **Status**:` |
| Explicit verdict | `**NO-GO**`, `**GO**`, `**ACCEPTED**`, `**REJECTED**`, `**DEFERRED**` |
| Document type | `# Spike :`, `# ADR`, `# Decision Record` |

When a decision marker is found, set `decision_doc = true` and extract:
- **decision_value** — the decision text (e.g. `NO-GO court terme`, `GO`)
- **re_eval_conditions** — bullet list under headings like `Re-évaluer si`, `Conditions pour ré-évaluer`, `Reconsider when` (may be absent)
- **issue_refs** — any issue numbers in the header block (e.g. `#26`, `#27`)

## External source checks

Run these after the standard claim verification, only when `decision_doc = true`:

### 1. Issue status
For each issue ref found:
```bash
gh issue view <N> --json state,title,closedAt 2>/dev/null
# or: glab issue view <N>
```
- `state: closed` → flag issue as **resolved**
- `state: open` → no flag

### 2. Release artifacts
```bash
gh release list --json tagName,assets 2>/dev/null | \
  jq '.[].assets[].name'
```
Scan asset names for technology keywords from the doc (e.g. `.apk`, feature name, service name). Match = flag as **artifact exists**.

### 3. Codebase presence check
If the decision is **NO-GO** for a feature:
- Extract the main implementation hint from the doc (file path, module name, service name mentioned as "would require").
- Grep for it: `rg -l "<keyword>" src/ --type-add 'vue:*.vue'`
- Found = the feature may have been implemented despite NO-GO → flag as **implemented**.

## Superseded verdict rules

Apply **Superseded** when accuracy ≥ 80% (claims still technically correct) AND any of:
- A **NO-GO** decision has `implemented = true` (feature found in codebase)
- Referenced issues are all `state: closed`
- A release contains an artifact matching the decision's subject
- All `re_eval_conditions` are demonstrably met (each condition resolvable via codebase grep or issue check)

Apply **Archived** (sub-case of Superseded) when the decision is still valid but its subject is entirely absent from the codebase — the feature was never built and is no longer referenced anywhere.

## Output block for decision docs

Append after the standard claim table:

```
Decision status: NO-GO / GO / ACCEPTED / REJECTED / DEFERRED
Re-evaluation conditions met: yes / no / partial / n/a
External signals:
  - Issues: #N state=closed | #N state=open
  - Release artifacts: <name> found in <tag> | none matched
  - Codebase: <keyword> found at <path> | not found
```
