# 03 - challenge

Run an adversarial pass over a specification to make it contractable.

## Inputs

- A draft specification (from `02-draft` or supplied).

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

## Outputs

The hardened specification (or a findings list with severities if review-only), plus a short summary: requirements split/rewritten, criteria added, contradictions found, and open questions still blocking sign-off.

## Test

After the pass, no requirement is compound, vague, untestable, or solution-bearing; every Must/Should has a measurable acceptance criterion; scope in/out is unambiguous; and no contradiction remains unflagged.
