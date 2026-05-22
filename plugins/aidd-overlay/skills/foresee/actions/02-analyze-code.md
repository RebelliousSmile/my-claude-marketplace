# Analyze-code

Reads a code file, module, or directory, identifies the key elements to analyze, scores three dimensions, and surfaces improvements ranked by impact with prior-run comparison.

## Inputs

- `$ARGUMENTS` (required) — string: `<target> [--discuss | --plan]`
  - `target`: path to a code file, directory, or informal module description ("the auth module", "src/api/")
  - `--discuss`: optional — present each finding interactively, no file created
  - `--plan`: optional — create a correction plan in `aidd_docs/tasks/` after inline output

## Scoring dimensions

@../assets/scoring-rubrics.md

| Dimension | Question |
|---|---|
| **Maintainability** /10 | How easy is it to modify, extend, or delete this code without breaking existing behavior? |
| **Correctness Risk** /10 | How likely are there untested bugs — edge cases, invalid states, concurrency issues? |
| **Coupling** /10 | How problematic are the implicit dependencies on unstable or third-party artifacts? |

> Note: scores are inverted — a high Coupling score means **low** coupling (good). A low Correctness Risk score means **high** risk. Scores reflect the quality of the dimension, not its severity.

## Outputs

```
## Foresee — <target name>

### Prior run comparison
Last run: YYYY-MM-DD — N improvements: X resolved ✅, Y persistent ⚠️, Z new 🆕
(Omit if no prior run found)

### Key elements analyzed
- {element name} ({type: function / class / module / file}) — {one-line role}

### Scores
| Dimension       | Score | Justification |
|-----------------|-------|---------------|
| Maintainability | N/10  | <one line>    |
| Correctness Risk| N/10  | <one line>    |
| Coupling        | N/10  | <one line>    |

### Improvements (ranked by impact)
🔴 **Will break** [✅/⚠️/🆕] — <description>
🟡 **Will degrade** [✅/⚠️/🆕] — <description>
🟢 **Latent debt** [✅/⚠️/🆕] — <description>
```

## Process

### Step 1 — Parse arguments

Extract the target and any flags from `$ARGUMENTS`. If the target is an informal description, locate the corresponding files via grep/find before proceeding.

### Step 2 — Load prior run

Compute slug from the target path. Search `aidd_docs/foresee/` for files matching `*-<slug>.md`, sorted by date descending. Load the most recent if found.

### Step 3 — Collect files

- **Single file**: read directly.
- **Directory**: list all code files recursively (exclude `node_modules`, `.git`, `vendor`, `dist`, `build`, `.venv`).
- **Informal description**: identify the relevant directory or file set via grep for the described concept.

### Step 4 — Identify key elements

For each file, extract the most significant elements: exported functions, classes, composables, controllers, modules. Prioritize by size and outgoing coupling (most-called first). Focus depth on the top 5–10 elements to avoid dilution.

### Step 5 — Load adjacent context

Follow the context map for code artifacts:

@../assets/context-map.md

### Step 6 — Detect improvement patterns

Consult the improvement pattern catalogue for common code anti-patterns:

@../references/improvement-patterns.md

### Step 7 — Score

Rate each dimension 1–10 using the rubric in `@../assets/scoring-rubrics.md`. Score at the module/directory level when analyzing multiple files — do not aggregate individual file scores arithmetically.

### Step 8 — List improvements

List all improvements ranked by impact. Classify each against the prior run if available (✅ Resolved / ⚠️ Persistent / 🆕 New).

### Step 9 — Handle flags

- **`--discuss`**: pause on each 🔴 item and ask "Address this now?" before moving on. No file created.
- **`--plan`**: after inline output, create `aidd_docs/tasks/YYYY_MM_DD-foresee-<slug>.md` with each improvement as a task with acceptance criteria.
- **Default**: inline output only.

### Step 10 — Write run file

Write output to `aidd_docs/foresee/YYYY-MM-DD-<slug>.md`. Create `aidd_docs/foresee/` if absent.

## Test

Invoke with a path to any existing code file or directory; verify the output contains a "Key elements analyzed" section, a Scores table with all three dimensions rated and justified, at least one improvement item, and a run file written to `aidd_docs/foresee/`.
