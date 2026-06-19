# Review — design plugin evolutions (1.5.0 → 1.6.0)

- **Date**: 2026-06-16
- **Scope**: `git diff main` (working tree) — design plugin v1.6.0
- **Verdict**: **approve**
- **Findings**: 0 🔴 · 0 🟡 · 3 🟢

## Expected changes

Two coherent threads, both matching the audit `aidd_docs/tasks/audits/2026_06_architecture.md`:

1. **Oracle + copycat hardening (P9–P12)** — `adapters/measure/measure.py`, `agents/copycat.md`:
   per-target `check_text` (P11), LCS-aligned collection diff (P12), Windows stdout fix (P10),
   and P7/P8 promoted from optional to mandatory defaults in the agent method (P9).
2. **Path-reference normalization to `${CLAUDE_PLUGIN_ROOT}/…`** across SKILL.md / actions /
   adapters (resolves audit findings #1 + #4, the only systemic gap).

Version bumped consistently to `1.6.0` in all four manifests (plugin.json, marketplace.json,
index.json, CHANGELOG). CHANGELOG entry is accurate and thorough.

## Findings

| Sev | Location | Issue | Suggested fix |
| --- | -------- | ----- | ------------- |
| 🟢 | `skills/define/actions/05-copycat-fanout.md:49` | Normalization is incomplete: this file still uses a bare `references/correspondence-table-template.md` for the **same** template that `agents/copycat.md` now references as `${CLAUDE_PLUGIN_ROOT}/references/correspondence-table-template.md`. Out of this diff's touched files, but it is the same target the audit flagged — the systemic inconsistency isn't fully closed. | Apply `${CLAUDE_PLUGIN_ROOT}/references/…` here too (mechanical; hand to `aidd-dev:07-refactor`). |
| 🟢 | `adapters/measure/measure.py:476` | `sys.stdout.reconfigure(...)` assumes stdout is a `TextIOWrapper`. If stdout is replaced by a non-reconfigurable stream (some CI capture wrappers, `io.StringIO`), this raises `AttributeError` and aborts before any work. Low likelihood in the documented CLI path. | Guard with `if hasattr(sys.stdout, "reconfigure"):` or wrap in `try/except (AttributeError, ValueError): pass`. |
| 🟢 | audit `2026_06_architecture.md` findings #2 (README harness) & #3 (producer→consumer link) | Ranked actions #2/#3 are NOT in this diff. This is a deliberate partial delivery (commit scopes to action #1 + oracle work), not a regression — flagged only so they aren't forgotten. | Follow-up commit: add `harness` row to README Skills table; add a `design:harness` note in `05-copycat-fanout` / `05-fidelity-gate`. |

## Coverage

- **Python (`measure.py`)** — load-bearing change, reviewed line by line. `py_compile` passes on Python 3.13.
  - P12 LCS diff: `SequenceMatcher` opcode walk is correct; `equal` blocks pair maq[i1+k]↔wp[j1+k]; replace/delete/insert blocks emit `match:false` with `index:None` for WP-only extras. The set-based `missing_in_wp`/`extra_in_wp` and `ok = (maq == wp)` remain the authoritative verdict inputs — `diffs[]` is purely a human trace, as documented. Sound.
  - P11 per-target `check_text`: JS resolves `t.check_text ?? check_text` correctly; Python now emits the `prop:"text"` row whenever `__text` was captured (no longer gated on the global flag) — matches the docstring and the agent doc.
  - P10: behavior matches the comment; only the console path was vulnerable (JSON was already `ensure_ascii=False`).
- **Verdict-logic consistency** — the copycat doc's two new closure invariants are actually enforced by the script:
  - `summary.collection_failures == 0` → `_verdict` builds `failed_collections` and appends a reason per failure (blocks CLOSED). ✓
  - "every `prop:"text"` row matched or ledgered" → text rows carry a `match` field, so an unmatched one feeds `total_diff`; a `{"prop":"text"}` ledger entry is tagged by `_apply_ledger` (keys on `(element, prop)`). ✓ The doc claim is not aspirational.
- **Markdown docs** — `${CLAUDE_PLUGIN_ROOT}` rewrites verified: every newly-referenced path resolves to a real file (`references/sc-pivot-contract.md`, `skills/enforce/adapters/wordpress.md`, `skills/enforce/references/gate-wiring.md`, `references/correspondence-table-template.md`, `references/wordpress-pitfalls.md`, `references/deviation-ledger-template.md`, `adapters/measure/`).
- **Not reviewed**: runtime behavior of the oracle against a live mockup (read-only review, no execution beyond compile); the untouched `lint-core.mjs` path refs and the `"$schema":"design/references/manifest-schema#"` identifier (correctly NOT a file path — left alone).

## Follow-up

- Optional 🟢 cleanups above — none block. Hand the mechanical normalization gap (finding 1) to `aidd-dev:07-refactor`; the README/link items (finding 3) are doc follow-ups already tracked in the audit.
