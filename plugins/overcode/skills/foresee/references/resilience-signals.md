# Resilience signals

Foresee uses these signals to turn authoritative AIDD evidence into bounded change and failure scenarios. They are prospective dimensions, not a second audit or a numeric quality score.

## Scenario shape

Every material scenario states:

- trigger: the change, dependency loss, partial failure, corrupt state, or rollback need;
- affected boundary and blast radius;
- observable consequence;
- detection path and expected delay;
- containment or isolation mechanism;
- recovery path and required state;
- reversibility or exit path;
- evidence links from delegated reports or repository facts;
- evidence state: `confirmed`, `inference`, or `untested hypothesis`;
- confidence `high`, `medium`, or `low`, with unknowns.

Never invent detection, containment, rollback, backup, retry, migration, or recovery behavior. Missing evidence is `unknown`; it cannot improve confidence or support a global resilient verdict.

## Target evidence

| Target | Authoritative input |
|---|---|
| Prospective document | AIDD Shadow Areas report plus explicit artifact content |
| Completed work with agreed reference | AIDD Challenge report plus both artifacts |
| Code module | Separate AIDD Audit `architecture` and `tests` reports |
| Dependency or manifest | Existing Foresee dependency-horizon output, whose AIDD audit and local horizon remain authoritative |

For code, neither architecture nor tests alone is complete resilience evidence. When one pillar is unavailable or unscannable, retain the other and mark coverage `partial`; when neither is available, report `insufficient evidence` and do not synthesize a positive verdict.

## Selection and coverage

Rank supported scenarios by plausible consequence and breadth of affected boundaries. Return at most three by default and list how many supported scenarios were omitted. `--all` is explicit consent to return every supported scenario; announce count and expected cost before continuing.

Coverage names each applicable input as `available`, `partial`, `missing`, or `not applicable`, with its receipt. Do not average AIDD severities, invent a composite score, or translate missing evidence into safety.

## Mutation boundary

Resilience analysis may persist only reports required by analytical delegates and the existing dependency-horizon action. List every path under receipt `writes`. Never invoke Assert, Test, Refactor, or implementation during analysis. Executable validation is a separate follow-up requiring an explicit user request and the selected skill's own consent contract.
