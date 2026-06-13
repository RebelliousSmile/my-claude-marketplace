# Analyze-code

Reads a code file, module, or bounded set of files in a directory, identifies the key elements to analyze, scores three dimensions, and surfaces improvements ranked by impact with prior-run comparison.

## Inputs

- `$ARGUMENTS` (required) — string: `<target> [--depth <N>] [--discuss | --plan]`
  - `target`: path to a code file, directory, or informal module description ("the auth module", "src/api/")
  - `--depth <N>` (optional, default: 10) — maximum number of files to analyze when target is a directory
  - `--discuss`: optional — present each finding interactively, no file created
  - `--plan`: optional — create a correction plan in `aidd_docs/tasks/` after inline output

## Scope rule

**Foresee is not a full-codebase scanner.** When given a directory, it selects a bounded set of the most impactful files and analyzes them deeply. Breadth is deliberately capped; depth is the value.

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

### Files analyzed (N / budget)
- {file path} — {one-line role}

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

Extract the target, `--depth` value (default: 10), and any flags from `$ARGUMENTS`.

### Step 2 — Load prior run

Compute slug from the target path. Search `aidd_docs/foresee/` for files matching `*-<slug>.md`, sorted by date descending. Load the most recent if found.

### Step 3 — Select files (bounded)

- **Single file**: use it directly. Skip selection.
- **Informal description**: locate the corresponding directory or file set via grep for the described concept, then apply directory selection below.
- **Directory**: collect all code files recursively (exclude `node_modules`, `.git`, `vendor`, `dist`, `build`, `.venv`). Then **select up to `--depth` files** using this priority order:
  1. Entry points (`index.*`, `main.*`, `app.*`, `server.*` at the root of the directory)
  2. Files with the highest inbound import count (grep `from .* <filename>` across the codebase — most-imported first)
  3. Files modified most recently (`git log --oneline -- <file>` date descending)
  4. Largest files (line count)
  
  Stop as soon as the budget is reached. Display "Files analyzed (N / budget)" in the output.

### Step 4 — Analyze files in parallel

**Spawn one opus sub-agent per selected file in parallel** (background: true). Each agent:
- Reads the file.
- Extracts the most significant elements: exported functions, classes, composables, controllers, modules (top 5 per file).
- Identifies improvement candidates against `@../references/improvement-patterns.md`.
- Returns: `{ file, key_elements[], improvements[] }`

Wait for all agents to complete.

### Step 5 — Load adjacent context

Follow the context map for code artifacts:

@../assets/context-map.md

### Step 6 — Score at module level

Using the aggregated findings from all file agents, score the **module as a whole** (not per file) on each dimension using `@../assets/scoring-rubrics.md`. Include a one-line justification per score.

### Step 7 — List improvements

Merge all per-file improvements. Deduplicate cross-file patterns (e.g., repeated coupling issue). Rank by impact (🔴 first). Classify each against the prior run if available (✅ Resolved / ⚠️ Persistent / 🆕 New).

### Step 8 — Handle flags

- **`--discuss`**: pause on each 🔴 item and ask "Address this now?" before moving on. No file created.
- **`--plan`**: after inline output, create `aidd_docs/tasks/YYYY_MM_DD-foresee-<slug>.md` with each improvement as a task with acceptance criteria.
- **Default**: inline output only.

### Step 9 — Write run file

Write output to `aidd_docs/foresee/YYYY-MM-DD-<slug>.md`. Create `aidd_docs/foresee/` if absent.

## Test

Invoke with a path to any existing code file or directory; verify the output contains a "Files analyzed" section (≤ 10 files), a Scores table with all three dimensions rated and justified, at least one improvement item, and a run file written to `aidd_docs/foresee/`.
