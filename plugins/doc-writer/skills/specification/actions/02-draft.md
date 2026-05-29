# 02 - draft

Write the specification from the elicited context.

## Inputs

- The context brief from `01-elicit`.

## Process

1. **Write all sections** in the order of `references/spec-structure.md`: context & objectives, stakeholders, scope (in/out), functional requirements, non-functional requirements, constraints, deliverables, acceptance criteria, planning, assumptions & open questions.
2. **Requirements**: number each (`FR-n`, `NFR-n`), keep one requirement per statement, write testable wording, assign a MoSCoW priority, and pair each with an acceptance criterion. Use the table format from the structure reference.
3. **Keep solution out of requirements**: imposed technical choices go in Constraints; functional requirements describe *what*, not *how*.
4. **Non-functional**: quantify (latency, uptime %, WCAG level, throughput) rather than adjectives.
5. **Acceptance criteria**: measurable, mapped to the requirements/deliverables they close.
6. **Assumptions & open questions**: carry every gap from `elicit`; never fill a missing figure with an invented one.

## Outputs

The drafted specification (Markdown by default) with uniquely identified, prioritized requirements and a populated assumptions/open-questions section.

## Test

Every requirement has an ID, a priority, and an acceptance criterion; scope in/out is explicit; non-functional requirements are quantified; no invented figures (gaps are in assumptions/open questions).
