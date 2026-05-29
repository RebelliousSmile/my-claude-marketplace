---
name: specification
model: sonnet
description: >-
  Writes a project or product specification — a "cahier des charges": the requirements document a client or
  product owner hands a provider. Captures objectives, scope (in and out), functional and non-functional
  requirements, deliverables, constraints, acceptance criteria and planning, then challenges each requirement
  for testability, atomicity and completeness. Use to formalize a need into a contractable spec. Do NOT use for
  end-user manuals (use user-guide), developer/architecture docs (use technical-document), or a repository README.
---

# specification

Turns a need into a structured, contractable specification (cahier des charges). Elicits the missing context, drafts the document with uniquely identified and prioritized requirements, then runs an adversarial pass so every requirement is unambiguous, atomic and verifiable.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `elicit` | Gather objectives, stakeholders, scope, constraints, budget/timeline | the need / brief |
| 02 | `draft` | Write the specification from the structure | elicited context |
| 03 | `challenge` | Adversarial pass — testability, atomicity, scope, contradictions | a draft spec |

## Default flow

Linear: `01 → 02 → 03`. `elicit` may pause for the user's answers; `challenge` can run standalone on an existing spec.

Trigger-to-action mapping:

- "write the specification / cahier des charges for <project>", "formalize this need into a spec", "requirements document" → full flow from `elicit`
- "what do we need to know for the spec" → `elicit`
- "challenge / review this specification", "are these requirements testable" → `challenge`

## Transversal rules

- Read `${CLAUDE_PLUGIN_ROOT}/references/doc-principles.md` and `references/spec-structure.md` first.
- **Rédaction en français par défaut** — le cahier des charges est rédigé en français (sauf demande explicite d'une autre langue) ; les termes techniques consacrés gardent leur forme d'origine.
- **Every requirement is atomic, uniquely identified, prioritized, and verifiable.** IDs like `FR-1`, `NFR-1`; priority via MoSCoW (Must/Should/Could/Won't).
- Scope is explicit on **both** sides: an "out of scope" list is mandatory.
- Acceptance criteria are measurable — a criterion you cannot test is not done.
- Never invent budget, deadlines, volumes, or constraints; ask, or list them as assumptions/open questions.
- Distinguish **requirement** (what) from **solution** (how); keep imposed technical choices in Constraints, not smuggled into functional requirements.
- `elicit` asks blocking questions in a single numbered list, then waits.

## References

- `references/spec-structure.md` — the sections of the specification and the rules for requirements
- `${CLAUDE_PLUGIN_ROOT}/references/doc-principles.md` — shared documentation ethos

## Evals

- `evals/scenarios.json`
