# Decision matrix

The generic default for what proof a behavior needs and how many of them a domain-level may accumulate at a given phase - **overridden by the project's own documented test strategy** wherever that strategy states one (see *Precedence* below). This file is the fallback a project gets for free, never the authority a project cannot override.

The tier a behavior resolves to - `contract`, `e2e` or `skip` - is not decided by a table of its own. It is the **output name** of the classifying authority: domains say what counts and at what level, the phase applies this matrix to that level, and the tier is what comes out (see `SKILL.md`, *Transversal rules*).

## The matrix: phase × domain-level

Each cell states **a required proof and a ceiling** - a count of proofs established in the cell's required form, never a count of files or test cases.

| | critical | structuring | ordinary | out-of-domain |
|---|---|---|---|---|
| `scaffolding` | anchored, 1 | — | — | — |
| `hardening` | anchored + internal, 2 | anchored, 1 | — | — |
| `production` | anchored nominal + degraded, 3 | anchored, 2 | internal, 6 | — |
| `sustaining` | anchored, 4 | anchored, 2 | internal, 6 | internal on regression, 1 |
| `default` | — | — | — | — |
| `undetermined` | — | — | — | — |

**A `—` cell means no proof is required at that phase for that level, and therefore no ceiling applies.** The two go together: a ceiling placed where nothing is required would refuse a proof the phase never asked for - deciding on nothing. An empty cell is not a hole in the matrix; it is an answer.

**`default` and `undetermined` take the most permissive regime the matrix has: no proof required, no ceiling, on any column.** The two are not the same thing and the output distinguishes them - `default` is a decision the project wrote, `undetermined` a question left unanswered - but the regime they receive is identical, because neither states a requirement to apply.

**That regime is announced, never silent.** A permissive arbitration nobody states is indistinguishable from an arbitration that never happened: a run under `default` or `undetermined` says so in as many words, and never lets an empty rendering stand in for the statement. Nothing here follows from an absent row - the row exists, and it says what it says.

**The ceiling's unit is a proof, not a file and not a test case.** Several cases that each assert a facet of the same behavior count as one proof.

**`internal on regression` is the matrix's one conditional requirement, and its negative branch is stated rather than left open.** The cell - `sustaining` × out-of-domain, the only one - requires an internal proof **of a behavior that has regressed**: a defect that reached the product and was fixed. A behavior outside every established domain that has *not* regressed falls on the negative branch, and there the cell requires **no proof and carries no ceiling** - it reads exactly like a `—`, and the run says which of the two branches it read. The condition is the **trigger** of the requirement, never a filter narrowing one that already applies: so a run finding no regression on that path reports `required_proof: none, ceiling: none` and classifies on the deciding order like anywhere else, and never produces a `skip` against the ceiling of 1. Reading the condition the other way would make one fixed defect anywhere in the out-of-domain column close that column to every further proof.

## Counting what is established

A ceiling is compared against **`established`** - the number of proofs the suite already carries **in the cell's required form**, at the domain-level the cell sits at. This is the one measurement the whole matrix turns on, and it is defined here rather than in each consumer: `01-write`'s `cell.established`, `04-strengthen`'s `established` (the term inside its `cell` column) and `05-stats`'s `trouvé` are the same number under three names, so two of them differing in one run is a defect and not two findings.

**How it is obtained**, in order:

1. **Take the tests attached to that domain-level** - those whose subject the domain's resolution terms match, over paths and declared identifiers (`SKILL.md`, *Transversal rules*). Enumerate them with the pivot's **Test file glob** (`references/pivot-contract.md`); without a pivot, with the project's own observed convention, stated as approximate.
2. **Read what each one crosses**, which is the only thing the required form is about: the product's real public boundary (**anchored**) or in-process only (**internal**). The pivot's **Anchor boundary** field refines where that line falls in this stack; absent one, the anchor-by-stack table above applies unrefined.
3. **Group cases asserting facets of one behavior into one proof**, per the unit rule above.
4. `established` is the count of the resulting groups, **per required term** of the cell.

**This is a reading of the tests, never a count of them.** A file count and a case count are both available cheaply and neither is this number; substituting one is how a ceiling starts refusing on an arithmetic nobody performed.

**When the tests cannot be read - no glob resolves, the files are unavailable - `established` is `unknown`, never `0`.** The two say opposite things: `0` states the cell is empty and licenses the addition, `unknown` states nothing was measured. **No ceiling applies to an `unknown`**: the cell is never `at ceiling` on it, the addition proceeds, and the run says the ceiling could not be evaluated and why. A refusal resting on a count that was never obtained is the one failure this rule exists to prevent.

**A conjunctive cell is counted per term, never as one total.** Two cells state a conjunction - `hardening` × `critical` (`anchored + internal`) and `production` × `critical` (`anchored nominal + degraded`) - and one scalar against them is unreadable: two internal proofs and no anchored one render `2/2` and refuse an addition on a cell whose anchored half has never been established. So:

- `established` carries **one count per required term**, and the output renders the terms (`established: 2 (anchored: 0, internal: 2)`);
- the cell is `at ceiling` only when the total has reached the ceiling **and every required term is satisfied**;
- a total at the ceiling with a term at zero is **not** at ceiling: it refuses a further proof of the terms already satisfied, and takes the missing one. Refusing that one would refuse the exact proof the cell exists to require.

**The term labels are fixed here, never invented per run.** `hardening` × `critical` renders `anchored` and `internal`. `production` × `critical` renders `nominal` and `degraded`, **both of them anchored** - that conjunction is between two anchored proofs, not between an anchored one and something else, so `established: 2 (nominal: 2, degraded: 0)` is the shape and `(anchored: 2, degraded: 0)` is not. A run choosing its own labels makes two readings of the same cell incomparable, which is the whole reason the terms are rendered rather than the total.

**`satisfied` means the term carries at least one proof - a floor of one, never a per-term ceiling.** The ceiling is on the **total** and nowhere else, and the matrix apportions it across the terms nowhere: `production` × `critical` states 3 over two terms, so `2 nominal + 1 degraded` and `1 nominal + 2 degraded` both reach it and both satisfy every term. Reading an apportionment into the number would refuse a proof no cell refuses.

## Anchored proof, internal proof

**Anchored proof crosses the product's real public boundary. Internal proof stays in process.** The requirement turns on independence from the source of the error: a test written by whoever wrote the code under test carries the same understanding into the test, and replays the misunderstanding instead of catching it. This never grounds "anchored beats internal" as a general rule - an anchored proof only proves the path it walks, which is exactly why a critical domain in `production` requires both the nominal and the degraded anchored proof, never an anchor alone.

| Stack | What anchors |
|---|---|
| web application | the real browser, a full journey |
| API / service | the real HTTP boundary |
| CLI | invoking the binary |
| library | the public API consumed from outside |

**Anchored does not mean "in a browser."** The requirement is independence from the source of the error, not a specific tool - which is what lets the matrix apply to a stack with no e2e runner at all, without demanding it acquire one.

This table carries the **generic criterion** only. The actual inventory for a given stack - what anchors there, in concrete terms - belongs to the pivot's **Anchor boundary** field (`references/pivot-contract.md`), which states where the boundary falls for that stack's own tools: an emulator that does not anchor, a rendering default only the real browser establishes, a service handler directly callable in-process. It refines the **position** of the boundary; it never refines the requirement itself - which proof is due stays the matrix cell's business, and the output name follows from that.

## Precedence

Tier and cell decisions are sourced in this order:

1. the target project's own documented test strategy (conventionally `aidd_docs/memory/testing.md`), if it states one;
2. this file, the skill's generic default, otherwise.

This is the same precedence mechanism already in force elsewhere in the skill (`05-stats`'s `authority` line: `project doc <path> | generic default`) - no new mechanism is introduced here. A project that writes its own requirements per level gets them applied; a project that writes nothing falls on the matrix above.

## Output names

`contract`, `e2e` and `skip` are the names attached to the proof a behavior resolves to. They are what the classifying authority produces, never what decides on its own behalf.

- **`contract`** - the behavior is provable with an **internal** proof: it does not need to cross the product's real public boundary. This covers pure functions, data transformations, validation rules, state-machine transitions, and any I/O that stays local or emulated (a database transaction, an emulated cloud dependency, a directly invoked service handler) - what matters is independence from the real boundary, not the total absence of I/O. Assert input to output directly; do not mock the behavior under test itself.
- **`e2e`** - the behavior is only provable with an **anchored** proof: it must cross the product's real public boundary (a real browser session and journey, a real call at the deployed HTTP boundary, a real CLI invocation, the library's public API consumed as an outside caller would). No internal seam substitutes for this without hollowing the assertion into a mock of the very thing being tested.
- **`skip`** - the behavior gets no proof of its own, on one of **three causes, and the output says which**: a direct pass-through of a framework or library guarantee (a getter re-exposing a prop with no branching, a plain assignment); a path already fully exercised by an existing `contract` or `e2e` proof; or **the cell being at its ceiling**, the count of proofs established in the required form having reached the number the cell states. The first two say the proof would be redundant, the third says it is refused - and a refusal reported in the vocabulary of redundancy is a refusal the user has no reason to contest, which is why the cause is named rather than the name alone. **An empty `—` cell is none of the three**: it requires no proof and therefore carries no ceiling to reach, so it produces no `skip` on that ground.

### Deciding among them

1. **Read the cell first.** If its established count has reached its ceiling, emit `skip` on that cause alone. A ceiling consulted only at delegation time is a ceiling the classification never saw.
2. Is the same path already exercised by an existing proof, or is it a framework guarantee with no branching of its own? -> `skip` on the corresponding redundancy cause.
3. When the cell names a required proof, map **that proof** to the output: any requirement containing `anchored` -> `e2e`; an `internal` requirement -> `contract`. On a conjunctive cell, the output is `e2e` because the anchored term must still be produced; the internal term remains visible in `required_proof` and `established`, never erased by the output name.
4. Only when the cell is `—` (no required proof, no ceiling), classify the behavior intrinsically: provable without crossing the real boundary -> `contract`; only provable across it -> `e2e`.
5. **Nothing resolves cleanly -> `contract`, the ambiguity flagged - never `e2e` chosen silently.** The most expensive tier is never the default one falls into by not deciding.

The cell therefore says **which proof is due**; this order maps that proof to a public output name and handles redundancy. Intrinsic provability cannot turn an anchored cell into `contract`: it is consulted only for an empty cell, where the phase requires no proof form of its own. The ceiling remains a **cause of `skip`**, not a measuring instrument and not a post-classification delegation check.
