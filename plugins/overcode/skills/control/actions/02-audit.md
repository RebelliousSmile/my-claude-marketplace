# Audit

Find low-value tests in an existing suite and propose their removal - never delete without explicit per-item confirmation.

## Inputs

- `project_path` (required) - absolute path to the target project root
- `scope` (optional, default: whole project) - a subdirectory or glob to limit the audit. **`scope` designates one universe, here as everywhere in this skill: the source code and the tests that match it.** The resolution is **symmetric** - a path landing in the test tree resolves up to the corresponding source, a path landing in the source resolves down to its tests, and the universe is the pair either way. `scope=tests/legacy/` therefore stays expressible, and no action has a universe of its own. What this action *reads* is the test side of that pair; what bounds it is the pair.
- `domain` (optional) - a functional domain, resolved to code by the terms the project supplies, by **its own name**, by the terms `@../references/domain-catalogue.md` lists for it, and by the pivot's *Domain resolution* field - all four as literal case-insensitive substrings, no regex and no synonym expansion (`SKILL.md` › *Transversal rules*). Confirmed in `<project_path>/aidd_docs/memory/testing-domains.md` (`06-align`'s output) or **residue**: a name that file does not carry - or a project having no such file - is resolved per `SKILL.md` › *Transversal rules* (the name stands as declared by the argument; its **level** is the catalogue's default taken without a question where the name matches an entry, an open question where it does not, never persisted here), never collapsed into out-of-domain. It **prioritises the audit; it never restricts it**: a test matching no domain is still audited, ranks lower, and is reported with the term that failed to match it. Mutually exclusive with `scope` - given both, stop and ask which was meant (`SKILL.md`, *Parameters*). **One name, not a list** - given `domain=auth,payment`, stop and ask which was meant too: this action parses no multi-valued `domain`, and neither splitting it nor taking the first is a reading anyone asked for.
- `phase` (optional) - overrides the resolved project phase for this run only

## Outputs

```
| file | test | reason | proposed_action |
|------|------|--------|------------------|
| tests/x.spec.js | "returns default" | duplicate of tests/y.spec.js:12 | propose-delete |
```

No file is deleted as part of producing this table.

The table is preceded by the collection trace, one line per configured or inferred pattern rather than
one summary per stack:

```
enumeration:
  <stack> <pattern> -> <n> file(s) [configured | observed fallback]
```

A zero on one pattern is reported even when sibling patterns populate the union. This distinguishes a
legitimate alternate naming convention from a stale collector entry that silently stopped matching.

The table is followed by the **resolution report**, in **two slots covering opposite directions**, neither substituting for the other - the same pair `04-strengthen` renders, for the same reason:

```
unmatched: <count> term(s) resolving to nothing
  <one line each: <term> - <domain it was meant to resolve> - searched <where>>
unclassified: <count> test file(s) matched by no domain in force
  <one line each: <path> - nearest term that failed to recognise it>
```

`unmatched` is the term's direction: a term that resolved to no file is stated as such - it usually means the domain is named differently in this codebase than in the document that declared it, and an unreported miss reads as a domain that is genuinely clean. `unclassified` is the code's: a test file no domain in force recognises is **still audited** and only ranks lower, and it is reported with the term that came closest to naming it. **Rendered in every run, `domain` argument or not** - with no domain in force the count is the whole enumerated population and the nearest-term column reads `no domain in force - no term to fail`. An empty slot is then a statement, where an absent slot and a slot nobody produced read identically.

**This slot is consumed, and the side it names is why.** `unclassified` here is the **test** side of the residue; `04-strengthen` and `05-stats` report the **source** side. `06-align` composes both as a single trace at its step 3 (*undeclared area*), which is what makes a directory whose sources go unmatched while a term matches its tests readable as a naming inconsistency rather than as an unnamed area. So the side is stated in the slot, and the slot is rendered even empty: half a trace delivered without saying which half it is cannot be composed with the other.

## Process

1. Resolve `project_path` and `scope`. Enumerate test files using the **Test file glob** of **every** applicable language plugin shipping a `testing` pivot (`@../references/pivot-contract.md`) - the population is their **union**, and the run names the globs it combined. Split a pivot or runner configuration carrying several collection patterns and measure **each pattern separately before unioning**: report the pattern, stack, provenance and match count, including every zero-match pattern. A stack-level non-empty total never hides an empty constituent pattern. **For a stack with no pivot, the fallback is the project's own observed convention, never a pattern shaped by one stack.** Read how this repository actually names its tests - a `tests/` or `spec/` tree, a `test_*` or `*_test` prefix or suffix, a `.test.` or `.spec.` infix, whatever the runner it wires is configured to collect - and enumerate on that. Say the enumeration is convention-based and name the pattern used, so a reader can see what was searched.

   **A hardcoded single-stack pattern is the defect this states in place of.** `**/*.{test,spec}.*` is a JavaScript shape: it matches none of a Python suite's `test_*.py`, none of a Go suite's `*_test.go`, and none of a Rust project's `#[cfg(test)]` modules - and this action's whole output is a table of test files, so a fallback matching nothing produces an **empty candidates table that reads exactly like a clean suite**. That is the inverse of the truth and the most expensive way this action can fail.

   **An enumeration that resolved to zero test files is a finding, stated before the table.** Say which pattern was tried and that it matched nothing, and stop rather than presenting an empty table: no heuristic can flag a candidate in a population of zero, so every downstream statement of the run would be vacuously true.

   **A zero-match constituent with a non-empty union is also a finding, but does not stop the run.** Name
   the empty pattern beside the populated siblings and continue over the union. It may be an intentional
   alternate accepted by the runner or a stale convention; the action reports that fact and decides
   neither reading. Reporting only the stack total erases the distinction.

   **A partial enumeration is the same finding at a smaller scale, and it is stated too.** A repository whose tests live in two stacks - a `vitest` suite under `tests/` and Rust tests inside `#[cfg(test)]` modules of the same repository's source files - has a population no single stack's glob reaches. Name the stacks whose tests were enumerated and those whose were not, before the table. A table missing one stack's tests entirely reads as a clean stack, which is the same falsehood as an empty table, minus the tell.
2. For each test, apply three low-value heuristics:
   - **Duplicate** - asserts the same behavior as another test already in the suite.
   - **Trivial** - test body under 5 lines AND asserting only a framework/library guarantee or an unbranched assignment, excluding imports and setup/teardown. A short test that asserts a real input -> output transformation (the ideal shape of a `contract` output per `@../references/decision-matrix.md`) is not trivial merely for being short - line count alone is never sufficient to flag it.
   - **Getter/setter-only** - asserts only that a property was set or read, with no branching or business logic involved.
3. Build the candidates table with a one-line reason per row, referencing the duplicate's location when applicable.
3-bis. Resolve the project **phase** per `@../references/phase-framework.md` - **never by deduction**: argument, declaration in the project's own documentation, or a question asked before the table is built. State it with its provenance, and use it to **order** the table along its reading axes - `foundations`, and the domain-level of the domains in force, read via `<project_path>/aidd_docs/memory/testing-domains.md` - a `domain` argument that file does not carry has its level resolved first, per `SKILL.md` › *Transversal rules*, never read in the out-of-domain column by default. A run with no domain in force at all uses the **out-of-domain** column of the matrix - a column read like the other three, never a fallback carrying a substitute inventory of its own: no generic "critical journeys" list stands in for an absent domain. A candidate the current phase deprioritises rises in the list, one it raises falls. When the pivot's *Risk signals* field is loaded, it refines ordering **within** a domain by what is structurally high-consequence in this stack (money, auth, persistence, deletion, cross-cutting state) - it reports and prioritises exactly like the **density** - not like the phase, which now classifies through the cell it reads - and it classifies nothing, moves no row across domains, and qualifies no row for removal on its own. Under `default` and `undetermined` the weighting is neutral and the table comes out in heuristic order alone - say so rather than presenting an unweighted order as if it were a phase's. The phase **qualifies nothing**: a row is in this table because one of the three heuristics flagged it, never because of the phase. A test the phase deprioritises but no heuristic flags does not appear here at all - it stays - the phase prioritises, it never qualifies, and a row is proposed for removal on a heuristic criterion, never "because we are in production".
3-ter. **Density outliers point this action at a file; they never fill a row of its table.** When `05-stats` or `01-write` reported a file past 3× the project's median density under the *low-value* reading (`@../references/test-density.md`), audit that file first - the ratio says many cases sit on little logic, which is where duplicates and trivia concentrate. But a row still needs one of the three heuristics to hold. A high density is a reason to **look**, and on its own it is not a reason found: the calibration turned up a file whose cases each exercised a distinct regex alternative the denominator could not see, and every one of them was worth keeping. Report a file examined on that signal and cleared as examined and cleared - a silently dropped outlier reads as an outlier nobody looked at.
4. Present the table to the user. Delete only the rows the user explicitly confirms (individually, or via an explicit batch selection they name) - anything not explicitly confirmed stays untouched.
5. Never invoke a delete on a row the user's confirmation does not cover, mirroring `overcode:harvest`'s per-item confirmation gate. **The confirmation regime of this action is unchanged by the phase**: whatever the phase, however it re-orders the table, no row is removed unless a confirmation covers it - its own, or the batch the user named themselves. That relaxation is **unbounded on the removal side, which is this action's side**: a removal only loosens the constraints an addition would have to be weighed against, so what was approved stays approved. It exists on the addition side too, and bounded - a named addition batch is admissible within the remaining margin of every cell it touches, and one row at a time past it (`SKILL.md`, *Transversal rules*). Stating the asymmetry as an absence would misdescribe the rule the other side actually runs under.

## Test

**Referred by file, never by row number.** A row list goes stale on the next renumbering of a suite, and a stale list is worse than none - it points a reader at a scenario that now tests something else. Each suite below declares the actions it targets in its own opening paragraph; that declaration is the authority for this list, and it is the thing to re-read when a suite is added or re-scoped.

Covered by `../evals/authority-scenarios.md`, `../evals/confirmations-scenarios.md`, `../evals/domains-scenarios.md` and `../evals/chaining-scenarios.md`.

`confirmations-scenarios.md` owns whether a removal may be confirmed as a batch; `domains-scenarios.md` owns the domains in force and their residue; `authority-scenarios.md` owns what qualifies a removal; `chaining-scenarios.md` owns the graph position.

Run: `overcode:behave 02-run <suite> <fixture>`.
