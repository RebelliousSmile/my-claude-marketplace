# Run full Harvest maintenance

## Inputs

- Optional supported `key=value` configuration overrides.
- A new execution context from `references/pillar-contract.md`.

## Process

1. Validate overrides and compute effective configuration.
2. Run `inventory` once with full scope.
3. Run `tracker`, then `normative`, then `cleanup`; never reorder them.
4. Run `freshness`, then `review` over the remaining state.
5. Run `report` with all collected metrics.
6. Reuse every completed action result and surface skipped or blocked work with its reason.

## Outputs

- Full Harvest report and its path.
- All confirmations, receipts, metrics, and limits from the actions that own them.

## Test

- Every action runs at most once and inventory state is reused.
- Tracker, normative, and cleanup order is invariant.
- The complete historical report and every destructive confirmation remain present.

