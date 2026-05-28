---
name: teach
description: >-
  Teaches Rust language features, ownership and borrowing, async patterns, and
  idiomatic Rust by pulling examples directly from the current project codebase.
  Explains the borrow checker, lifetimes, traits, iterators, error handling with
  ?-operator, and async/await with real code context, then offers practice exercises
  modelled on project patterns.
  Use when the user says "explain X", "how does X work", "teach me Y",
  "I don't understand the borrow checker", "why does the compiler reject this",
  "show me an example of X in this project", "what is the difference between X and Y".
  Do NOT use for code review (aidd-dev:05-review), debugging (aidd-dev:08-debug),
  generating new features, or edition migration (legacy).
---

# sc-rust Teach

Contextual teaching for Rust. Finds examples of the requested concept in the current project, explains the theory with those examples as anchors, then offers a short practice exercise to consolidate understanding.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `explain` | Explain a concept or pattern using project code examples | topic or code excerpt |
| 02 | `practice` | Generate a targeted exercise based on project patterns | topic or previous explain |

## Default flow

Non-sequential — dispatch based on user intent:

- "explain / how does / what is / difference between / show me / why does the compiler" → `explain`
- "practice / exercise / quiz / test me / challenge me" → `practice`
- Ambiguous → `explain`, then offer `practice` at the end

## Transversal rules

- Always search the project codebase for a real example of the concept before explaining.
- If no project example exists, explain with a minimal invented snippet in the project's style (crate versions, error handling style).
- Keep theory brief — real code carries more weight than prose.
- For ownership/borrow checker explanations: always show the rejected code + compiler error, then the corrected version.
- After `explain`, always offer: "Want a practice exercise on this?"
- After `practice`, provide the solution and link back to the project example.
- For async concepts: always clarify which executor (Tokio vs async-std) is relevant to the project.
