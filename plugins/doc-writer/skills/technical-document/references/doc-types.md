# Technical document types

Pick the type that matches the request, then follow its structure. One document = one type; if a request spans two, write two linked documents.

## Architecture overview

For engineers who need the system's shape.

1. **Context** — what the system does, its boundaries, who/what it talks to.
2. **Components** — the major parts, each with one-line responsibility.
3. **Data / control flow** — how a key request moves through the parts (text or Mermaid sequence/flow).
4. **Key decisions** — link to ADRs; don't restate, summarize and point.
5. **Cross-cutting** — auth, persistence, error handling, observability, where relevant.
6. **Diagram** — a component or sequence diagram (Mermaid).

## API / reference documentation

For developers calling an interface (HTTP endpoint, library function, CLI).

Per endpoint/function/command:

- **Signature** — path+method / name+params / command+flags.
- **Description** — what it does, one paragraph.
- **Parameters** — table: name · type · required · description · constraints.
- **Returns / response** — shape + a real example.
- **Errors** — codes/exceptions and when they occur.
- **Example** — a real request and its response (or call + output).

## Integration / how-it-works guide

For a developer wiring this into their system.

1. **Prerequisites** — versions, credentials, access.
2. **Authentication / setup** — concrete, copy-pasteable.
3. **Step-by-step integration** — numbered, each step verifiable.
4. **Full working example** — end to end, runnable.
5. **Gotchas / limits** — rate limits, idempotency, edge cases.

## Runbook (operational)

For an operator acting under time pressure.

1. **When to use** — the trigger/alert.
2. **Preconditions & access** — what you need before starting.
3. **Procedure** — numbered, exact commands, expected output per step.
4. **Verification** — how to confirm success.
5. **Rollback** — how to undo safely.
6. **Escalation** — who/what if it fails.

## Design note / RFC

For proposing or recording a technical change.

1. **Problem** — what's wrong / needed, with evidence.
2. **Goals & non-goals** — explicit scope.
3. **Proposed design** — the approach, key interfaces, data shapes.
4. **Alternatives considered** — with why-not.
5. **Risks & impact** — migration, performance, security, rollout.
6. **Open questions**.
