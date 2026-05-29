# 02 - draft

Write the specification from the elicited context.

## Inputs

- The context brief from `01-elicit`.

## Process

0. **Start from the template** `${CLAUDE_PLUGIN_ROOT}/skills/specification/references/spec-template.md` — copy its skeleton (metadata header + the 10 sections) and fill it. The template fixes the base structure; `spec-structure.md` holds the rules.
1. **Fill every section** in the template's order, applying `${CLAUDE_PLUGIN_ROOT}/skills/specification/references/spec-structure.md`: context & objectives, stakeholders, scope (in/out), functional requirements, non-functional requirements, constraints, deliverables, acceptance criteria, planning, assumptions & open questions. Remove the template's HTML guidance comments and any unused placeholder rows.
2. **Requirements**: number each (`FR-n`, `NFR-n`), keep one requirement per statement, write testable wording, assign a MoSCoW priority, and pair each with an acceptance criterion. Use the table format from the structure reference.
3. **Keep solution out of requirements**: imposed technical choices go in Constraints; functional requirements describe *what*, not *how*.
4. **Non-functional**: quantify (latency, uptime %, WCAG level, throughput) rather than adjectives.
5. **Acceptance criteria**: measurable, mapped to the requirements/deliverables they close.
6. **Assumptions & open questions**: carry every gap from `elicit`; never fill a missing figure with an invented one.

## Outputs

The drafted specification (Markdown, from the template) with uniquely identified, prioritized requirements and a populated assumptions/open-questions section. No HTML guidance comments or empty placeholder rows remain.

## Test

Every requirement has an ID, a priority, and an acceptance criterion; scope in/out is explicit; non-functional requirements are quantified; no invented figures (gaps are in assumptions/open questions).
