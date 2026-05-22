# Analyze-doc

Reads a document artifact, loads its adjacent context, scores three dimensions, surfaces improvements ranked by impact, and compares with the previous run on the same target when available.

## Inputs

- `$ARGUMENTS` (required) — string: `<target> [--discuss | --plan]`
  - `target`: path to a `.md` document (plan, skill SKILL.md or action file, rule file, brainstorm, spec) OR issue number (`#42` / `glab#42`)
  - `--discuss`: optional — present each finding interactively, no file created
  - `--plan`: optional — create a correction plan in `aidd_docs/tasks/` after inline output

## Scoring dimensions

@../assets/scoring-rubrics.md

| Dimension | Question |
|---|---|
| **Clarity** /10 | Can an LLM parse this without ambiguity, contradiction, or missing context? |
| **Completeness** /10 | Are all use cases, edge cases, prerequisites, and failure paths covered? |
| **Feasibility** /10 | Is it achievable within the project's current constraints (time, tech, rules)? |

## Outputs

```
## Foresee — <target name>

### Prior run comparison
Last run: YYYY-MM-DD — N improvements: X resolved ✅, Y persistent ⚠️, Z new 🆕
(Omit if no prior run found)

### Scores
| Dimension    | Score | Justification |
|--------------|-------|---------------|
| Clarity      | N/10  | <one line>    |
| Completeness | N/10  | <one line>    |
| Feasibility  | N/10  | <one line>    |

### Improvements (ranked by impact)
🔴 **Will break** [✅/⚠️/🆕] — <description>
🟡 **Will degrade** [✅/⚠️/🆕] — <description>
🟢 **Latent debt** [✅/⚠️/🆕] — <description>
```

## Process

### Step 1 — Parse arguments

Extract the target and any flags from `$ARGUMENTS`.

### Step 2 — Load prior run

Compute the slug: normalize the target path or identifier (replace `/`, `\`, `#`, spaces with `-`; lowercase). Search `aidd_docs/foresee/` for files matching `*-<slug>.md`, sorted by date descending. Load the most recent if found.

```bash
# macOS / Linux
ls -t aidd_docs/foresee/*-<slug>.md 2>/dev/null | head -1

# Windows (PowerShell)
Get-ChildItem aidd_docs\foresee\*-<slug>.md -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
```

### Step 3 — Read the target

- **File path**: read the document from disk.
- **Issue number**: run `gh issue view <n> --json title,body,state,comments` or `glab issue view <n>`. Include comments in the analysis.

### Step 4 — Load adjacent context

Follow the context map for the document type:

@../assets/context-map.md

### Step 5 — Detect improvement patterns

Consult the improvement pattern catalogue for common doc anti-patterns:

@../references/improvement-patterns.md

### Step 6 — Score

Rate each dimension 1–10 using the rubric in `@../assets/scoring-rubrics.md`. Write a one-line justification per score.

### Step 7 — List improvements

List all identified improvements ranked by impact (🔴 first). For each improvement, if a prior run exists, classify:
- ✅ **Resolved** — this issue was present in the prior run but is no longer observable.
- ⚠️ **Persistent** — same issue present in both runs (match on normalized description ≥ 70% similar).
- 🆕 **New** — not observed in the prior run.

### Step 8 — Handle flags

- **`--discuss`**: after presenting all improvements, pause on each 🔴 item and ask the user: "Address this now?" Move to 🟡 items only after all 🔴 items are discussed. Do not write any file.
- **`--plan`**: after inline output, create `aidd_docs/tasks/YYYY_MM_DD-foresee-<slug>.md` with each improvement as an actionable task with acceptance criteria and a severity label.
- **Default**: inline output only.

### Step 9 — Write run file

Always write the output to `aidd_docs/foresee/YYYY-MM-DD-<slug>.md` regardless of flag. Create `aidd_docs/foresee/` if it does not exist.

## Test

Invoke with a path to any existing `.md` plan or skill file; verify the output contains a Scores table with all three dimensions rated and justified, at least one improvement item, and a run file written to `aidd_docs/foresee/`.
