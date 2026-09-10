# Analyze-resilience

Evaluates how a bounded target responds to plausible change or failure. It delegates target-specific evidence, then adds only Foresee's scenario synthesis: impact, detection, containment, recovery, and reversibility.

## Inputs

- `$ARGUMENTS` (required): `<document | completed-work | code | dependency> [--all] [--discuss | --plan]`
- The target and its lifecycle state must be explicit or resolvable from frontmatter, request, and repository evidence.

## Output

Return delegated report links and receipts, followed by:

```md
# Resilience — <target>

Coverage: <complete | partial | insufficient evidence>

| Scenario | Trigger | Boundary / blast radius | Consequence | Detection | Containment | Recovery | Reversibility | Evidence state | Confidence |
|---|---|---|---|---|---|---|---|---|---|

Omitted supported scenarios: <count>

## Unknowns
```

Do not persist a duplicate local report. The dependency branch keeps its existing horizon artifact.

## Process

1. **Resolve.** Read `@../references/resilience-signals.md` and `@../../../references/aidd-delegation.md`. Determine the bounded target kind and lifecycle state. Ask once if prospective document, completed work, code, or dependency cannot be distinguished.
2. **Delegate by target.** Follow the shared `foresee analyze-resilience` matrix:
   - prospective document → `aidd-refine:03-shadow-areas`;
   - completed work with its agreed reference → `aidd-refine:02-challenge`;
   - code → `aidd-dev:04-audit` pillar `architecture`, then the same skill pillar `tests`;
   - dependency or manifest → the existing `analyze-dep` action, including its audit baseline and horizon.
3. **Preserve.** Keep every delegated finding, confidence, severity, and horizon score unchanged. Return one receipt per invocation and disclose all required report paths under `writes`.
4. **Cover.** Mark every applicable authoritative input `available`, `partial`, or `missing`. A failed or unscannable code pillar leaves the other usable but makes overall coverage `partial`; neither pillar means `insufficient evidence`, never a positive resilience claim.
5. **Synthesize.** Build only scenarios supported by delegated findings, target content, or concrete repository evidence. Fill every scenario field from the reference and label it `confirmed`, `inference`, or `untested hypothesis`. Missing recovery or rollback evidence stays `unknown`.
6. **Bound.** Rank by plausible consequence and blast radius. Return at most three scenarios by default and name the omitted count. With `--all`, announce the supported count and expected cost before continuing; the flag is consent and needs no second confirmation.
7. **Stop or follow up.** Never invoke Assert, Test, Refactor, or implementation during analysis. Apply `--discuss` and `--plan` only after the completed report, following the shared contract. Executable validation requires a separate explicit request.

## Boundaries

- Explicit resilience intent selects this action before extension-only routing.
- Non-resilience architecture, code-quality, tests, document, and dependency requests keep their existing actions.
- Do not call one audit pillar complete resilience evidence.
- Do not rescore or copy delegated findings into a new quality score.
- Do not invent failure, detection, containment, recovery, rollback, or migration behavior.
- Source, tests, configuration, product data, and documentation stay unchanged; only disclosed analytical reports may be written.

## Test

- Prospective documents route to Shadow Areas, completed work to Challenge, code to both architecture and tests audits, and dependencies to the existing horizon action.
- Code with one missing pillar reports partial coverage; architecture alone never proves resilience.
- Default output has at most three scenarios and declares omissions.
- Missing recovery evidence is unknown or an untested hypothesis, never invented.
- No executable validation runs without a separate explicit request.
