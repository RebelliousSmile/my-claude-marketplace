# Automata target

Validate the Composer facade and delegate a thin automation envelope.

## Input

- A current project contract, project-native root facade, named `automata` target, selected provider, and available overcode deploy capability.

## Output

A validated handoff containing the exact facade and scoped operations.

## Process

1. **Validate.** Resolve the exact target and compare command, directory, immutable source, target invocation, lifecycle guard, lock, operations, proof, and recovery to the root facade and project.
2. **Require.** Stop without writing when overcode deploy is unavailable.
3. **Delegate.** Pass the exact named target and unchanged contract to `overcode:deploy automata` without duplicating PHP, WordPress, JavaScript or CSS logic.
4. **Trigger.** Use manual delivery by default and keep database, content, and media operations manual and confirmed.

## Test

| Case | Pass |
| --- | --- |
| contract and Composer agree | the handoff preserves command and directory byte-for-byte |
| risky WordPress operation is present | no automatic push trigger is introduced |
| overcode is absent | no workflow, provider file, fallback, or plugin installation is intended |
| delegated facade exits non-zero | the envelope is required to preserve the failing status |
| production contains mutable database, content or media push | delegation stops before provider execution |
| one target fails | no other target is selected as fallback |
