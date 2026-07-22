# 04 - Strengthen

Find the coverage gaps that actually matter in an existing suite, ranked by risk, and propose the smallest set of tests that closes the most exposure - never a bulk "raise coverage to N%" campaign.

Mirror image of `02-audit`: `audit` removes tests that carry no value, `strengthen` adds the few that carry the most. Both are bounded by the same number constraint - a gap is only worth a test when the risk it leaves open outweighs the maintenance cost of the test.

## Inputs

- `project_path` (required) - absolute path to the target project root
- `scope` (optional, default: whole project) - a subdirectory or glob to limit the analysis
- `top_n` (optional, default: 5) - how many ranked gaps to report
- `phase` (optional) - overrides the resolved project phase for this run only

## Outputs

```
| rank | gap | risk_factors | proposed_tier | why_it_matters |
|------|-----|--------------|---------------|----------------|
| 1 | src/billing/proration.js:computeRefund (branches 2/7 covered) | money, 6 branches, 4 fix-commits in 90d | contract | a wrong branch silently refunds the wrong amount, no other safety net |
```

Preceded by the resolved `phase` and its provenance, which is what the ranking is weighted by.

Followed by an explicit statement of what was deliberately **not** proposed and why (framework pass-throughs, generated code, paths already covered by an e2e journey), and - when any external contract boundary was found - of what is **out of reach of testing** and referred to monitoring.

No test file is written as part of producing this table.

## Process

1. Resolve `project_path` and `scope`. Load the target project's documented test strategy if present, else `@../references/decision-framework.md`. Detect the active language plugin and load its `testing` pivot per `@../references/pivot-contract.md` for **Coverage command**, **Source glob & exclusions**, **Risk signals**, the test runner and the test file glob.

   Resolve the project **phase** per `@../references/phase-framework.md` and state it in the report header with its provenance (`argument` / `declared <path>` / `answered` / `undetermined`). The phase is **never deduced**: when neither the argument nor the project's documentation gives it, **ask before ranking anything** - the answer is what the order is built on, so a table produced first and re-sorted after is a table the user has already read in the wrong order. The phase re-weights the criteria in step 3; it changes no proposed tier, no exclusion, and neither of the two bounded edge cases below.

   State which strategy is in force. When the project documents none, say so in the report and state the consequence plainly: `limit` stays `null`, so nothing caps the suite's growth but this action's own restraint. An undocumented project is reported as undocumented, never as implicitly following the default.

2. **Establish the universe to rank, then enrich it.** The **Source glob & exclusions** field pilots: it defines which files are classifiable production code. The coverage report only adds branch detail to that universe - it never defines it.
   - Run the pivot's **Coverage command** as written and read per-file **branch/line** coverage. It is expected to produce a machine-readable report and to be decoupled from any coverage gate: a non-zero exit code from a threshold check is not a failure to read. Reason on `covered`/`total`, never on a percentage alone - a file with no branches reports 100% branch coverage while being entirely untested.
   - **A file matching the source glob but absent from the coverage report is uncovered, not nonexistent.** Reports frequently omit files no test ever imports, which is precisely the population most at risk; treating absence as coverage would hide exactly the gaps this action exists to find.
   - No **Coverage command**, or none configured in the project: fall back to a static pass, mapping source modules to test files via the pivot glob and flagging modules no test references at all. State in the output that the ranking is static-only and therefore coarser.
   - When no pivot is available, fall back to the project's own directory convention and say the universe is approximate.
3. Rank each candidate gap by risk, not by missing percentage. Coverage percentage is a symptom, never the target. Weight the six criteria below, **re-weighted by the resolved phase** per the table in `phase-framework.md` - the order given here is the neutral one, used as-is under `undetermined`:
   - **Consequence** - the code handles money, auth/permissions, persistence, deletion, or anything else whose silent failure is not self-evident to a user. When the pivot supplies **Risk signals**, they are the stack-specific expression of this weight and take precedence over a generic reading. They **prioritise only**: a signal may move a gap to the top of the table, never change the tier proposed for it - tier authority stays with the loaded tier table.
   - **Branching** - number of untested branches / conditions; a many-branch uncovered function outranks a long uncovered straight line.
   - **Churn** - frequency of recent changes, and how many of those commits were fixes, from the project's own git history. Code that keeps breaking is code that lacks a test.
   - **Blast radius** - how many callers depend on it.
   - **Absence of any other net** - no type check, no runtime validation, no e2e journey already crossing this path.
   - **External contract dependency** - the code depends on a third party's contract: an analytics or marketing SDK, a tag container, a transactional-email or CRM client, a payment SDK, an outgoing webhook, any client calling a domain the project does not control. The five criteria above are all internal, and none of them fires when the thing that breaks is the vendor - a major version can move, or a schema can change server-side, without a single line of the repository moving. Raised in `production`, **dominant in `sustaining`**, lowered in `scaffolding` where integrations are not wired yet. The stack-specific inventory comes from the pivot's **Risk signals**; without a pivot, read the project's manifest for dependencies pointing at domains it does not control, and say the inventory is generic.

     **Say what a test proves here, and what it does not.** Provable in process, at `contract` tier: the payload the code builds is the one it believes it is sending, and the **degraded path** behaves correctly when the vendor errors, returns an unexpected schema, or returns nothing. Not provable by the suite: that the vendor still accepts that payload - that needs a real, slow, quota-bound call. Report it as **out of reach of testing** and refer it to monitoring; never propose a test for it, which would trade a real gap for a false assurance.

     **Cost cap, per boundary.** One boundary is worth one test by default - the degraded path, and only when a vendor failure can interrupt the journey (blocking script, unhandled rejection, response schema consumed without a guard). An outbound-only integration whose failure is invisible client-side gets no test and is declared *monitored outside the test suite*. The built payload earns a second test only when it carries data with a verifiable in-process consequence: an amount, an order identifier, an authorisation status, a consent. This is a ceiling, not a quota - an integration may legitimately receive nothing.
4. Exclude from the ranking, and say so explicitly in the output:
   - everything the pivot's **Source glob & exclusions** declares non-classifiable (build artifacts, generated code, config, barrel re-exports, fixtures), and everything its **Risk signals** list as structurally not deserving a test of their own. Without a pivot, apply the generic equivalent - build output, vendored and generated code - and say the exclusion list is generic;
   - anything the loaded tier table classifies as `skip` (framework pass-throughs, unbranched assignments);
   - paths already exercised end-to-end where the missing unit test would only re-assert what the journey already proves.

   **Edge case - no suite at all.** When the project has no test file matching the glob, produce no ranking. Ranking the entire source tree would deny the number constraint and turn this action into the bulk campaign it exists to prevent. Report the situation as a finding, point at the strategy document (or its absence) as the thing to settle first, and stop.

   **Edge case - saturation.** When the number of qualifying gaps vastly exceeds `top_n`, say so rather than presenting the top rows as if they were the whole story. Report the total, state that the ranking cannot be meaningful across a population that size, and propose narrowing `scope` to a subsystem the user can actually act on.
5. For each of the `top_n` gaps, propose a tier by running it through the loaded tier table (same decision order as `01-write`), and prefer **strengthening an existing test's assertion** over adding a new file whenever the code path already has a test - report that as the proposed action instead of a new test.
6. Present the ranked table. Nothing is written yet.
7. For each row the user explicitly confirms (individually, or via a batch they name themselves), hand it to `01-write` with the gap as `behavior` - so the tier decision, the number-constraint check and the delegation to `aidd-dev:06-test` all go through the single existing gate. Never bypass `01-write`, and never write a test for a row the user did not confirm.

   **Cumulative guard.** When more than one row is confirmed, state the total before the first handoff, and pass the rows through `01-write` **one at a time**. Each test added changes the number-constraint arithmetic for the next: a batch confirmed in one breath must not become a batch written without the constraint being re-evaluated between each.

## Test

Run against a real project that has both a test suite and at least one meaningfully uncovered code path. Verify the report is ranked by risk rather than by coverage percentage (a high-consequence gap with few missing lines must outrank a low-consequence gap with many), that each row carries a proposed tier and a one-line justification, and that the exclusions section is present. Verify no test file is created by this action alone - creation only happens through a confirmed handoff to `01-write`.

**Never** a mocked coverage report - the first real coverage run, or the real static fallback on a real repository, is the test.
