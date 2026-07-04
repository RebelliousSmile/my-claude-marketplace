# 03 - challenge

Run an adversarial pass over a specification to make it contractable.

## Inputs

- A draft specification (from `02-draft` or supplied).
- The elicited context / original brief, when available — used for the fidelity check (rule 9).

## Process

Check each item; fix in place or report (per request):

1. **Atomicity** — no compound requirement; split any statement joining two needs with "and".
2. **Testability** — every requirement is verifiable; flag vague terms ("fast", "intuitive", "user-friendly", "etc.") and quantify or rewrite them.
3. **Acceptance coverage** — every Must/Should requirement maps to a measurable acceptance criterion; flag any without one.
4. **Scope clarity** — in-scope and out-of-scope are explicit and non-overlapping; ambiguous items resolved.
5. **Solution leakage** — no imposed *how* hidden in a functional requirement; move it to Constraints.
6. **Contradictions** — no two requirements conflict (e.g. a constraint that breaks a requirement); surface clashes.
7. **Completeness** — non-functional dimensions (security, performance, accessibility, legal, availability) addressed or explicitly marked N/A.
8. **No invented facts** — figures/dates trace to inputs; the rest sits in assumptions/open questions.
9. **Fidelity to source** — when the elicited context is available, cross-check scope, requirements and constraints against it; flag anything absent from the draft's own internal comparison alone, e.g. a scope item that reinstates something the source explicitly excluded, or a requirement that drifts from a source fact. The draft being internally consistent does not clear this check — compare against the source, not just against itself.

## Outputs

The hardened specification (or a findings list with severities if review-only), plus a short summary: requirements split/rewritten, criteria added, contradictions found, source-fidelity flags, and open questions still blocking sign-off.

## Test

After the pass, no requirement is compound, vague, untestable, or solution-bearing; every Must/Should has a measurable acceptance criterion; scope in/out is unambiguous; no contradiction remains unflagged; and — when the elicited context was available — nothing in the draft reinstates or drifts from an explicit source fact undetected.
