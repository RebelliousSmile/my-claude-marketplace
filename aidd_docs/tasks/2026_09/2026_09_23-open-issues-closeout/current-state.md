# Current-state adjudication — open issues at 2026-09-23

Authoritative baseline: branch `fix/close-open-issues`, forked from `main` at `a40a6f4`.
Historical issue text is retained as provenance, but a requirement is implemented only when it remains
true in this worktree.

## Issue #24 — reconcile-normative scope width

| Requirement | Verdict | Current evidence |
| --- | --- | --- |
| Add a `Narrow scope` classification | **live** | `plugins/overcode/skills/reconcile-normative/SKILL.md` Phase D has only Keep as rule / Move to memory / Resolve. |
| Compare declared rule globs with named-symbol sites | **live** | Phase D inventories scope but performs no population comparison. |
| Detect redundant entries in one `paths:` list | **live** | No same-file containment check exists. |
| Report the maintenance risk of a narrower glob | **live** | The Phase-E reporting contract names no future-call-site risk. |

## Issue #13 — Rust detection, S7 fixture, first S8/S12 verdicts

| Requirement | Verdict | Current evidence |
| --- | --- | --- |
| Detect nested `Cargo.toml` in web/data consumers | **already satisfied** | Both skills use a depth-3 probe excluding `target/`; the data map includes Diesel, SQLx, rusqlite and SeaORM, while web distinguishes `rust-axum` and `rust-vanilla`. |
| Prevent S4's false green through `other` | **already satisfied** | `web-optimize/SKILL.md` explicitly routes frameworkless crates through recognized `rust-vanilla`, not `other`. |
| Exercise S7's template rung | **already satisfied** | `pivot-provenance-scenarios.md` run 3 records S7 PASS and the first template observation. |
| Judge S8 and S12 in run 3 | **already satisfied** | Migrated `service/evals/pivot-install-scenarios.md` records S8 FAIL in run 3 and PASS after its fix in run 4; `pivot-provenance-scenarios.md` records S12 FAIL in run 3. |

Disposition: close with existing evidence; do not repeat the implementation.

## Issue #12 — control authority and suite defects

### Target

| Requirement | Verdict | Current evidence |
| --- | --- | --- |
| Expose an unavailable proof mechanism at the `01-write` sink | **live** | `01-write` notes missing stack pivots but its output has no tooling-capability field and the action graph has no sink-to-configure handoff. |
| Reconcile cell authority with `Deciding among them` | **live** | The matrix first maps intrinsic provability to a tier while `01-write` says the selected cell produces the output name; an anchored cell can still collide with step 1's `contract`. |
| Render unmeasurable outliers distinctly from `none` | **live** | `05-stats` gives `density` three not-measurable variants but `outliers` only a count or `none`. |
| Make `testing.md` discovery case-deterministic | **live** | Actions name the lower-case path but define no exact-case rule or differently-cased diagnostic. |
| Report empty collection patterns individually | **live** | `02-audit` reports zero/partial populations per stack, not each configured pattern that matched zero files. |
| Define the dual-flag outcome for an undeciding and tool-stale strategy | **live** | `05-stats` lists independent flags, while authority S8 explicitly permits only one destination. |
| Remove ambiguity between routing prose and automatic invocation | **live** | `SKILL.md` says an action “must hand the case over”; `05-stats` says it only suggests and the user chooses. |

### Authority suite

Already repaired since the issue was opened: S1 names a nested file; S5 loads the matrix; S7 scores the contract definition site; S17 loads the domain catalogue; S6's exclusion premise and the fixture header counts were corrected.

Still live: S4/S5 cannot prove catalogue absence from their load paths; S8 allows one of two simultaneously applicable flags; S14 does not require an observed `established` count; S15 still claims `sc-js` is the sole testing-pivot provider; the current S17 criterion must follow the new explicit tooling-gap route. The historical request to repair the already-corrected rows is obsolete and will not be replayed.

## Issue #9 — routing gate and ERR-09

| Requirement | Verdict | Current evidence |
| --- | --- | --- |
| 11 missing routing suites | **obsolete count; 9 remain live** | Current `coverage.mjs`: 9 missing suites (`overcode` 3, `sc-css` 5, `sc-php` 1). |
| 7 unverifiable suites | **obsolete count; 2 remain live** | Only `seo-optimize` and `web-optimize` lack declared action tables while targeting `run`. |
| Four numerically prefixed Action cells | **live** | The same four named skills still place `01-`/`02-`/`03-` in semantic Action cells. |
| Decide `tools/` reproducibility | **already satisfied** | The test tools are versioned and run from `package.json`. |
| `ERR-09` has no marketplace correspondence | **obsolete referent** | There is no current error-code registry and no `ERR-*` identifier anywhere in `plugins/design`; inventing or deleting a nonexistent code would alter no contract. |
| Historical control measurement defects | **superseded** | The issue's own 2026-08-03 comment delegates current control defects to #12 and records the old scenario numbering as invalid. |

## Issue #8 — brownfield design + WordPress

| Requirement | Verdict | Current evidence |
| --- | --- | --- |
| Extend a compatible existing DS linter | **live** | `enforce/01-build-linter.md` always creates `design/lint/` and copies four files; `sc-php/01-realize-lint.md` always creates `check-classes.php`. |
| Produce WordPress `theme.json` presets from tokens | **partially addressed, still live** | The stack-specific receptor now owns `theme.json`, but `02-render` only ensures component background colors; it has no complete color/font-size/spacing adapter. |
| Carry token scale values in the enforcement spec | **live** | `sc-pivot-contract.md` transports flattened token paths only. |
| Move Tailwind-specific output out of agnostic design | **already satisfied by the 2.x architecture** | Current design artifacts are stack-agnostic and platform realization is delegated through DEC-002 receptors. |
| Rename `define` / redesign the five-verb funnel | **observation, not requested deliverable** | The ticket labels it secondary and proposes no acceptance criterion. No rename will be invented. |

## Baseline verification

- `coverage.mjs`: 72 skills, 0 hard problems, 2 unverifiable, 9 missing suites.
- `pivot-map.mjs`: all declared pivots reachable.
- The full `pnpm test` reaches the final FSE gate; its sole baseline failure is an environment prerequisite (`ModuleNotFoundError: playwright`), not a target regression.
