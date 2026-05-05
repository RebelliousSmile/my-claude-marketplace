# Plan before implement

## Triggers

- New feature, behavior change, refactoring, restructuring
- Bug fix touching 2+ files
- Does NOT apply: typo fix, trivial rename, isolated value change in a single file

## Agentic mode (autonomous skills, sub-agents)

- Always write a plan in `aidd_docs/tasks/` before implementing
- Use `aidd:03:plan` to generate the plan
- Wait for explicit user approval before coding
- On plan rejection: ask for direction, do not implement alternative
- On session resume: ask before acting on pending plan

## Interactive mode (human-driven conversation)

- Small scoped changes: state intent, then proceed unless user objects
- Multi-file or cross-module changes: write a plan, wait for approval

## Shared

- Clarification is not approval to implement
- Direct feature request is a trigger — no command needed
