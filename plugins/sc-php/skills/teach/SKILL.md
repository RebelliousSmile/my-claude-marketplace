---
name: teach
description: >-
  Teaches PHP language features, OOP patterns, and framework idioms by pulling
  examples directly from the current project codebase. Explains concepts with real
  code context, then offers practice exercises modelled on project patterns.
  Use when the user says "explain X", "how does X work", "teach me Y",
  "I don't understand Z", "show me an example of X in this project",
  "what is the difference between X and Y".
  Do NOT use for code review (aidd-dev:05-review), debugging (aidd-dev:08-debug),
  generating new features, or version migrations (legacy).
---

# sc-php Teach

Contextual teaching for PHP. Finds examples of the requested concept in the current project, explains the theory with those examples as anchors, then offers a short practice exercise to consolidate understanding.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `explain` | Explain a concept or pattern using project code examples | topic or code excerpt |
| 02 | `practice` | Generate a targeted exercise based on project patterns | topic or previous explain |

## Default flow

Non-sequential — dispatch based on user intent:

- "explain / how does / what is / difference between / show me" → `explain`
- "practice / exercise / quiz / test me / challenge me" → `practice`
- Ambiguous → `explain`, then offer `practice` at the end

## Transversal rules

- Always search the project codebase for a real example of the concept before explaining.
- If no project example exists, explain with a minimal invented snippet in the project's style (framework, namespace conventions).
- Keep theory brief — real code carries more weight than prose.
- After `explain`, always offer: "Want a practice exercise on this?"
- After `practice`, provide the solution and link back to the project example.
