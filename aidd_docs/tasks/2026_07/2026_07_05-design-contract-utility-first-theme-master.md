---
name: master_plan
description: Parent plan orchestrating 8 architectural findings of the design-plugin audits — audit 1 (2026_07 design-cycle-critique): utility-first mode, theme/mode token model, v3 Tailwind adapter contract, WP/SPA track factoring; audit 2 (field audit, "choix-narratifs"): retrofit reconciliation at freeze, destructure critique persistence, brief-path fidelity limit, orphan-wireframe hand-off.
---

# Master Plan: design contract — utility-first + theme/mode + adapter + track factoring + freeze/critique/diffuse hardening

## Overview

- **Goal**: Close 8 architectural findings across two independent audits — all are changes to the **public contract** of the `design` plugin (Markdown instruction files + JSON schemas + the Node baseline linter + the sc-pivot spec), not application code. Audit 1 (design-cycle critique): #2 utility-first, #3 theme/mode, #6 v3 adapter, #8 track factoring. Audit 2 (field audit on the real "choix-narratifs" project, first-hand execution): retrofit reconciliation at freeze, destructure critique persistence, brief-path fidelity limit, orphan-wireframe hand-off.
- **Risk Score**: 8/10 — breaking changes to a public contract, a `tokens.json` schema extension, a freeze-time reconciliation step, 10+ artifacts touched, one cross-cutting doc refactor. Mitigated by backward-compatible, additive design and explicit arbitration gates (A0–A12). No new part is destructive: every change is additive and self-neutralizing on projects that don't hit the case.
- **Branch**: `design/contract-utility-first-theme`
- **Read-only until approval**: this master + its 7 child plans are the deliverable. No contract file is edited before the arbitration gates below are resolved.

## Source

- **Audit 1** — `plugins/design/audits/2026_07_design-cycle-critique.md` (findings #2, #3, #6, #8). Out of scope from audit 1: #1 (already fixed in `lint-core.mjs:81-86`, forward-map), #4 (already covered — `sc-js/.../01-realize-lint.md` archetype A includes Vue), #5/#7/#9 (S-effort doc-drift / arbitrate-degenerate / checkpoint — separate quick-win batch).
- **Audit 2** — independent field audit conducted on the real "choix-narratifs" project (2026-07-05), findings met and worked around live during a real execution (first-hand evidence, not hypothetical), each confirmed by re-reading the actual plugin source. No separate audit doc in-repo; the four findings, with their source anchors, are:
  - **F2-1 retrofit reconciliation at freeze** — `adjust/02-freeze.md` reconciles `components.json` with the prose charter (§ "Concordance avec la couche 3", line ~62; validity test line ~118) but never with the classes/token-usage present in already-written code; retrofit drift is caught only later at `enforce/03-lint-instances`. → **Part 5**.
  - **F2-2 destructure critique persistence** — `destructure/SKILL.md` + `actions/01-challenge.md`: read-only critique never written to disk (only `si demandé`, 01-challenge line ~31); lost on session end / context compaction. → **Part 6**.
  - **F2-3 brief-path fidelity limit** — `enforce/05-fidelity-gate.md` measures fidelity to a resolved mockup; no equivalent for the `define/03-construct` from-brief path (no reference visual), and this assumed limit is documented nowhere. → **folded into Part 4**.
  - **F2-4 orphan-wireframe hand-off** — `diffuse/SKILL.md` + `adapters/html-css.md` + `actions/02-render.md`: the baseline renderer (no `sc-*:design-bridge` pivot) can leave orphan previews with no integration path into a real app component. → **Part 7**.

## Sequencing rationale (dependency-minimizing, not severity order)

The audit-1 findings interlock on two shared surfaces: the **token/adapter layer** (#3, #6) and the **lint/manifest layer** (#2). #8 is orthogonal (doc/architecture factoring). The audit-2 findings attach to existing surfaces by dependency, not by severity. Order chosen to avoid re-specifying the same surface twice:

```
Part 1  #3    theme/mode dimension in the token schema + theme-aware adapter emission
   │          (FOUNDATION: color model + emission conventions)
   │
Part 2  #2    utility-first mode first-class — layer-2 token-usage rules + baseline lint + pivot spec
   │          (consumes #3's color namespaces)
   │
   ├──────────────────────────────────────────────┐
   │                                               │
Part 3  #6    explicit v3 Tailwind adapter artifact       Part 5  F2-1  retrofit reconciliation at freeze
   │          (adapter-layer cleanup, theme-aware)                    (needs #2's mode to know what to reconcile vs code)
   │                                                                  (true dep: Part 2 only)
   ├──────────────────────┐
   │                      │
Part 4  #8 + F2-3         Part 7  F2-4  orphan-wireframe hand-off
   track factoring +          (shares diffuse files with #6 → after Part 3)
   brief-path fidelity limit  (true dep: Part 3 only)

Part 6  F2-2  destructure critique persistence   (fully orthogonal — no dependency, any time)
```

**True dependencies** (looser than the strict numbered order below): Part 5 ← Part 2 (mode); Part 7 ← Part 3 (shared `diffuse/SKILL.md` + `adapters/html-css.md`, avoid double-touch); Part 6 independent; Part 4 unchanged (#8) but now also hosts F2-3 (brief-path fidelity limit) since it already touches `05-fidelity-gate.md` with the same "when the oracle applies" note — folding avoids re-touching that file twice.

Each part is **independently shippable** (additive, backward-compatible): a mono-value `tokens.json` stays valid after #3; a BEM/hand-HTML project stays valid after #2; the v3 adapter clarification (#6) does not change existing v4 behaviour; #8/F2-3 change only how docs are organized; the freeze reconciliation (F2-1) is self-neutralizing on greenfield; critique persistence (F2-2) is default-on with an opt-out; the orphan hand-off (F2-4) adds a delivery obligation without relaxing the lint gate.

> **Arbitration A0 (ordering)**: #2 is the highest-severity / top-ranked finding but is sequenced 2nd here for dependency reasons (its color-namespace rules read the theme-aware structure delivered by #3). If value-first delivery is preferred, #2 can lead — at the cost of re-touching the color-namespace rules once #3 lands. Decide before Part 1 starts.
>
> **Numbering vs dependency**: the strict `Plan N+1 blocked until Plan N` rule (below) is the conservative default and is safe (it is a superset of the true dependency graph). Parts 5–7 may be parallelized against their true dependencies (5←2, 7←3, 6←none) if faster delivery is wanted — decide before Part 5 starts.

## Child Plans

| #   | Plan                                          | File            | Finding      | Effort | Status  | Validated | Depends on |
| --- | --------------------------------------------- | --------------- | ------------ | ------ | ------- | --------- | ---------- |
| 1   | theme/mode token dimension + adapters         | `./*-part-1.md` | #3 High      | L      | done        | [ ]       | —          |
| 2   | utility-first mode first-class                | `./*-part-2.md` | #2 High      | L      | blocked | [ ]       | Part 1     |
| 3   | v3 Tailwind adapter artifact contract         | `./*-part-3.md` | #6 Med       | M      | blocked | [ ]       | Part 2     |
| 4   | app-JS vs WP/maquette track factoring + brief-path fidelity limit | `./*-part-4.md` | #8 Low + F2-3 | M | blocked | [ ]       | Part 3     |
| 5   | retrofit reconciliation manifest↔code at freeze | `./*-part-5.md` | F2-1 Med/L | L      | blocked | [ ]       | Part 2     |
| 6   | destructure critique persistence              | `./*-part-6.md` | F2-2 Med/L   | M      | blocked | [ ]       | — (orthogonal) |
| 7   | orphan-wireframe hand-off (diffuse baseline)  | `./*-part-7.md` | F2-4 Med/L   | M      | blocked | [ ]       | Part 3     |

<!-- RULE (conservative default): Plan N+1 blocked until Plan N checkbox checked. The "Depends on" column is the true dependency graph — Parts 5–7 may be unblocked against it instead (5←2, 7←3, 6←none) if parallelization is chosen at Part 5. -->

## Arbitration gates (resolve at each part's Phase 0 — no improvisation)

These are the contract decisions the audit flags as "à expliciter". Each child plan opens with the gate it owns.

- **A0 — ordering** (this file): #3-first (dependency) vs #2-first (value). Default: #3-first.
- **A1 — mode representation** (Part 1 / #3): inline `$value`-per-mode object vs a top-level `themes` overlay keyed by mode. DTCG has no native mode primitive; both are conventions.
- **A2 — emission mechanism** (Part 1 / #3): `.dark` class vs `[data-theme="x"]` attribute vs both; default theme in `:root` vs a named block. Determines whether `lint-core.mjs` needs new valid-var names (suffixed vars) or reuses the same names re-declared per block.
- **A3 — 2nd thematic territory** (Part 1 / #3): is "Grimoire" a second value on the same axis as dark (flat list of themes) or an orthogonal axis (mode × theme matrix)? Drives whether the overlay is 1-D or 2-D.
- **A4 — utility-first rule scope** (Part 2 / #2): which token-usage rules land in the **baseline** (candidates: raw-hex-forbidden, allowed color namespaces, state = colour + icon) vs stay in the pivot. Bounded by `lint-core.mjs` being a regex string-scanner (no CSS/AST parse) — pick rules it can enforce without false positives.
- **A5 — layer-2 shape** (Part 2 / #2): a new `usage`/`rules` section inside `components.json` vs a sibling manifest file; and how utility-first rules coexist with the existing BEM vocabulary for hand-HTML projects (both modes valid, or mutually exclusive per project).
- **A6 — mode detection** (Part 2 / #2): utility-first mode auto-detected (no BEM in code) vs an explicit contract flag.
- **A7 — v3 adapter artifact** (Part 3 / #6): canonical filename + whether the contract emits a full `tailwind.config.*` or a `theme.extend` partial for merge into an existing config (Nuxt), and the exact wiring instruction.
- **A8 — factoring shape** (Part 4 / #8): two parallel track docs vs a per-action `Track:` marker/section vs a routing preamble in each SKILL; and whether WP refs move under a `references/tracks/wp/` subtree or stay in place, referenced conditionally.
- **A9 — brief-path fidelity limit** (Part 4 / F2-3): document the absence of a fidelity gate on the `define/03-construct` (from-brief, no reference visual) path as an **assumed contract limit** (gate profile = vocabulary + best-practice) vs introduce a substitute self-consistency/best-practice gate. Default: document the limit (option 1); the from-brief case must be named in `05-fidelity-gate.md`, not left implicit.
- **A10 — retrofit reconciliation at freeze** (Part 5 / F2-1): (a) does `02-freeze` scan the consumer codebase before freezing (reusing `lint-core.mjs` as oracle); (b) mode-aware scan scope (BEM class-vocab vs utility token-usage per Part 2); (c) divergence policy per direction — code→manifest **blocking**, manifest→code **warning + ledger**, never silent auto-mutation; (d) always-on (self-neutralizing on greenfield) vs a retrofit flag. Default: always-on, blocking code→manifest.
- **A11 — critique persistence** (Part 6 / F2-2): (a) canonical location/naming (dated history `design/critique/<date>-<target>.md` vs single overwrite vs append-log); (b) default-on vs opt-in (current = opt-in `si demandé`); (c) reconcile with destructure's "lecture seule" invariant (read-only = never edits the **contract**/source; may write its own critique report); (d) consumption — `adjust/01-arbitrate` reads the latest critique as optional, non-blocking input. Default: dated history, default-on, carve-out stated, adjust consumes.
- **A12 — baseline output status + orphan hand-off** (Part 7 / F2-4): (a) baseline HTML/CSS render is a **disposable, explicitly-labelled preview** vs a first-class deliverable requiring an integration path; (b) does `02-render` emit a hand-off note + a conditional "install `sc-<techno>` for native render" recommendation when a JS/WP stack is detected without a pivot; (c) surface the boundary in render message + `SKILL.md` + adapter doc; (d) the enforce gate is unchanged — lint-vert stays necessary, the hand-off is an *additional* obligation. Default: labelled preview + mandatory hand-off, conditional pivot nudge.

## Validation Protocol

1. Resolve A0. Complete Part 1 (#3), run its `success_condition`.
2. [ ] Checkpoint 1: user confirms theme/mode model + adapter emission.
3. Unblock Part 2 (#2), resolve A4–A6, complete, run `success_condition`.
4. [ ] Checkpoint 2: user confirms utility-first rule set + lint behaviour.
5. Unblock Part 3 (#6), resolve A7, complete, run `success_condition`.
6. [ ] Checkpoint 3: user confirms v3 adapter contract.
7. Unblock Part 4 (#8 + F2-3), resolve A8 **and A9**, complete, run `success_condition`.
8. [ ] Checkpoint 4: user confirms two-track factoring **and** the documented brief-path fidelity limit (A9).
9. Unblock Part 5 (F2-1; true dep = Part 2), resolve A10, complete, run `success_condition` (retrofit fixtures green, existing fixtures unchanged).
10. [ ] Checkpoint 5: user confirms the freeze-time retrofit reconciliation policy (blocking direction, greenfield-neutral).
11. Unblock Part 6 (F2-2; orthogonal), resolve A11, complete, run `success_condition`.
12. [ ] Checkpoint 6: user confirms critique persistence (path, default-on, adjust consumption, read-only carve-out).
13. Unblock Part 7 (F2-4; true dep = Part 3), resolve A12, complete, run `success_condition`.
14. [ ] Checkpoint 7: user confirms the baseline-preview status + orphan hand-off (lint gate unchanged).
15. [ ] Final: `overcode:behave` / eval scenarios of the touched skills pass; CHANGELOG + plugin.json version bump; full `lint-core.mjs` fixture suite green (incl. `themed-*`, `utility-*`, `retrofit-*`).

## Cross-cutting invariants (all parts)

- **Contract authority preserved**: `design` keeps the QUOI, `sc-*` keep the COMMENT. New enforcement lives in the design **baseline**, not only in a pivot the user must rebuild (this is the whole point of #2).
- **Backward compatibility**: every change is additive; existing frozen contracts (mono-value tokens, BEM manifests, v4 `@theme` emission) keep working with no migration required.
- **`$version` discipline**: `tokens.json` / `components.json` bumps stay in phase with `design-system.md` (per `manifest-schema.md` invariant 5). Bump the plugin `version` in `.claude-plugin/plugin.json` and add a CHANGELOG entry per part.
- **No doc-drift introduced**: any verb/artifact name changed in one file is propagated to every referencing file in the same part (the #5 lesson).

## Estimations

- **Confidence**: 9/10 (plan structure & projection). Implementation-detail confidence is deliberately deferred to gates A1–A12 — that deferral is the de-risking mechanism, not a gap.
- **Duration**: 7 parts; #3 (Part 1), #2 (Part 2) and F2-1 (Part 5) are the L-effort cores; #6, #8+F2-3, F2-2, F2-4 are M. Strict-linear default is 7 sequential; the true dependency graph (5←2, 7←3, 6←none) allows Parts 5–7 to run in parallel with Parts 3–4 if chosen.
