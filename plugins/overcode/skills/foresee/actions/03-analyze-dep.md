# Analyze-dep

Analyzes the risk profile of one package or all project dependencies, scores three dimensions, and surfaces risk signals with prior-run comparison.

## Inputs

- `$ARGUMENTS` (required) — string: `<target> [--discuss | --plan]`
  - `target`: package name (e.g., `firebase`, `laravel/framework`) OR `package.json` / `composer.json` / `pyproject.toml` / `Cargo.toml` to analyze all dependencies
  - `--discuss`: optional — present each finding interactively, no file created
  - `--plan`: optional — create a mitigation plan in `aidd_docs/tasks/` after inline output

## Scoring dimensions

@../assets/scoring-rubrics.md

| Dimension | Question |
|---|---|
| **Maintenance** /10 | Is the package actively maintained? (recent commits, active issues, roadmap, maintainer count) |
| **Security Surface** /10 | How large is the attack surface exposed? (CVEs, transitive depth, required permissions, data access) |
| **Lock-in** /10 | How easy is it to migrate away if the package is abandoned or breaks? (API surface, alternatives, wrapper pattern) |

> High scores indicate low risk. A 9/10 on Security Surface means the package has minimal known exposure.

## Outputs

**Single package:**

```
## Foresee — <package name>

### Prior run comparison
Last run: YYYY-MM-DD — N signals: X resolved ✅, Y persistent ⚠️, Z new 🆕
(Omit if no prior run found)

### Package profile
| Field | Value |
|---|---|
| Current version in project | x.y.z |
| Latest version | x.y.z |
| Last release | YYYY-MM-DD |
| Weekly downloads / stars | N |
| Active maintainers | N |
| Known CVEs | N |
| Transitive depth | N |

### Scores
| Dimension        | Score | Justification |
|------------------|-------|---------------|
| Maintenance      | N/10  | <one line>    |
| Security Surface | N/10  | <one line>    |
| Lock-in          | N/10  | <one line>    |

### Risk signals (ranked by severity)
🔴 **Will break** [✅/⚠️/🆕] — <description>
🟡 **Will degrade** [✅/⚠️/🆕] — <description>
🟢 **Latent debt** [✅/⚠️/🆕] — <description>
```

**All dependencies (manifest mode):**
Summary table of all packages sorted by composite risk (lowest Maintenance + Security + Lock-in first). Full profiles only for the top 5 riskiest packages.

## Risk signals reference

@../references/dep-risk-signals.md

## Process

### Step 1 — Parse arguments

Extract the target (single package or manifest path) and any flags.

### Step 2 — Load prior run

Compute slug from the package name or manifest path. Search `aidd_docs/foresee/` for prior runs.

### Step 3 — Collect dependency data

**Single package — sequential:**

1. Read the project manifest (`package.json`, `composer.json`, `pyproject.toml`, `Cargo.toml`) to find the currently pinned version.
2. Fetch package metadata using available CLI tools:

   ```bash
   # npm / Node
   npm view <package> time.modified dist-tags.latest maintainers --json 2>/dev/null

   # Composer / PHP
   composer show <package> 2>/dev/null

   # pip / Python
   pip index versions <package> 2>/dev/null
   pip show <package> 2>/dev/null

   # Cargo / Rust
   cargo search <package> 2>/dev/null
   ```

3. Check for known CVEs:
   ```bash
   # Node
   npm audit --json 2>/dev/null | jq '.vulnerabilities.<package>'

   # Composer
   composer audit 2>/dev/null | grep <package>
   ```

4. Grep the codebase to measure actual usage surface:
   ```bash
   rg -c "import.*<package>|require.*<package>|use .*<namespace>" --glob "**/*.{ts,js,php,py,rs,vue}"
   ```

**Manifest mode — parallel metadata collection then opus synthesis:**

1. Read all `dependencies` and `devDependencies` (or equivalent) from the manifest.
2. **Spawn one haiku sub-agent per package in parallel** (background: true). Each agent:
   - Fetches package metadata (steps 2–4 above for the package's ecosystem).
   - Returns: `{ name, pinned_version, latest_version, last_release, maintainers, cve_count, usage_count }`
3. Wait for all agents to complete.
4. **Opus synthesizes**: compute composite risk score per package (raw signal aggregation — no deep analysis yet). Sort ascending. Identify top 5 riskiest.
5. For the top 5 riskiest packages only: run the full single-package analysis (Steps 4–6 below).

### Step 4 — Assess against risk signal catalogue

Apply the signal definitions from `@../references/dep-risk-signals.md` to classify findings.

### Step 5 — Score

Rate each dimension 1–10 using the rubric in `@../assets/scoring-rubrics.md`.

### Step 6 — List risk signals

Rank by severity. Classify against prior run if available (✅ / ⚠️ / 🆕).

### Step 7 — Handle flags

- **`--discuss`**: pause on each 🔴 signal; no file created.
- **`--plan`**: after inline output, create `aidd_docs/tasks/YYYY_MM_DD-foresee-dep-<slug>.md` with each signal as a mitigation task.
- **Default**: inline output only.

### Step 8 — Write run file

Write output to `aidd_docs/foresee/YYYY-MM-DD-dep-<slug>.md`. Create `aidd_docs/foresee/` if absent.

## Test

Invoke with a known package name present in the project's manifest; verify the output contains a Package profile table, a Scores table with all three dimensions rated, and a run file written to `aidd_docs/foresee/`.
