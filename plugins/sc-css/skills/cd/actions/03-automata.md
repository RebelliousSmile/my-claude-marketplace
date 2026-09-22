# Automata target

Validate the static facade and delegate a thin automation envelope.

## Input

- A current static project contract, named `automata` target, declared provider, and available overcode deploy capability.

## Output

A validated handoff containing the exact static facade and contract facts.

## Process

1. **Validate.** Resolve the exact target and compare facade, directory, deterministic output, immutable source, invocation, lifecycle guard, lock, cache, proof, operations and recovery to the contract.
2. **Require.** Stop without writing or installing anything when overcode deploy is unavailable.
3. **Delegate.** Pass the exact target and contract to `overcode:deploy automata` while leaving build and cache logic in the same project script.
4. **Trigger.** Use manual delivery by default and preserve push only when the contract explicitly declares it.

## Test

| Case | Pass |
| --- | --- |
| contract and native facade agree | the handoff preserves command, directory, output, proof, and recovery byte-for-byte |
| overcode is absent | no provider, workflow, fallback, or plugin installation is intended |
| trigger is absent | the handoff resolves it to manual |
| delegated facade exits non-zero | the envelope is required to preserve the failing status |
| server target becomes automata | facade, artifact identity and target arguments remain unchanged |
| another target has different cache rules | its metadata is neither read nor overwritten |
