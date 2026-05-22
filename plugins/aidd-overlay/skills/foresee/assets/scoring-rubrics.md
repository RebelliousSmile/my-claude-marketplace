# Scoring Rubrics — foresee

Used by all three analyze actions. Score each dimension 1–10. Assign the score that best matches the artifact against the anchor descriptions below.

---

## analyze-doc dimensions

### Clarity (can an LLM parse this without ambiguity?)

| Score | Anchor |
|---|---|
| 10 | Every instruction is unambiguous. Terms are defined. No contradictions. No implicit assumptions. An LLM following it cold produces exactly the intended result. |
| 7–9 | Minor ambiguities present but resolvable from context. One or two implicit assumptions. No contradictions. |
| 4–6 | Several ambiguous instructions. Undefined terms used as if known. One contradiction or significant implicit assumption. |
| 1–3 | Instructions contradict each other, use undefined jargon, or leave the reader unable to determine what to produce. |

### Completeness (are all cases covered?)

| Score | Anchor |
|---|---|
| 10 | Happy path, edge cases, failure paths, and prerequisites all documented. No "obviously implied" steps left unstated. |
| 7–9 | Happy path fully covered. One or two edge cases or failure paths omitted but minor. |
| 4–6 | Happy path present but important edge cases absent. Failure handling absent or vague. |
| 1–3 | Only the happy path is sketched. Critical preconditions, error cases, and alternatives are absent. |

### Feasibility (achievable within current project constraints?)

| Score | Anchor |
|---|---|
| 10 | Fully achievable with current stack, team, and time. All dependencies in place. No undefined technical risk. |
| 7–9 | Achievable with minor clarification or one small unknown. No fundamental constraint violated. |
| 4–6 | One significant unknown or constraint issue. Partially feasible — requires scoping or tradeoff decision. |
| 1–3 | Requires unavailable technology, violates a known project constraint, or has no clear implementation path. |

---

## analyze-code dimensions

### Maintainability (how easy is it to change this safely?)

| Score | Anchor |
|---|---|
| 10 | Small, single-purpose units. Each function/class ≤ 30 lines. Clear naming. 0 hidden side effects. Fully covered by tests. |
| 7–9 | Mostly clear. One or two oversized functions or minor naming issues. Tests cover main paths. |
| 4–6 | Several large functions. Mixed responsibilities. Some hidden side effects. Partial test coverage. |
| 1–3 | God functions/classes. No clear responsibility. Side effects everywhere. Virtually untestable. |

### Correctness Risk (how likely are undetected bugs?)

| Score | Anchor |
|---|---|
| 10 | All edge cases handled. Immutable data where possible. Concurrency managed. Errors always surfaced. Tests cover edge cases. |
| 7–9 | Most edge cases handled. One or two potential null paths. No critical concurrency issue. |
| 4–6 | Several unhandled null/undefined cases. Missing error propagation in at least one path. Possible race condition. |
| 1–3 | Assumes happy path throughout. Crashes on trivial bad input. Shared mutable state. Errors silently swallowed. |

### Coupling (how problematic are the dependencies?)

| Score | Anchor |
|---|---|
| 10 | Only depends on stable, well-tested abstractions. No direct dependency on unstable externals or implementation details. Easily mocked. |
| 7–9 | One or two non-critical direct dependencies on concrete implementations. Mostly decoupled. |
| 4–6 | Directly imports and calls unstable or frequently-changing modules. Difficult to mock. Breaking change upstream likely to cascade. |
| 1–3 | Tightly coupled to several volatile externals, global state, or framework internals. Any upstream change breaks this module. |

---

## analyze-dep dimensions

### Maintenance (is the package actively maintained?)

| Score | Anchor |
|---|---|
| 10 | Release in last 3 months. ≥ 3 active maintainers. Issue response time < 2 weeks. Explicit roadmap. Backed by org or foundation. |
| 7–9 | Release in last 9 months. 1–2 maintainers. Issues addressed. No clear abandonment signals. |
| 4–6 | Last release 9–18 months ago. Solo maintainer. Issues piling up or unanswered. No roadmap. |
| 1–3 | Last release > 18 months. Archived, "no longer maintained" notice, or maintainer has publicly abandoned project. |

### Security Surface (how large is the attack surface?)

| Score | Anchor |
|---|---|
| 10 | 0 known CVEs. Minimal transitive dependencies. No runtime network access or file system permissions required. Actively security-audited. |
| 7–9 | 0 critical CVEs (may have low-severity patched). Low transitive depth. Permissions well-scoped. |
| 4–6 | 1–2 moderate CVEs (patched but upgrade not yet applied). Mid transitive depth. Some broad permissions. |
| 1–3 | Known unpatched critical CVE. Deep transitive chain with known vulnerable sub-deps. Requires broad file/network/exec permissions. |

### Lock-in (how easy is it to migrate away?)

| Score | Anchor |
|---|---|
| 10 | Thin wrapper around a standard API. 1:1 replacement alternatives exist. Usage isolated behind an abstraction layer. Migration documented. |
| 7–9 | Alternative packages exist. Migration would take hours to days. No pervasive API surface spread across the codebase. |
| 4–6 | Used directly in many files. Alternatives exist but require significant refactoring. No abstraction layer. |
| 1–3 | Framework-level coupling (every file imports it). No real alternatives. Migration would require full rewrite of affected layer. |
