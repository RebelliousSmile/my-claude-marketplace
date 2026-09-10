# AIDD delegation contract

Overcode keeps stable public entry points while delegating general analysis to the installed AIDD skills that own it. Resolve a capability from the host's available-skills catalogue. Never locate AIDD through a cache path or embed an installed version in an action.

## Compatibility baseline

| Package | Minimum compatible version | Capability | Canonical skill | Expected output |
|---|---:|---|---|---|
| `aidd-refine` | `3.0.1` | prospective gaps in an unfinished document | `aidd-refine:03-shadow-areas` | shadow report |
| `aidd-refine` | `2.2.4` | correctness of completed work against an agreed plan | `aidd-refine:02-challenge` | correctness report |
| `aidd-refine` | `3.0.1` | externally verifiable factual claims | `aidd-refine:04-fact-check` | cited verification and rewrite artifact |
| `aidd-dev` | `2.4.1` | repository or pillar audit | `aidd-dev:04-audit` | ranked audit report |
| `aidd-dev` | `2.4.1` | runnable project assertions | `aidd-dev:03-assert` | assertion results |
| `aidd-dev` | `2.4.1` | correction plan from a delegated report | `aidd-dev:01-plan` | phased plan in `aidd_docs/tasks/` |
| `aidd-dev` | `2.5.0` | relevancy of a diff against its need | `aidd-dev:05-review` | review report |

These versions describe the contract inspected by this plugin release. Newer versions are compatible only while their catalogue still exposes the canonical skill and its expected role. The table is not a copy of every AIDD skill.

## Resolution and invocation

1. Find the canonical skill in the skills catalogue exposed to the current agent.
2. Read the installed skill's complete `SKILL.md` before delegation and follow its own action routing.
3. When package-version metadata is exposed, require the minimum above. Do not infer a version from a numbered skill directory.
4. Invoke with native syntax: `$plugin:skill` on Codex, `/plugin:skill` on Claude Code. When the host routes skills by capability rather than literal command text, hand the target and selected pillar to the resolved skill directly.
5. Return a delegation receipt:

   ```yaml
   capability: <resolved role>
   delegated_to: <canonical skill>
   pillar: <pillar or none>
   artifact: <path, inline, or none>
   writes: <all report and assessed-product paths written, or none>
   consent: <not-required | granted | required>
   local_follow_up: <step or none>
   ```

The receipt records orchestration; it does not replace the delegated report. A delegated analytical skill may write the report required by its own contract under `aidd_docs/`; list that path under `writes`. After a consented mutating capability returns, copy every source, test, configuration, product-data, and report path named by its result or diff into `writes`. Source, tests, configuration, and product data remain untouched unless the selected capability is explicitly mutating and the user grants consent first.

## Failure contract

| Failure | Required response |
|---|---|
| Package absent | Name the package and minimum version, provide the host-native installation/update hint when known, and stop the affected branch. |
| Canonical skill absent | Name the missing skill, its package, and the minimum compatible version from the baseline; report that the installed package is incompatible, and stop the affected branch without fallback. |
| Version below minimum | Report installed and required versions, request an update, and stop the affected branch. |

Never revive an Overcode checklist, regex detector, or model-specific fallback after a resolution failure. Independent local branches may continue only when their result does not pretend to cover the failed capability.

## Routing matrices

### `foresee analyze-doc`

| Intent/state | Route |
|---|---|
| Idea, specification, brainstorm, or plan not yet completed | `aidd-refine:03-shadow-areas` |
| Completed work with an agreed plan/reference | `aidd-refine:02-challenge` |
| State cannot be determined | Ask once whether the artifact is prospective or completed; do not choose silently. |

### `foresee analyze-code`

| Intent | Route |
|---|---|
| General module or future coupling/boundary risk | `aidd-dev:04-audit`, pillar `architecture` |
| Explicit maintainability or code-quality concern | `aidd-dev:04-audit`, pillar `code-quality` |
| Explicit correctness or coverage concern | `aidd-dev:04-audit`, pillar `tests` |
| Explicit conflicting signals | Ask once for the primary angle. |

### `foresee analyze-resilience`

| Target kind | Evidence route |
|---|---|
| Prospective document | `aidd-refine:03-shadow-areas` |
| Completed work with agreed reference | `aidd-refine:02-challenge` |
| Code | `aidd-dev:04-audit`, pillar `architecture`, then `aidd-dev:04-audit`, pillar `tests` |
| Dependency or manifest | Existing Foresee `analyze-dep` action; keep its AIDD dependency audit and local horizon authoritative |
| Target kind or lifecycle cannot be determined | Ask once; do not guess or invoke multiple branches |

Return one receipt per invocation. A failed or unscannable applicable input reduces resilience coverage; it never licenses invented evidence or a positive global verdict.

### `taste assess-code`

| Intent | Route |
|---|---|
| General freshness, stale constructs, rules, or maintainability | `aidd-dev:04-audit`, pillar `code-quality` |
| Dependency age, deprecation, version, or package risk | `aidd-dev:04-audit`, pillar `dependencies` |
| Imports, compilation, typing, build, or runtime resolution explicitly requested with consent to repair | `aidd-dev:03-assert` |
| Imports, compilation, typing, build, or runtime resolution without repair consent | Return the proposed `aidd-dev:03-assert` route with `consent: required`; do not invoke it |
| A source path without intent | Ask once which of the three lenses is wanted. |

### `taste assess-sobriety`

| Target kind | Evidence route |
|---|---|
| Repository or module | `aidd-dev:04-audit`, pillar `code-quality` |
| Diff with its stated need | `aidd-dev:05-review`, axis `relevancy` |
| Completed feature or work with an agreed reference | `aidd-refine:02-challenge` |
| Target kind cannot be determined | Ask once for repository/module, diff, or completed work; do not delegate silently |

The delegate owns its findings and persisted report. Taste owns the later product-purpose, footprint, loss, and `Add minimally | Retain | Simplify | Merge | Remove` verdict. It must not rescore the delegate.

## Legacy flags

- Default: return the delegated report and receipt.
- `--discuss`: delegate first, then discuss the resulting findings. A delegated skill may persist the report required by its contract; do not promise a zero-file run.
- `--plan`: delegate first, then pass the resulting report to `aidd-dev:01-plan`. If plan is unavailable, return the report path and stop that follow-up.
- Potentially mutating follow-ups never inherit consent from `--discuss`, `--plan`, or a prior analytical delegation. Consent must name the mutating capability or requested repair.
