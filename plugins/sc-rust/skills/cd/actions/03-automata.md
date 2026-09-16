# Automata target

Validate the Rust project facade and delegate a thin automation envelope.

## Input

- A current project contract, proven project facade, named `automata` target, selected provider, and available overcode deploy capability.

## Output

A validated handoff containing the exact Rust facade, directory, operations, source, proof, and recovery.

## Process

1. **Validate.** Resolve the exact target and reject command, directory, compilation target, immutable source, target invocation, lifecycle guard, lock, operation, proof or recovery drift before delegation.
2. **Require.** Stop without writing when overcode deploy is unavailable.
3. **Delegate.** Pass the exact named target and unchanged contract to `overcode:deploy automata` while keeping build and release semantics in the same project xtask.
4. **Trigger.** Use manual delivery by default and preserve push only when explicitly declared.

## Test

| Case | Pass |
| --- | --- |
| local facade and contract agree | automation uses the same versioned command and working directory |
| contract target or command is stale | no workflow or provider file is intended and the drift is named |
| overcode is absent | no fallback or plugin installation is intended |
| delegated facade exits non-zero | the envelope is required to preserve the failing status |
| migration or health fails | only the selected target stops or rolls back; the other target remains unlocked |
| mode changes from server | command and target arguments remain identical |
