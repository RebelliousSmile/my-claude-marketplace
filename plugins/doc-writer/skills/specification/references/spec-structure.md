# Specification structure (cahier des charges)

The sections of a complete specification, plus the rules every requirement must satisfy.

## Sections

1. **Context & objectives** — the business problem, why now, the measurable goal the project serves.
2. **Stakeholders & roles** — client, users, provider, decision-makers; who validates what.
3. **Scope** — explicitly **in scope** and **out of scope**. The out-of-scope list is mandatory.
4. **Functional requirements** — what the system must do, as a numbered list (see rules below).
5. **Non-functional requirements** — performance, security, accessibility, availability, compliance/legal, localization, maintainability — each as a measurable requirement.
6. **Constraints** — imposed technical stack, integrations, legal/regulatory, budget, timeline. (Solution choices live here, not in functional requirements.)
7. **Deliverables** — what is handed over (software, docs, training, source, environments).
8. **Acceptance criteria** — measurable conditions, mapped to requirements/deliverables, that define "done".
9. **Planning / milestones** — phases and dates **if provided**; never invented.
10. **Assumptions & open questions** — everything not confirmed, so it can be closed before sign-off.

## Requirement rules

Each functional and non-functional requirement:

- **Unique ID** — `FR-1`, `FR-2`, `NFR-1`…
- **Atomic** — one requirement per statement; split compound "and" requirements.
- **Unambiguous** — testable wording; ban vague terms ("fast", "user-friendly", "etc.") unless quantified.
- **Verifiable** — there is a way to check it's met; it maps to an acceptance criterion.
- **Prioritized** — MoSCoW: Must / Should / Could / Won't (this release).
- **Solution-free** — states the *what*, not the *how* (the how, when imposed, goes in Constraints).

### Recommended format

| ID | Requirement | Priority | Acceptance criterion |
|---|---|---|---|
| FR-1 | The user can reset their password by email. | Must | A reset email arrives ≤ 1 min; the new password authenticates. |

## Quality bar

- No requirement is vague, compound, or untestable.
- Scope in/out is explicit; deliverables and acceptance criteria are complete.
- No invented figures; every gap is an explicit assumption or open question.
