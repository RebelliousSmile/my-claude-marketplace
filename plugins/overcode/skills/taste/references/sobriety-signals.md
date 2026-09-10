# Sobriety signals

Use these signals only after product purpose and a bounded target are known. They guide Taste's product-and-volume judgment; they do not replace an AIDD audit, review, or challenge report.

## Product-purpose authority

Resolve purpose in descending authority:

1. explicit current user intent;
2. active specification, ticket, or plan for the target;
3. current project memory or README.

Expose contradictions. Do not silently choose a lower-authority source, and do not turn missing telemetry into proof that a feature has no value.

## Complete footprint

For each candidate, trace the bounded feature through all directly attributable:

- production source and public surface;
- tests and fixtures;
- configuration, flags, migrations, adapters, dependencies, and compatibility code;
- documentation and examples.

Use repository search to follow a named candidate and its references. Do not build a generic language detector or rescan code-quality concerns already owned by AIDD. Report unknown portions instead of estimating them as zero.

## Verdicts

| Verdict | Use when |
|---|---|
| `Add minimally` | Essential product purpose currently fails and the smallest conforming addition is known. Positive net growth is allowed only with this justification. |
| `Retain` | The capability has unique, demonstrated value and no smaller form is supported by evidence. Size alone never defeats this verdict. |
| `Simplify` | Required behavior remains while an abstraction, branch, layer, or ceremony can disappear. |
| `Merge` | Multiple variants serve the same purpose and one coherent path can preserve the required behavior. |
| `Remove` | The whole capability can disappear while essential purpose remains intact and the functional loss is explicit. |

A candidate may carry `Add minimally` plus `Merge` when a small shared primitive replaces proven duplication. Do not invent a general framework for hypothetical consumers.

## Evidence and confidence

Every candidate records:

- purpose served and its authority;
- evidence from AIDD plus direct repository references;
- full known footprint and unknown portions;
- gross additions, gross removals, and net surface change across source, tests, configuration, and documentation;
- retained behavior and functional loss;
- dependencies and migration effects;
- confidence `high`, `medium`, or `low`, with the reason;
- evidence gaps and the observation that would resolve them.

Raw line count is a footprint measure, never a value score. A purpose conflict or missing decisive evidence caps confidence at `low` and forbids an unconditional `Remove` verdict.

## Ordering

Prefer, in order, a justified whole-feature removal, merging duplicated paths, simplifying a retained path, retaining unique value, then adding the smallest missing essential capability. This is a search order, not permission to discard evidence or essential behavior.
