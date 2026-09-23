# Existing-rule consolidation scenarios

Use these as read-only behavioural checks against `../SKILL.md`. Each `Given` cell describes the project state to construct for a run. Report intended edits and metrics; do not modify the test project while judging.

| Case | Given | Required outcome |
|---|---|---|
| R1 — unchanged rule | An old, unchanged `AGENTS.md` paragraph repeats a path-scoped `.agents/rules/` constraint and includes a long explanation of why the convention arose. The last Harvest report is recent. | Inventory both files despite their age. Keep one concise, discoverable instruction; move the explanation to memory; remove the duplicate wording only after verifying the constraint remains enforced. Report the before/after always-loaded size. |
| R2 — mixed file | One `.claude/rules/` file has a testable `src/api/**` convention, a decision history, and a runbook. | Keep the convention with its exceptions and path scope. Move history and runbook to suitable memory sections. Do not delete the whole file. |
| R3 — cross-host parity | `AGENTS.md` points to a Codex rule and `.claude/rules/` carries the same constraint for Claude Code. | Treat them as one logical constraint with two required host surfaces. Do not call the cross-host copies redundant or remove either host's only effective instruction. |
| R4 — false imperative | A memory file says “Always use provider X” but the statement describes a retired decision; current code uses provider Y. | Do not elevate it merely because it says “Always.” Verify current applicability and classify it as history or stale content. |
| R5 — approval boundary | A proposed cleanup would rewrite an existing rule and delete a duplicate file. | Show the exact before/after and preserve both until the existing-rule edit and deletion have their required confirmations. A declined change remains pending in the report, not counted as completed. |
| R6 — no archive | There are no changed memory files or ADRs, but auto-loaded rules contain duplicates and rationale. | Run consolidation anyway, before the age-based freshness pass; do not take the early exit directly to freshness. |
| R7 — narrow scope | A valid rule names `svgIcon()`, declares `lib/**/*.js`, and the symbol occurs in two files out of a substantially larger matched population. | Classify it as **Narrow scope**, not Move to memory. Report the measured populations and propose a scope containing every current site. State that a future call site outside the tighter glob will no longer auto-load the rule. |
| R8 — redundant path | One rule declares both `lib/**/*.js` and `lib/views/**/*.js`, and the measured file set of the second is wholly contained by the first. | Report the child entry as redundant even though the glob strings differ. Removing it does not count as a narrower effective population unless the surviving paths actually match fewer files. |

The run fails if it only flags stale rules, only consolidates new archive entries, treats project memory as automatically loaded, reports a load reduction without measuring the applicable entry points, or moves a write-time-verifiable constraint to memory merely because its current glob is broad.
