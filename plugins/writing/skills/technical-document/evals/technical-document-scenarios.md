# technical-document — Scope Classification + Code-Grounded Verify Behavioural Test Scenarios

Behavioural tests for **technical-document** (`plugins/writing/skills/technical-document/SKILL.md` + `actions/01-scope.md` + `actions/03-verify.md` + `references/doc-types.md`) — verifies that the skill (1) classifies a subject into the right document type with concrete sources and a matching outline (`scope`), and (2) fact-checks a draft against the actual source file, catching signature drift, false behavioral claims, illustrative pseudo-code dressed as real, broken/misleading citations, and structural gaps against `doc-types.md` — without inventing defects in content that is actually correct (`verify`).

This suite is **distinct** from:
- `evals/scenarios.json` — a flat prompt→`expect_action` router-mapping table (does `technical-document` get invoked, and which action), no source-grounding, no defect-detection coverage.
- **this file** — the durable regression spec for `scope`'s classification/outline correctness and `verify`'s code-grounded defect detection, including the precision of its citations.

> **Fixture / preconditions.** Run against the populated fixture **`technical-document-fixture`** (READ-ONLY), at `…/scratchpad/fixtures/writing-doc-fixtures/technical-document-fixture/`:
> - `src/invoice-api.js` — the **ground truth**: `createInvoice(clientId, lines)` (2 params, no validation of negative `amountCents`), `sendInvoice(invoiceId)` (throws `InvoiceNotFoundError`/`InvoiceAlreadySentError`, defined lines 29-37), `markPaid(invoiceId, paidAt)` (no comparison against send date, lines 45-50), private `findInvoiceOrThrow`. `createInvoice`'s own body occupies lines 13-20; its `clientId` guard is line 14.
> - `scope-notes.md` — the expected `scope` outcome: type = "API / reference documentation", audience = internal developers, sources = `src/invoice-api.js`, structure = one subsection per public function (Signature/Description/Parameters/Retour/Erreurs/Exemple).
> - `doc-draft.md` — a draft with **six deliberate, independently-verifiable defects**: (1) a fabricated 3rd param `options?: { autoSend?: boolean }` on `createInvoice` that does not exist in source; (2) a false claim that `createInvoice` "rejette automatiquement les lignes dont le montant est négatif"; (3) a `// ... appliquer votre logique métier ici` placeholder inside `createInvoice`'s "real" example block; (4) a citation `src/invoice-api.js:14` attached to `sendInvoice`'s signature — line 14 is actually inside `createInvoice`; (5) no "Erreurs" section anywhere, despite `sendInvoice` throwing two named errors and `doc-types.md` requiring an Errors subsection per function for this type; (6) a false claim that `markPaid` "valide automatiquement que `paidAt` est postérieur à la date d'envoi… et rejette l'appel sinon".
>
> State which defect(s) are under test and the exact source lines grounding the verdict in every run. The judge reads the fixture but **writes nothing**; the decisive observable is each scenario's exact response content (the classification, the outline, and — for `verify` — the defect flagged plus the precise `file:line`/`file:symbol` citation of the *real* source used to ground the finding).

## Scenarios

**Coverage: 9 GO · 1 NO-GO — 10 scenarios.**

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| S1  | `scope` on subject `src/invoice-api.js` (fixture: 3 public functions, no HTTP layer, called by internal back-office code) | Classify as **API / reference documentation**; name the audience (internal developers integrating the module) and their goal; list `src/invoice-api.js` as the concrete source to read | Response states the type "API / reference documentation" (not architecture/integration/runbook/design note), names an audience with a stated goal, and lists `src/invoice-api.js` as a concrete file — not a vague "the invoicing system". (`01-scope.md` steps 1-2; `references/doc-types.md` "API / reference documentation" — matches `scope-notes.md`) |
| S2  | Same `scope` call, structure-confirmation step | Present the outline as one subsection per public function (`createInvoice`, `sendInvoice`, `markPaid`), each with Signature/Description/Parameters/Retour(Returns)/Erreurs(Errors)/Exemple | Outline lists exactly the 6 sub-sections from `doc-types.md`'s "API / reference documentation" template, once per function — no invented sections, none dropped (in particular **Erreurs is present** in the proposed outline). (`01-scope.md` step 5; `references/doc-types.md`) |
| V1  | `verify` on `doc-draft.md`'s `createInvoice` signature vs `src/invoice-api.js:13` | Flag the documented 3rd param `options?: { autoSend?: boolean }` as fabricated — the real signature takes only `clientId, lines` | Finding names the exact fabricated param (`options`/`autoSend`) and cites `src/invoice-api.js:13` (or the `createInvoice` symbol) as the real signature showing 2 params only. (`03-verify.md` step 2 "Signatures & params… match the current source") |
| V2  | `verify` on the claim "Rejette automatiquement les lignes dont le montant est négatif" vs `src/invoice-api.js:13-19` | Flag as false — `createInvoice`'s body only checks `clientId` truthiness and a non-empty `lines` array; no negative-amount check exists | Finding states the claim is unsupported by the code and cites `src/invoice-api.js:13-19` (or `createInvoice`) showing the only two guards that actually exist. (`03-verify.md` step 4 "Claims… match what the code actually does") |
| V3  | `verify` on the `createInvoice` example block containing `// ... appliquer votre logique métier ici` | Flag the example as illustrative/placeholder pseudo-code presented as a real, runnable snippet | Finding identifies the placeholder comment as non-runnable/illustrative and requires either removing it or replacing it with real, traceable code — not silently accepted as a valid "real" example. (`03-verify.md` step 1 "Examples… valid… Run or trace where feasible"; `SKILL.md › Transversal` "Examples must be real and runnable… never illustrative pseudo-code presented as working") |
| V4  | `verify` on the citation `src/invoice-api.js:14` attached to `sendInvoice`'s signature | Flag the citation as **misattributed**: line 14 exists in the file but is inside `createInvoice`'s guard clause, not `sendInvoice` (defined at line 29) | Finding states the citation does not correspond to `sendInvoice` and proposes the correct target (`src/invoice-api.js:29` or the `sendInvoice` symbol) — not accepted merely because line 14 exists in the file. (`03-verify.md` step 3, as fixed — see gap below) |
| V5  | `verify` — structural check of `doc-draft.md` against the API/reference template | Flag the **absence of any "Erreurs" section**, for all three functions, despite `sendInvoice` throwing `InvoiceNotFoundError`/`InvoiceAlreadySentError` in source | Finding names the missing Errors subsection(s) as a structural gap vs `doc-types.md`'s API/reference template, citing `src/invoice-api.js` lines documenting the thrown errors (e.g. lines 24-25, 31-33). (`03-verify.md` step 5 "Structure… match the type's template"; `references/doc-types.md` "Errors — codes/exceptions and when they occur") |
| V6  | `verify` on the claim that `markPaid` "valide automatiquement que `paidAt` est postérieur à la date d'envoi… et rejette l'appel sinon" vs `src/invoice-api.js:45-50` | Flag as false — `markPaid` sets `status`/`paidAt` unconditionally, with no comparison against any send date | Finding states the validation does not exist and cites `src/invoice-api.js:45-50` (or `markPaid`) showing the unconditional assignment. (`03-verify.md` step 4 "Claims… match what the code actually does") |
| B1  | `verify` invoked directly on `doc-draft.md` with no read-only flag stated | Defaults to **fixing the six defects in place** in the document, not merely listing them | Per `03-verify.md`'s own opening line ("Check, and fix in place (or report if read-only)"), the intended output is a corrected document with all six findings resolved — a plain findings list only applies if review-only was requested, which it was not here. (`03-verify.md` header + Outputs) |
| NG1 | `verify` on `sendInvoice`'s documented return shape `{ id, status: 'sent', sentAt }` vs `src/invoice-api.js:34-36` | Do **not** flag this as a defect — it matches the source exactly | **AUTO-FAIL if** the target reports a mismatch or "improvement" on this accurate statement. PASS requires it is passed over silently (or explicitly confirmed correct), proving the suite would catch over-flagging, not just under-flagging. (`03-verify.md` Test: "every example and signature matches current source" — a match is not a finding) |

## How to run

Agent-as-**technical-document** (dry-run, READ-ONLY on the fixture): load `plugins/writing/skills/technical-document/SKILL.md` + `actions/01-scope.md` (S1-S2) + `actions/03-verify.md` (V1-V6, B1, NG1) + `references/doc-types.md` + this suite, against the populated fixture **`technical-document-fixture`**. For each scenario, reason out what the target **would** produce — the exact classification/outline for `scope`, or the exact finding + citation for `verify` — and judge against the pass criteria, reading `src/invoice-api.js` directly to confirm each verdict rather than trusting the fixture's own defect summary. **Nothing is written to the fixture.**

**Decisive observables** (any violation is an automatic FAIL):
1. **Correct type + concrete sources** — `scope` names "API / reference documentation" and `src/invoice-api.js`, not a generic system description (S1).
2. **Complete, non-invented outline** — the per-function outline has all 6 required sub-sections including Errors, no extras (S2).
3. **All six defects caught, each with a real-source citation** — fabricated param (V1), false negative-amount claim (V2), placeholder-as-real example (V3), misattributed citation (V4), missing Errors section (V5), false `markPaid` validation claim (V6) — each finding must cite `src/invoice-api.js` at the line/symbol that actually grounds it, not just any existing line.
4. **Fix-in-place by default** — `verify` corrects the document rather than only reporting, absent a stated read-only mode (B1).
5. **No false positives** — accurate content (`sendInvoice`'s return shape) is never flagged (NG1).

## Results log

<!-- append run results here per plugins/overcode/skills/behave/references/harness-conventions.md › Results log format -->

### 2026-07-04 — run 1 (initial, dry-run, target=technical-document, fixture=technical-document-fixture) — **9/10 PASS (0 N/A, 1 FAIL)**

Fixture state: `technical-document-fixture` — `src/invoice-api.js` (3 public functions + 1 private, ground truth confirmed by direct read), `scope-notes.md` (expected scope outcome), `doc-draft.md` (6 deliberate defects). Judge read READ-ONLY; nothing written to the fixture.

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| S1  | classify as API/reference, name audience, list `src/invoice-api.js` | PASS | n/a (first run) | `01-scope.md` steps 1-2 |
| S2  | outline = 6 sub-sections per function, Errors included | PASS | n/a | `01-scope.md` step 5; `doc-types.md` |
| V1  | fabricated `options` param flagged, cites real 2-param signature | PASS | n/a | `03-verify.md` step 2 |
| V2  | false negative-amount claim flagged, cites lines 13-19 | PASS | n/a | `03-verify.md` step 4 |
| V3  | placeholder comment flagged as non-real example | PASS | n/a | `03-verify.md` step 1 + `SKILL.md › Transversal` (see friction) |
| V4  | misattributed citation (`:14` for `sendInvoice`) flagged as wrong target, not just "exists" | **FAIL** | n/a (first run) | `03-verify.md` step 3 as originally worded only required citations to "resolve to existing targets" — line 14 **does** exist in the file, so a literal read does not require checking that it corresponds to the cited symbol. No instruction anywhere required content-correspondence, only existence. |
| V5  | missing Errors section flagged vs `doc-types.md` template | PASS | n/a | `03-verify.md` step 5 |
| V6  | false `markPaid` validation claim flagged, cites lines 45-50 | PASS | n/a | `03-verify.md` step 4 |
| B1  | fix-in-place is the default (no read-only requested) | PASS | n/a | `03-verify.md` header + Outputs |
| NG1 | accurate `sendInvoice` return shape not flagged | PASS | n/a | `03-verify.md` Test |

**Frictions / gaps:**
- **V4 — real gap.** `03-verify.md` step 3 said citations must "resolve to existing targets," which a citation pointing at an existing-but-wrong line technically satisfies. Fixed below.
- **Output citation requirement — real gap.** `03-verify.md`'s Outputs said only "a summary of mismatches found," without requiring each finding to carry the real `file:line`/`file:symbol` it was checked against — the task's own bar ("chacun avec citation précise du vrai fichier source") was not actually mandated by the action file. Fixed below.
- **V3 — friction, not a gap.** `03-verify.md` step 1 ("Examples… valid… Run or trace where feasible") doesn't itself restate the pseudo-code prohibition; it is only explicit in `SKILL.md › Transversal`. Since Transversal rules apply to every action, this still credits PASS, but a verify pass loaded standalone (action file only, no full SKILL.md) could miss it. Not fixed — restating every Transversal rule in every action would be over-engineering; `SKILL.md` is always loaded per `harness-conventions.md`'s "How to run."

**Tally (initial):** 9/10 PASS (0 N/A, 1 FAIL). Root cause: `03-verify.md`'s citation-check and output-summary wording did not require content-correspondence, only existence.

**Fix applied:** `plugins/writing/skills/technical-document/actions/03-verify.md` — step 3 now requires citations to "resolve to existing targets **and actually correspond to what they're cited for** (a citation pointing at a real but unrelated line/symbol is a finding, not a pass)"; **Outputs** now requires "each mismatch/correction cites the exact `file:line`/`file:symbol` of the real source it was checked against."

### 2026-07-04 — run 2 (post-fix, dry-run, target=technical-document, fixture=technical-document-fixture) — **10/10 PASS (0 N/A)**

Same fixture and read as run 1. Re-judged V4 only (all other verdicts unchanged, see run 1).

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| V4  | misattributed citation (`:14` for `sendInvoice`) flagged as wrong target | PASS | ▲ (was FAIL) | `03-verify.md` step 3 (fixed): "resolve to existing targets and actually correspond to what they're cited for" — line 14 exists but does not correspond to `sendInvoice`, now an explicit finding, with the corrected finding itself required to cite `src/invoice-api.js:29` (Outputs fix) |

**Frictions / gaps:** none new. V3's friction (noted in run 1) stands, unaddressed by design (Transversal rules are always in scope per the harness's loading convention).

**Tally:** 10/10 PASS (0 N/A, 0 FAIL). Regression proven: V4 FAILed pre-fix and PASSes post-fix on the same fixture and citation — the `03-verify.md` wording change is the only variable.
