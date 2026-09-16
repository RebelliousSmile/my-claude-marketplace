# Server target

Reconcile supported provider prerequisites without running the project deployment command.

## Input

- A valid v2 project contract, exact named `server` target, supported provider, and nonsecret target facts.

## Output

Bounded provider metadata and the required out of band secret names, or a no write refusal.

## Process

1. **Select.** Require the exact target id; validate v2 ownership, mode, phase, lifecycle revision, guard, lock, invocation, facade parity, operations, source, proof and recovery for that target only.
2. **Load.** Read [supported providers](../references/providers.md) and stop this target on a missing primitive, missing fact or unsupported provider without degrading siblings.
3. **Reconcile.** Preserve or add only versionable provider identifiers, paths, host-key references, capability facts and declared secret names. Never store secret values or contact an API during configuration.
4. **Guard.** For Alwaysdata, require a readable nonsecret phase/revision guard under the target lock. Treat restart as an optional post-facade hook; warn that account-level Apache restart may affect multiple sites and require matching authorization.
5. **Verify.** Scan intended files for secret values and cross-target references; confirm that neither the project command nor any remote/API call runs during provider setup.

## Test

| Case | Pass |
| --- | --- |
| supported provider and facts are complete | only bounded nonsecret metadata and secret name references are intended |
| provider primitive or required fact is absent | no provider file or remote command is intended |
| contract is stale or invalid | no provider write is intended and producer correction is named |
| generated metadata is scanned | no secret value is present and the project command has not run |
| several targets exist and none is named | no provider file, secret name or remote path is selected |
| one target is unsupported | no supported sibling is rewritten or downgraded |
