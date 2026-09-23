# Enforce — Routing autonomy Behavioural Test Scenarios

Behavioural tests for **design:enforce**. Authority: `SKILL.md` §Routing; `actions/00-inspect.md` §Process; `actions/04-pivot.md` §Étape 2–4; `actions/05-fidelity-gate.md` §Refus d'affirmer la conformité; `references/control-priorities.md`.

> **Fixture / preconditions.** S1 uses contract-absent `plugins/design/fixtures/brief-only/`; command scenarios use named configs under `skills/enforce/fixtures/`; host wiring uses `skills/enforce/fixtures/dual-host/`; `tools/run-gates.py` is the deterministic oracle.

## Scenarios

| # | Situation (input) | Expected behaviour | Pass criteria |
|---|---|---|---|
| S1 | Audit `plugins/design/fixtures/brief-only/page.html`, whose project has no `release.json`. | Select `inspect` alone. | Output states `conformity: not assessed`; intended writes are `[]`; no maturity or green-gate claim appears. |
| S2 | Run `gates.clean.config.json`, whose pre-commit workflow check fails. | Keep the successful outcome verdict and emit a P2 warning. | Process exits 0 and stdout contains `WARNING P2`. |
| S3 | Run `gates.missing-evidence.config.json`, whose P0 report is absent. | Block for missing outcome evidence. | Process exits 1 and stdout contains `MISSING EVIDENCE state-colour-icon`. |
| S4 | Run `gates.below-threshold.config.json`. | Preserve the public maturity code over detected violations. | Process exits 4; violations remain reported but do not replace the maturity result with exit 1. |
| S5 | Run with a missing config path. | Preserve the public invalid-invocation code. | Process exits 2 and names the missing configuration. |
| S6 | Run `gates.legacy.config.json`. | Preserve the public legacy-contract code. | Process exits 3, names absent `release.json`, and recommends migration. |
| S7 | Ask to freeze a mutable draft. | Do not activate enforcement. | Selected target is `adjust/arbitrate`; no `enforce` action is selected. |
| S8 | Ask to render one frozen component. | Do not activate enforcement as the entry skill. | Selected target is `diffuse/render`; internal gates may be downstream, but no enforcement router action is the entry point. |
| S9 | Wire gates in `dual-host/`, which contains both `AGENTS.md` and `.claude/rules/`. | Select `wire-gates` and plan equivalent persistent instructions for both hosts. | Intended writes update the applicable `AGENTS.md` section and `.claude/rules/08-design/01-enforce.md`; no installed plugin `SKILL.md` is an intended write. |
| S10 | Install the linter from a Codex-loaded skill while the working directory is unrelated and no plugin-root environment variable exists. | Resolve `DESIGN_PLUGIN_ROOT` from the loaded `enforce/SKILL.md` path, then select `build-linter`. | Source reads name the resolved plugin copies of `run-gates.py`, `lint-core.mjs`, `migrate-contract.py`, and `status.py`; no path starts at `/tools` or depends on `CLAUDE_PLUGIN_ROOT`. |
| S11 | Build enforcement in a brownfield project whose existing DS gate has a machine-readable extension marker. | Select `build-linter` in `extend` mode. | The existing command remains the only entrypoint; generated files live below `design/lint/generated/design-enforce-v2/`; rerunning replaces the marked block without duplicates. |
| S12 | Build enforcement where a DS linter exists but has no explicit extension marker. | Refuse an implicit overwrite or parallel install. | Output shows the proposed integration diff and stops before writing. |
| S13 | Pivot native enforcement for a platform configuration that exposes raw token values. | Emit both token paths and resolved token scales. | Canonical values and each named theme overlay are present; the receptor is required to validate raw values against the active scale. |

## How to run

Agent-as-enforce plus deterministic commands. Record entry action, stdout, public exit code and intended writes.

**Decisive observables:** read-only diagnostic without contract; P0/P1 block; P2 warns; public exits 0–4 remain stable; freeze/render entry routes are discriminated.

## Results log

### 2026-08-12 — run 1 (initial, dry-run, target=enforce, fixture=gate-configs+brief-only) — **7 PASS, 1 N/A**

Fixture state: deterministic configs produced exits 0/1/2/3/4; contract-absent fixture initially lacked a rendered page.

| # | Behaviour | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | contractless inspect | N/A | — | rendered page absent |
| S2 | P2 warns, exit 0 | PASS | — | `control-priorities.md §P2` |
| S3 | P0 missing, exit 1 | PASS | — | `control-priorities.md §P0` |
| S4 | maturity exit 4 | PASS | — | `SKILL.md §Transversal rules` |
| S5 | invalid config exit 2 | PASS | — | `SKILL.md §Transversal rules` |
| S6 | legacy exit 3 | PASS | — | `SKILL.md §Transversal rules` |
| S7 | freeze entry excluded | PASS | — | `adjust/SKILL.md §Routing` |
| S8 | render entry excluded | PASS | — | `diffuse/SKILL.md §Routing` |

**Frictions / gaps:** S1 required a concrete rendered target.
**Tally:** 7/7 applicable PASS (1 N/A) — fixture gap reproduced.

### 2026-08-12 — run 2 (post-fix, dry-run, target=enforce, fixture=gate-configs+brief-only-page) — **8/8 PASS**

Fixture state: `brief-only/page.html` contains an h1/button and its project has no release; gate exits remain 0/1/2/3/4.

| # | Behaviour | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | inspect, no conformity claim | PASS | ▲ | `actions/00-inspect.md §Input,Output,Process` |
| S2–S8 | priority, exits and NO-GO | PASS | = | citations from run 1 remain applicable |

**Frictions / gaps:** none.
**Tally:** 8/8 PASS (0 N/A) — fixture gap closed.

### 2026-08-12 — run 3 (regression, dry-run, target=enforce, fixture=gate-configs+brief-only-page) — **8/8 PASS**

Fixture state: contractless page remains populated; deterministic gate commands still expose public exits 0/1/2/3/4.

| # | Behaviour | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | inspect, no conformity claim | PASS | = | `actions/00-inspect.md §Input,Output,Process` |
| S2 | P2 warns, exit 0 | PASS | = | `control-priorities.md §Evidence rules` |
| S3 | P0 missing, exit 1 | PASS | = | `control-priorities.md §P0` |
| S4 | maturity exit 4 | PASS | = | `SKILL.md §Transversal rules` |
| S5 | invalid config exit 2 | PASS | = | `SKILL.md §Transversal rules` |
| S6 | legacy exit 3 | PASS | = | `SKILL.md §Transversal rules` |
| S7 | freeze entry excluded | PASS | = | `adjust/SKILL.md §Routing` |
| S8 | render entry excluded | PASS | = | `diffuse/SKILL.md §Routing` |

**Frictions / gaps:** none.
**Tally:** 8/8 PASS (0 N/A) — no PASS→FAIL regression.

### 2026-08-12 — run 4 (post-fix, dry-run, target=enforce, fixture=gate-configs+dual-host) — **10/10 PASS**

Fixture state: public exits remain 0–4; dual-host has a populated 2.x contract whose real
`run-gates.py` invocation exits 0, plus `AGENTS.md` and `.claude/rules/`; root resolution starts
from loaded SKILL.md.

| # | Behaviour | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | inspect, no conformity claim | PASS | = | `actions/00-inspect.md §Input,Output,Process` |
| S2 | P2 warns, exit 0 | PASS | = | `control-priorities.md §Evidence rules` |
| S3 | P0 missing, exit 1 | PASS | = | `control-priorities.md §P0` |
| S4 | maturity exit 4 | PASS | = | `SKILL.md §Transversal rules` |
| S5 | invalid config exit 2 | PASS | = | `SKILL.md §Transversal rules` |
| S6 | legacy exit 3 | PASS | = | `SKILL.md §Transversal rules` |
| S7 | freeze entry excluded | PASS | = | `adjust/SKILL.md §Routing` |
| S8 | render entry excluded | PASS | = | `diffuse/SKILL.md §Routing` |
| S9 | equivalent Codex/Claude persistence | PASS | new | `actions/02-wire-gates.md §Étape 3`; `host-portability.md §Persistent project instructions` |
| S10 | artifact-derived plugin root | PASS | new | `host-portability.md §Root resolution`; `actions/01-build-linter.md §Étape 2` |

**Frictions / gaps:** none.
**Tally:** 10/10 PASS (0 N/A) — real green gate, host persistence and root portability confirmed.

### 2026-09-23 — run 5 (generality, dry-run, target=enforce, fixture=gate-configs+dual-host+brownfield-contract) — **13/13 PASS**

Fixture state: the prior deterministic configs and dual-host baseline remain green; brownfield cases are
checked against the explicit extension marker contract and the token-scale pivot schema.

| # | Behaviour | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|---|
| S1 | contractless inspect | PASS | = | `actions/00-inspect.md § Process` |
| S2 | P2 warns, exit 0 | PASS | = | `control-priorities.md § Evidence rules` |
| S3 | P0 missing, exit 1 | PASS | = | `control-priorities.md § P0` |
| S4 | maturity exit 4 | PASS | = | `SKILL.md § Transversal rules` |
| S5 | invalid config exit 2 | PASS | = | `SKILL.md § Transversal rules` |
| S6 | legacy exit 3 | PASS | = | `SKILL.md § Transversal rules` |
| S7 | freeze entry excluded | PASS | = | `adjust/SKILL.md § Routing` |
| S8 | render entry excluded | PASS | = | `diffuse/SKILL.md § Routing` |
| S9 | equivalent Codex/Claude persistence | PASS | = | `actions/02-wire-gates.md § Étape 3` |
| S10 | artifact-derived plugin root | PASS | = | `host-portability.md § Root resolution` |
| S11 | marked brownfield gate extended in place | PASS | new | `actions/01-build-linter.md § Étape 0` |
| S12 | ambiguous existing gate fails closed | PASS | new | `actions/01-build-linter.md § Étape 0` |
| S13 | paths and resolved values cross the pivot | PASS | new | `actions/04-pivot.md § Étape 2` |

**Frictions / gaps:** none.
**Tally:** 13/13 PASS (0 N/A) — brownfield ownership and raw-value authority are explicit.
