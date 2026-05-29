---
name: technical-document
model: sonnet
description: >-
  Writes technical documentation for builders — architecture overviews, API/reference docs, integration and
  how-it-works guides, runbooks, and design notes/RFCs. Picks the right structure per document type and verifies
  examples, links and claims against the codebase. Use for developer- and operator-facing docs. Do NOT use for
  end-user manuals (use user-guide); for a project's requirements (use specification); or for a repository
  README (use aidd-overlay:readme).
---

# technical-document

Produces developer- and operator-facing documentation. Selects the appropriate template for the document type, writes precisely, and verifies every example and reference against the actual code so the doc stays true.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `scope` | Determine document type, audience and sources | subject (`$ARGUMENTS`) + codebase |
| 02 | `write` | Write the document from the type's template | scoped type + sources |
| 03 | `verify` | Check examples compile/match, links resolve, claims match the code | a draft document |

## Default flow

Linear: `01 → 02 → 03`. Stop after `01` to confirm type/scope; run `03` standalone on an existing doc.

Trigger-to-action mapping:

- "document the architecture", "write API reference for <module>", "integration guide", "write a runbook for <op>", "design note / RFC for <change>" → full flow from `scope`
- "what kind of doc / what should it cover" → `scope`
- "verify / fact-check this technical doc", "do the examples still work" → `verify`

## Transversal rules

- Read `${CLAUDE_PLUGIN_ROOT}/references/doc-principles.md` first.
- The **subject** (what to document: a system, module, API, or operation) is given up front via `$ARGUMENTS`; if it's missing, ask for it once before starting.
- **Rédaction en français par défaut** — la prose est en français (sauf demande explicite d'une autre langue) ; le code, les signatures, les commandes et les libellés gardent leur forme d'origine.
- Match the document type's structure from `references/doc-types.md` — don't invent a shape.
- **Ground every technical claim in the code**: read the relevant source before asserting behavior; cite `file:symbol`/`file:line` where useful.
- Examples must be real and runnable — copy from or validate against the codebase, never illustrative pseudo-code presented as working.
- Link to ADRs / existing docs instead of restating decisions (right altitude).
- Diagrams: prefer text/Mermaid the reader can edit; describe what isn't drawable.
- Mark anything unverified as an explicit assumption.

## References

- `references/doc-types.md` — per-type required structure (architecture, API, integration, runbook, design note)
- `${CLAUDE_PLUGIN_ROOT}/references/doc-principles.md` — shared documentation ethos

## Evals

- `evals/scenarios.json`
