# <Target> — <Aspect> Behavioural Test Scenarios

<!--
SCAFFOLD TEMPLATE — fill the placeholders, delete this comment.
One suite = one durable regression spec for ONE aspect of ONE target.
Keep it distinct from sibling suites (say what THIS file tests vs the others).
-->

Behavioural tests for **<target>** (`<path to SKILL.md / agent.md>`) — verifies that <the one behaviour this suite pins>. <If this targets a known defect, say so: "This is the regression spec for <defect>; it is expected to FAIL until <fix>.">

This suite is **distinct** from:
- `<sibling-suite>.md` — <what it tests>.
- **this file** — <the aspect under test here>.

> **Fixture / preconditions.** Run against a **populated** target: <what the fixture must contain for the decisive scenarios — filled `canon/`, ≥2 entries, an active campaign, etc.>. Reference fixture: `<name + path>`. State the relevant fixture state in every run. A precondition the fixture lacks → mark the scenario **N/A**, not FAIL.

## Scenarios

<!-- Matrix form (Situation → Expected → Pass criteria). For quality bars, a GO / NO-GO form also works (see references/harness-conventions.md). -->

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| S1  | <concrete input, adapted to the fixture domain> | <what the target should do> | <decisive, ideally write-scoped: forbidden path untouched / fact lands in scope X / mechanic invoked> |
| S2  | … | … | … |
| S3  | <a NO-GO / refuse case> | <the target must refuse / not do X> | <FAIL avoided: no forbidden write, no fabrication> |
| …   | | | |

<!-- Optional: a "data precondition" row that guards the root cause (is the data the target needs actually present?). -->

## How to run

Agent-as-<target> (dry-run, READ-ONLY on the fixture): load `<target SKILL.md / agent.md + relevant action/reference files>` + this suite, against the populated fixture `<name>`. For each scenario, reason out what the target **would** do — its response AND the precise set of files it would write/modify (paths + scope) — and judge against the pass criteria. Nothing is written to the fixture.

**Decisive observables** (write-scoped): <list the 2–4 checks that, if violated, are an automatic FAIL — e.g. `canon/` untouched, no game-tuning key written, mechanic invoked not free-narrated, listing presented not guessed>.

## Results log

<!-- append run results here per references/harness-conventions.md › Results log format -->
