# Automata target

Generate a thin provider or CI envelope from the validated producer contract.

## Input

- A current v2 project contract, exact named `automata` target, supported automation platform, and provisioned secret names.

## Output

One thin GitHub, GitLab, Railway, or Heroku envelope that invokes the exact producer facade.

## Process

1. **Select.** Require the exact target id. Refuse an absent/unknown contract, non-automata mode, unresolved immutable ref, dirty workspace, non-reproducible manifest, or stale lifecycle guard before writing.
2. **Load.** Read [CI adapters](../references/ci-adapters.md) and select the supported platform without redetecting the application stack.
3. **Generate.** Create one job or matrix entry for the selected target. Embed its expected phase/revision, use a concurrency group derived only from target id, set the exact checkout ref and directory, and call its invocation textually.
4. **Guard.** Re-read the current remote phase/revision guard before mutation. An envelope created before promotion fails closed when its revision is stale.
5. **Trigger.** Generate manual delivery by default; preserve push only when this target explicitly declares it.
6. **Relay.** Preserve nonzero status and expose source, proof and recovery without secret values. Do not copy build, migration, inventory, synchronization or provider-file logic into the envelope.

## Test

| Case | Pass |
| --- | --- |
| valid manual contract generates GitHub or GitLab automation | command and directory match byte-for-byte and the trigger is manual |
| contract explicitly declares push | push rules are generated without changing command or directory |
| contract is absent or stale | no workflow or provider file is intended |
| facade exits non-zero | no ignored error or success reinterpretation exists |
| envelope is scanned | secret names may appear but secret values and duplicated deployment logic do not |
| two jobs select the same target | their shared target concurrency group prevents overlap |
| pre-promotion envelope runs after promotion | stale guard stops it before mutation |
