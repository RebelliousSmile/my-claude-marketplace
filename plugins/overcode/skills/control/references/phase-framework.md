# Project phase framework

A test suite does not prove the same thing at every moment of a product's life. The same uncovered function is a foundation worth securing while the domain model still moves, and an acceptable gap once the model is frozen and nobody is using the product yet. This reference gives `control` the missing dimension: **when in the product's life** the arbitration is happening.

**The phase prioritises; it never classifies a tier.** Same boundary as the pivot's *Risk signals*. A test is refused on a tier criterion, never "because we are in production". Tier authority stays with the loaded tier table (the project's own documented strategy, else `decision-framework.md`).

## The four phases

One axis: growing exposure, then sedimentation. Each boundary is a question with a binary answer, so a phase can be declared without debate.

### `scaffolding` — does the domain model still move?

**Yes.** Entities are being renamed, split, merged; a schema change is a normal week.

- What the suite must prove: that the foundations hold their own contract — model invariants, validation rules, the transformations everything else is built on. Broad, shallow coverage of the shapes that everything downstream assumes.
- What it assumes it does not cover: client journeys, error paths of integrations that are not wired yet, anything whose shape is going to change before anyone depends on it. A test written here against a shape that moves next week costs more than the regression it would have caught.

### `hardening` — is the model frozen, with no real users yet?

**Yes.** The shapes have stopped moving; nobody outside the team depends on the system, and no data in it would be painful to lose.

- What the suite must prove: that the assembled whole behaves — the paths that cross several modules, the branches nobody exercised by hand, the error handling that was postponed while the model moved.
- What it assumes it does not cover: production-grade edge cases nobody has met yet. Guessing at them here produces tests calibrated on imagination rather than on incidents.

### `production` — are there real users, and data that cannot be reconstituted?

**Yes.** Someone outside the team depends on the system, and a wrong write cannot simply be replayed.

- What the suite must prove: the client-facing acts — sign-in, registration, payment, booking, form submission, anything irreversible or business-critical — and the boundaries with third parties the product now genuinely depends on.
- What it assumes it does not cover: internal refactoring detail. Here the suite protects the user's path, not the developer's comfort.

### `sustaining` — has significant new code stopped arriving?

**Yes.** Commits are mostly fixes and dependency bumps; the feature set is settled.

- What the suite must prove: that nothing regresses on what is already in use, and that the **external contracts** the product depends on still behave as assumed — because they keep moving after the product has stopped.
- What it assumes it does not cover: new-feature coverage that nothing produces any more. This is the phase where the suite's cost is most visible and its internal yield lowest.

### `undetermined`

Not a fallback dressed up as a value: a first-class answer. When neither a declaration nor a reliable signal settles the phase, `control` says so, states what it looked at, and asks. It never guesses a phase in order to have one.

## Resolution order

1. An explicit `phase` argument on the invocation (overrides everything, for this run only).
2. A phase declared in the project's own test strategy document (conventionally `aidd_docs/memory/testing.md`).
3. Inference from observable signals — **announced as an inference**, and posed as a question rather than settled.
4. `undetermined`.

A declared phase always wins over an inferred one. When both exist and diverge, the divergence is **reported**, never resolved: a heuristic does not overwrite a human decision. The phase is an attribute of the project, overridable on an explicitly requested `scope` — there is no automatic per-zone split, because no reliable source of truth exists for one.

## Inference signals

Each signal is read with its reliability stated in the output.

| Signal | Reading | Reliability |
|---|---|---|
| Churn on model/schema/entity files | High churn → `scaffolding`; flat → the model is frozen | Good |
| Presence of data migrations | Migrations exist and are ordered → the model was frozen at some point | Good |
| Version tags | No tag → likely pre-release; regular tags → released | Medium |
| Deployment configuration | Present and pointing at a real environment → released | Medium |
| Commit volume over 90 days | Very low → `sustaining`, **only alongside a long history**: dormancy after a short burst reads as abandoned, not mature | Medium |
| `fix:` dominating `feat:` | Dominant → `sustaining` | Good |

**The `hardening` → `production` boundary is not reliably inferable from a repository.** A frozen, deployed, tagged project with a full CI pipeline looks exactly the same whether it has ten thousand users or none — and that difference is the whole point of the boundary. Inference must stop here and ask. This is precisely why the phase is worth writing down once, in the project's own document.

`sustaining` is the phase a repository evidences most directly - commit volume and the fix/feat ratio are observations, not proxies - but neither distinguishes a mature product from an abandoned one. Read both against the repository's total age before concluding.

**Narrowing is a legitimate result.** When the signals exclude some phases without settling on one, report `undetermined` with the surviving candidates named - `undetermined (narrowed to hardening | production)` - rather than picking one to fill the field. The narrowing is the useful part: it turns an open question into a closed one the user answers in a word.

## Risk criteria weighting

The phase re-weights the risk criteria `04-strengthen` already ranks by. It adds no ranking mechanism of its own, and changes no tier.

| Criterion | `scaffolding` | `hardening` | `production` | `sustaining` |
|---|---|---|---|---|
| Consequence | normal | raised | **dominant** | raised |
| Branching | raised | **dominant** | normal | lowered |
| Churn | **dominant** | raised | normal | lowered |
| Blast radius | raised | raised | normal | normal |
| Absence of any other net | normal | raised | raised | normal |
| **External contract dependency** | lowered | normal | raised | **dominant** |

"Development" is deliberately absent from the phase list. What it describes — test the recent code, prove non-regression — is the **churn** criterion, which already exists. A phase modulates its weight; it does not need to become one.

## External contract dependency

The five pre-existing criteria are all **internal**: churn, branching, blast radius, consequence, absence of another net. None of them fires when the thing that breaks is the vendor. A Meta Pixel or Conversions API integration, a GTM container, Brevo, Klaviyo, a payment SDK, an outgoing webhook — any of these can break without a single line of the repository moving. That blind spot is why this criterion exists.

### What a test can and cannot prove here

Writing this down is what keeps the criterion from manufacturing false assurance.

- **Provable in process, at `contract` tier, without calling the vendor:**
  - the payload the code builds is the one it believes it is sending — fields, types, units, the identifier actually used;
  - the **degraded path** behaves correctly when the vendor returns an error, an unexpected schema, or nothing at all.
- **Not provable by the test suite:** that the vendor still accepts that payload. This requires a real, slow, quota-bound call, which has no place in a suite that gates every validation loop. `04-strengthen` **declares it out of reach of testing** and refers it to monitoring, instead of proposing a test that would give false assurance.

### Cost cap, per boundary

Without a cap, ten integrations produce twenty tests in a skill whose entire purpose is to bound the number. **One external boundary is worth one test by default — the degraded path.**

- The **degraded path** is proposed when a vendor failure can interrupt the journey: blocking script, unhandled rejection, a response whose schema is consumed without a guard. An outbound-only integration whose failure is invisible on the client side gets **no test at all** — it is declared *monitored outside the test suite*, exactly like vendor acceptance.
- The **built payload** earns a second test only when it carries data with a verifiable in-process consequence: an amount, an order identifier, an authorisation status, a consent. A measurement pixel carries none; a Conversions API transmitting a purchase value reconciled later does.
- This is a **ceiling per boundary, not a quota**: an integration may legitimately receive nothing.

### Detection lives in the pivot

`control` carries the criterion; it does not carry the inventory. Which SDKs, tags and outgoing clients exist in a given stack is stack knowledge, and belongs to the `testing` pivot's **Risk signals** field, whose role that already is (see `pivot-contract.md`). Without a pivot, `control` falls back to reading the project's own manifest for dependencies pointing at domains the project does not control, and says the inventory is generic.

## The three buckets

`control` reads a suite as three buckets, and compares their **order**, never their share.

- **Foundations** — model invariants, validation, shared transformations.
- **Recent code** — what the last commits added or changed.
- **Critical journeys** — client-facing acts, irreversible operations, external boundaries.

Expected priority order by phase:

| Phase | Expected order |
|---|---|
| `scaffolding` | foundations → recent code → critical journeys |
| `hardening` | foundations → critical journeys → recent code |
| `production` | critical journeys → recent code → foundations |
| `sustaining` | critical journeys → foundations → recent code |

**No percentage is ever produced.** The phase brings an expected ordering, not a ceiling and not a share; `05-stats` compares ranks. Classifying an existing test into a bucket is an approximation (tier + role of the source file it exercises + churn on that file), and the approximation is **declared** in the output alongside the comparison, so nobody reads it as a measurement.

## Net balance by phase

`02-audit` and `04-strengthen` answer to a net balance; the phase says which way it is normally expected to lean, and never imposes it.

- `scaffolding`, `hardening` — additions normally outweigh removals: the suite is being built.
- `production` — the balance shifts rather than grows: what the earlier phases justified gives way to what the client journeys demand.
- `sustaining` — a negative balance is expected, never required.

**`sustaining` carries the one exception to its own negative balance:** external boundaries remain the only legitimate motive for addition in this phase, and are excluded from any removal batch. It is the phase where nothing internal moves any more while external contracts keep moving — removing their only net at that exact moment would be the worst possible timing.
