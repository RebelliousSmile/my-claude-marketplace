# Local

Reconcile a proven local provider adapter or return an explicit not applicable result.

## Input

- Named provider and any existing official emulator or local CLI configuration.

## Output

A supported idempotent local adapter or an explicit not applicable boundary.

## Process

1. **Load.** Read [supported providers](../references/providers.md) and identify an existing proven local primitive.
2. **Reconcile.** Preserve or add only bounded local metadata and example variable names when that primitive is supported.
   - Return not applicable when no supported local primitive exists.
3. **Verify.** Probe the local primitive without credentials or production access, then repeat reconciliation.

## Test

| Case | Pass |
| --- | --- |
| provider has an existing supported emulator | only its bounded local configuration is intended |
| SSH, Railway, or Heroku has no supported local primitive | not applicable is returned and no fake service is intended |
| any local case is inspected | no secret value, production access, or project deployment command occurs |
| reconciliation runs twice unchanged | the second intended-write set is empty |
