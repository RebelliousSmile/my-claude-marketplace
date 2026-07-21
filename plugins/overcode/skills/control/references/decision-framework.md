# Default test-tier decision framework

Used only when the target project has no documented test strategy (no `aidd_docs/memory/testing.md`, or an equivalent project-level document naming its own tiers/criteria). A project-level strategy always takes precedence over this default - this file exists so `control` still produces a defensible decision on a project that has never written one down.

## Tiers

- **contract** - the behavior is a pure function, a data transformation, a validation rule, or a state-machine transition with no external I/O (network, filesystem, browser, database). Assert input -> output directly, no mocking of the system under test itself.
- **e2e** - the behavior can only be observed through a real user journey across multiple layers (UI interaction, navigation, a round trip through a live-ish backend or browser). No unit-level seam exists that would prove the behavior works without hollowing out the assertion into a mock of the very thing being tested.
- **skip** - the behavior is a direct pass-through of a framework/library guarantee (e.g. a getter re-exposing a prop with no branching, a config value assignment), or is already fully exercised by an existing contract/e2e test covering the same code path.

## Decision order

1. Does the behavior touch only in-process logic with no I/O boundary? -> `contract`.
2. Does proving the behavior require crossing a real boundary (browser, network, a multi-step user flow) that a contract-level test cannot fake without hollowing out the assertion? -> `e2e`.
3. Otherwise: is the behavior already exercised by an existing test on the same code path, or is it a framework guarantee with no branching of its own? -> `skip`.
4. If none of the above resolves cleanly, default to `contract` and flag the ambiguity to the user rather than silently picking `e2e` - e2e tests are the most expensive to write and run, so the number constraint favors under-provisioning e2e over-provisioning it.

## Number constraint

Every additional test is an ongoing maintenance cost, not only an insurance policy. Before proposing a new test, check whether the same code path is already exercised by an existing test with an assertion that could simply be strengthened instead of adding a new file.
