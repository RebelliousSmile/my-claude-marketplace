# Automata target

Validate the native Python facade and delegate a thin automation envelope.

## Input

- A current project contract, proven noninteractive facade, named `automata` target, selected provider, and available overcode deploy capability.

## Output

A validated handoff containing the exact Python command, directory, operations, and trigger.

## Process

1. **Validate.** Resolve the exact target id. Reject an interactive, missing, dirty or stale command and compare immutable source ref, lifecycle guard, lock, invocation, proof, recovery, and operations.
2. **Require.** Stop without writing or installing anything when overcode deploy is unavailable.
3. **Delegate.** Pass the exact target and contract to `overcode:deploy automata` without copying Python, process, or migration logic. Preserve the same native facade used by server mode.
4. **Trigger.** Use manual delivery by default and preserve push only when explicitly declared.

## Test

| Case | Pass |
| --- | --- |
| native facade and contract agree | command and working directory are preserved byte-for-byte |
| command is interactive or stale | no workflow or provider file is intended and the defect is named |
| overcode is absent | no fallback or plugin installation is intended |
| delegated facade exits non-zero | the envelope is required to preserve the failing status |
| another target is named | no envelope, lock, database or media operation touches this target |
| production carries data or media | delegation is refused before provider execution |
