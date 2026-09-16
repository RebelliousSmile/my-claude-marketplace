# Automata target

Validate the native JavaScript facade and delegate a thin automation envelope.

## Input

- A current project contract, native package script, named `automata` target, chosen provider, and available overcode deploy capability.

## Output

A validated handoff containing the exact command, directory, operations, trigger, and secret names.

## Process

1. **Validate.** Resolve the exact target and reject stale command, directory, immutable source, target invocation, lifecycle guard, lock, proof, recovery, or operation data before delegation.
2. **Require.** Stop without writing or installing anything when overcode deploy is unavailable.
3. **Delegate.** Pass the exact named target and project contract to `overcode:deploy automata` without copying JavaScript delivery logic.
4. **Trigger.** Use manual delivery by default and preserve push only when explicitly declared.

## Test

| Case | Pass |
| --- | --- |
| native facade and contract agree | the handoff preserves command and working directory byte-for-byte |
| contract is stale | no workflow or provider file is intended and the drift is named |
| overcode is absent | no fallback or plugin installation is intended |
| delegated facade exits non-zero | the envelope is required to preserve the failing status |
| production operation mutates data or media | delegation is refused before provider execution |
| target mode changes | the native facade and operation semantics remain identical |
