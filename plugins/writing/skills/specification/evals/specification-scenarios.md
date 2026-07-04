# specification — Behavioural Test Scenarios

<!-- Scaffolded 2026-07-04, following the behave harness (overcode/behave). -->

Behavioural tests for **specification** (`plugins/writing/skills/specification/SKILL.md` + `actions/01-elicit.md`, `actions/02-draft.md`, `actions/03-challenge.md`, `references/spec-structure.md`, `references/spec-template.md`) — verifies that (1) `elicit` gathers blocking context without inventing figures, and (2) `challenge` catches every class of defect a real cahier-des-charges draft can carry (compound/vague/leaky/incomplete/invented) **and** stays faithful to the originally elicited context, without raising false positives on a compliant draft.

This suite is **distinct** from:
- `evals/scenarios.json` — pre-existing lightweight eval, not part of the behave harness.
- **this file** — the dry-run behavioural regression spec for `elicit` and `challenge`.

> **Fixture / preconditions.** Run against the populated, read-only fixture `specification-fixture/`:
> `elicited-context.md` (elicited context for "Portail Adhérents AssoConnect" — explicit scope in/out, explicit "budget/délai non communiqués — ne pas inventer") and `spec-draft.md` (a drafted cahier des charges with 6 deliberate defects). Never modify these files. State the relevant fixture state in every scenario row.

## Scenarios

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| S1  | A vague need adapted to the fixture domain: "On veut un portail pour que nos adhérents paient en ligne et qu'on ait moins de relances" — no budget, no deadline, no stakeholder detail given. | `elicit` extracts what it can, then asks the blocking gaps (budget, délai, validation, hard constraints) in **one numbered list**, then stops — does not state a budget/délai figure. | Response contains a single numbered list of blocking questions covering at least budget and délai; no invented numeric budget/délai appears as fact; process halts before drafting (no spec produced in the same turn). |
| S2  | `spec-draft.md` FR-1: "L'adhérent peut payer sa cotisation en ligne **et** recevoir son reçu fiscal par e-mail immédiatement après paiement." | `challenge` flags FR-1 as compound and proposes a split (pay / receive receipt). | Finding cites `03-challenge.md` §1 "Atomicity"; FR-1 is named; proposed fix separates the two "and"-joined needs into two requirements. |
| S3  | `spec-draft.md` FR-2: "Le portail doit être **rapide et intuitif** pour des utilisateurs non technophiles." | `challenge` flags "rapide"/"intuitif" as vague/unquantified terms. | Finding cites `03-challenge.md` §2 "Testability" (vague terms list includes "intuitive"); FR-2 is named; a quantified rewrite or explicit flag is proposed. |
| S4  | `spec-draft.md` FR-2, Must priority, acceptance-criterion cell is empty ("—"). | `challenge` flags the missing acceptance criterion on a Must requirement. | Finding cites `03-challenge.md` §3 "Acceptance coverage"; FR-2 is named as lacking a measurable criterion. |
| S5  | `spec-draft.md` FR-3: "Le paiement est traité **via Stripe Checkout hébergé sur les serveurs de Stripe**…" inside a functional requirement. | `challenge` flags the imposed technical solution smuggled into a functional requirement and proposes moving it to Constraints. | Finding cites `03-challenge.md` §5 "Solution leakage"; FR-3 is named; the fix relocates the Stripe-hosting detail to §6 Contraintes, leaving FR-3 stated as a *what*. |
| S6  | `spec-draft.md` §3 Périmètre "Inclus" lists "**gestion complète de l'historique des événements associatifs**" — a feature `elicited-context.md` §Périmètre-exclus explicitly puts **out of scope**. Internally, the draft's own Inclus/Exclus lists do not overlap (the item was silently dropped from Exclus, not duplicated). | `challenge` cross-checks the draft's scope against the original elicited context and flags the reversal of an explicit exclusion as a fidelity violation, not just an internal scope check. | Finding names the contradicted item and cites the elicited-context source; the item is flagged as reinstated without authorization (not silently kept as valid scope). |
| S7  | `spec-draft.md` §5 Exigences non fonctionnelles has no security/RGPD requirement, while `elicited-context.md` §Contraintes explicitly states "conformité RGPD (données des adhérents)". | `challenge` flags the missing NFR dimension (security/legal-RGPD) as a completeness gap. | Finding cites `03-challenge.md` §7 "Completeness" (security, legal/compliance dimensions); explicitly calls out the absent RGPD/security NFR rather than treating the NFR list as complete. |
| S8  | `spec-draft.md` §9 Planning: "Le projet doit être livré en **6 semaines**, avec un budget de **8 000 €**", while `elicited-context.md` states budget/délai are "non communiqués … à demander, ne pas inventer". | `challenge` flags both figures as invented, unsupported by any input. | Finding cites `03-challenge.md` §8 "No invented facts" and `spec-structure.md` §9 "jamais inventé[e]s"; both "6 semaines" and "8 000 €" are named; the fix routes them to §10 Hypothèses & questions ouvertes as open questions, not stated facts. |
| S9  | NO-GO — a mentally-simulated corrected draft: FR-1 split, FR-2 quantified + criterion filled, FR-3 leakage moved to Constraints, Inclus list realigned with the elicited exclusions, a security/RGPD NFR added, §9 Planning reads "à définir" with budget/délai moved to §10. | `challenge` raises **no finding** on these six now-compliant items — it must not re-flag content that already satisfies §1–§8 (and the fidelity check). | Verdict: 0 findings on the six previously-defective items; only genuinely still-open items (e.g. Sage/Ciel export format question) may remain listed under §10. No forbidden false positive on a compliant requirement, scope list, NFR, or planning line. |

## How to run

Agent-as-`specification` (dry-run, READ-ONLY on the fixture): load `SKILL.md` + `actions/01-elicit.md` + `actions/03-challenge.md` + `references/spec-structure.md` + `references/spec-template.md` + this suite, against the populated fixture `specification-fixture/` (`elicited-context.md`, `spec-draft.md`). For each scenario, reason out what the target **would** respond — its findings/questions and, where relevant, the precise relocation of content (e.g. FR-3's Stripe detail moving to §6) — and judge against the pass criteria. Nothing is written to the fixture.

**Decisive observables**: (1) S1 — a single numbered blocking-questions list, no invented budget/délai figure; (2) S2–S5, S7, S8 — each defect named with the exact `03-challenge.md`/`spec-structure.md` clause cited; (3) S6 — the scope reversal is caught **only if** the process instructs cross-referencing the elicited context, not merely the draft's internal consistency; (4) S9 — zero findings on the six fixed items (false-positive guard).

## Results log

### 2026-07-04 — run 1 (initial, dry-run, target=specification, fixture=specification-fixture) — **8/9 PASS**

Fixture: `elicited-context.md` (AssoConnect, explicit exclusions + "ne pas inventer" budget/délai) + `spec-draft.md` (6 planted defects), both read-only.

| # | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|
| S1 | PASS | — (first run) | `01-elicit.md` §Process 3 + SKILL.md transversal rule "elicit asks blocking questions in a single numbered list, then waits" — explicit and sufficient. |
| S2 | PASS | — | `03-challenge.md` §1 Atomicity — explicit, directly names the "and"-joined case. |
| S3 | PASS | — | `03-challenge.md` §2 Testability — "intuitive" is in the given vague-terms example list. |
| S4 | PASS | — | `03-challenge.md` §3 Acceptance coverage — explicit "every Must/Should… flag any without one". |
| S5 | PASS | — | `03-challenge.md` §5 Solution leakage — explicit, matches "imposed *how* hidden in a functional requirement". |
| S6 | **FAIL** | — | `03-challenge.md` Inputs list only "a draft specification" — no instruction to load or cross-check the elicited context. Rule §4 Scope clarity only checks the draft's own Inclus/Exclus for internal overlap (which is clean here); rule §8 only covers invented *figures/dates*, not reinstated scope items. No instruction requires comparing the draft against the source, so an agent following the letter of `03-challenge.md` would not catch this reversal — credited as a **gap**, not a lucky PASS (judgment-rules: "if the target passes only because an idealized agent would do the right thing… that is a gap to record"). |
| S7 | PASS | — | `03-challenge.md` §7 Completeness — explicit, lists "security… legal" as dimensions to address or mark N/A. |
| S8 | PASS | — | `03-challenge.md` §8 No invented facts + `spec-structure.md` §9 "jamais inventé[e]s" — explicit, directly matches invented "6 semaines"/"8 000 €". |
| S9 | PASS | — | Rules §1–§8 are each scoped to a named defect pattern; none is broad/vague enough to misfire on compliant content — no false-positive mechanism identified. |

**Frictions / gaps:** `03-challenge.md` has no step instructing the target to load/cross-check the original elicited context (or any other source-of-truth) when challenging a draft — it only inspects the draft in isolation. This misses exactly the class of defect where the draft silently reintroduces something the client explicitly excluded, or drifts from a source fact without inventing a new figure. Real gap — closing below.
**Tally:** 8/9 PASS (0 N/A) — S6 is a genuine behavioural miss, not a data limit (the elicited context exists and is readable; the process simply never asks for it).

### 2026-07-04 — run 2 (post-fix, dry-run, target=specification, fixture=specification-fixture) — **9/9 PASS**

Same fixture as run 1. Fix applied: `03-challenge.md` now takes the elicited context as an optional input and adds a "Fidelity to source" check (§9); `SKILL.md`'s action table and challenge trigger line note the optional context input.

| # | Verdict | Δ vs prior | Note (instruction cited) |
|---|---|---|---|
| S1 | PASS | = | Unchanged — `01-elicit.md` §Process 3. |
| S2 | PASS | = | Unchanged — `03-challenge.md` §1. |
| S3 | PASS | = | Unchanged — `03-challenge.md` §2. |
| S4 | PASS | = | Unchanged — `03-challenge.md` §3. |
| S5 | PASS | = | Unchanged — `03-challenge.md` §5. |
| S6 | **PASS** | ▲ | `03-challenge.md` §9 "Fidelity to source" (new) — explicitly instructs cross-checking scope/requirements/constraints against the elicited context when available, and flags reinstating an explicit exclusion. Fixture's `elicited-context.md` is the source consulted. |
| S7 | PASS | = | Unchanged — `03-challenge.md` §7. |
| S8 | PASS | = | Unchanged — `03-challenge.md` §8 + `spec-structure.md` §9. |
| S9 | PASS | = | New §9 rule is scoped to "when the elicited context is available" and to items that trace to it — a compliant, already-realigned draft gives it nothing to flag; no new false-positive surface introduced. |

**Frictions / gaps:** none remaining.
**Tally:** 9/9 PASS (0 N/A) — regression closed; S6 flips FAIL → PASS after the `03-challenge.md` edit, all other scenarios unaffected.
