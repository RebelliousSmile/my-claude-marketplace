# 01 - elicit

Gather the context needed to write a complete specification.

## Inputs

- `need` (required) — the brief, request, or problem statement (free text or a doc).

## Process

1. **Extract what's already known** from the need: objective, users, scope hints, constraints, deliverables, any budget/timeline.
2. **Check the blocking gaps** against `${CLAUDE_PLUGIN_ROOT}/skills/specification/references/spec-structure.md`:
   - Business objective and success measure.
   - Users/stakeholders and who validates.
   - Scope boundaries (what is explicitly *not* wanted).
   - Hard constraints: imposed stack/integrations, legal/regulatory, budget, deadline.
   - Expected deliverables.
3. **Ask the blocking questions in one numbered list**, then wait. Ask only what changes the spec and isn't already answered.
4. **Default the non-blocking** unknowns and record them as assumptions.
5. **Assemble a context brief**: objective, stakeholders, scope in/out, constraints, deliverables — the input to `draft`.

## Outputs

A context brief covering objective, stakeholders, scope (in/out), constraints and deliverables, plus a list of assumptions and still-open questions.

## Test

The brief states a measurable objective, an explicit out-of-scope list, and the hard constraints; unknowns are asked (once, batched) or recorded as assumptions — never invented.
