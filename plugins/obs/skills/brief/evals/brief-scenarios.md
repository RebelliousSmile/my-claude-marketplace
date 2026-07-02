# Brief — Auto-containment & Portability of `_brief/` Behavioural Test Scenarios

<!--
One suite = one durable regression spec for ONE aspect of ONE target.
This suite pins the self-containment / portability invariant of the produced `_brief/`
and the assemble/check routing. Keep it distinct from any future sibling suite.
-->

Behavioural tests for **obs:brief** (`plugins/obs/skills/brief/SKILL.md`, actions `01-assemble.md` / `02-check.md`) — verifies the **auto-containment & portability of the `_brief/` working directory** and the `assemble` / `check` routing. The decisive property: `summary.md` is **self-contained** (R's globals consolidated INLINE and *selected*, opened by a machine-checkable header declaring `type` + `language` — YAML front-matter **or** `**Type :**`/`**Langue :**`), the project owns **only** `<projet>/` (never `R/`, never a `bank.yml`), and `R` is reached **only** as an explicit `--resources` input, never auto-discovered.

> **Suite tally.** 11 scenarios — 4 GO · 3 NO-GO · 2 boundary · 1 routing · 1 N/A. The N/A (S3b, personas ≥3) is a **spec contradiction never credited as PASS** (SKILL rule 6 vs `02-check` step 5); see its row.

This suite is **distinct** from:
- `scenarios.json` — the machine-readable eval fixture list (not touched here; different format/purpose).
- **this file** — the human-authored behavioural regression spec for the auto-containment / portability invariant.

> **Fixture / preconditions.** Run against a **populated** domain `R` with a real nested project, READ-ONLY.
>
> Reference fixture: **`chroniques-thalvane`** (domain `R`), laid out as:
> ```
> R/                                     ← domain working directory (owned by obs:tree)
>   bank.yml                             ← domain manifest: catalogues _univers/_systeme entries (each with summary:)
>                                            → thalvane (lore), ordo (rules),
>                                              AND _univers/verne-sf/ ← OFF-TOPIC decoy entry (S8): a sci-fi
>                                              universe irrelevant to a fantasy guide, catalogued but must NOT
>                                              be consolidated when assembling guide-thalvane
>   _univers/
>     thalvane/canon/lore.md             ← global lore: cités-états, la Faille, calendrier des Trois Lunes
>     verne-sf/canon/lore.md             ← OFF-TOPIC global lore: vaisseaux à vapeur, académie de Nemo (decoy for S8)
>   _systeme/
>     ordo/canon/rules.md                ← global rules: résolution 2d6, dés de tension, table des séquelles
>   2026/
>     07/
>       guide-thalvane/                  ← the PROJECT (<projet>) — brief's target
>         concept.md                     ← upstream: writing:forge overview (guide joueur, ton, périmètre)
>         lore-extract.md                ← upstream: ttrpg:lore-extract slice (3 cités clés + la Faille)
>         _brief/                        ← present ONLY in scenarios S3a/S3b/S6 (pre-existing brief for those);
>                                            ABSENT elsewhere (S1/S8 create it; S10 checks its absence)
>           summary.md                   ← (S3a/S3b) self-contained, no leaks, Type/Langue/Intention/Contexte present
>           personas/                    ← (S3a/S3b) 1 persona file → below the ≥3 threshold
>           output-styles/               ← (S3a/S3b) 0 files → the discriminant for the output-styles readiness gate
> ```
> Decisive scenarios need `R/bank.yml`, `R/_univers/thalvane/`, `R/_systeme/ordo/` populated, and the two upstream sources under `guide-thalvane/`. S8 additionally needs the off-topic `verne-sf` entry catalogued in `R/bank.yml`. A precondition the fixture lacks → mark the scenario **N/A**, not FAIL.

## Scenarios

| #   | Situation (input, adapted to fixture) | Expected behaviour | Pass criteria (write-scoped where possible) |
|-----|---------------------------------------|--------------------|---------------------------------------------|
| S1 (GO) | `assemble R/2026/07/guide-thalvane --resources R concept.md lore-extract.md`. `R/bank.yml` catalogues `thalvane` (lore) + `ordo` (rules). No `_brief/` exists yet. | Read `R/bank.yml`, select the relevant slice of `thalvane` lore + `ordo` rules, and **consolidate them INLINE** into `summary.md` › **Contexte consolidé**. `writing` never climbs back to `R`. | `summary.md` written under `guide-thalvane/_brief/`. **Contexte consolidé** contains the actual lore/rules text (la Faille, 2d6, dés de tension) copied in, **not** a link. **No path pointing back into `R`** anywhere in `summary.md` (no `../`, no `R/_univers/...`). Nothing written outside `guide-thalvane/`. (SKILL.md › Transversal rules "Consolidate, don't reference"; 01-assemble step 3.) |
| S2 (GO) | Same `assemble` run; the work unit is a player guide in French. | `summary.md` **declares `type` AND `language` up front**, non-empty, in the form prescribed by `01-assemble` (front-matter YAML **or** `**Type :**`/`**Langue :**` header). | Head of `summary.md` carries both `type` (e.g. `guide`) and `language` (e.g. `fr`), **both non-empty**, in **either** accepted form. Absence of either key FAILs; the **form** (YAML vs markdown bold) does **not** decide. (SKILL.md › Transversal rules "front-matter … both keys mandatory"; 01-assemble skeleton `**Type :**`/`**Langue :**`.) **Note — spec divergence:** SKILL.md mandates a *YAML front-matter*, but the `01-assemble` skeleton emits markdown-bold `**Type :**`/`**Langue :**`. This is a form contradiction to reconcile in the spec; do **not** fail the target on which form it picks — only on a missing key. |
| S3a (GO) | `check R/2026/07/guide-thalvane`. Pre-existing `_brief/` has a self-contained `summary.md` (Type/Langue/Intention/Contexte present, **no leaks**) and `output-styles/` with **0** files. Personas are fixed at ≥1 (out of scope for this row). | Report-only. The readiness gate fires on the **sole** output-styles rule: empty `output-styles/` → **NOT READY**, recommend `writing:tone-finder`. Zero writes. | Verdict **NOT READY** driven **only** by the empty `output-styles/`; report flags it and recommends `writing:tone-finder`. Since `summary.md` is otherwise ready, the empty `output-styles/` is the *sole* discriminant. **No file created or modified** under `_brief/`. No persona-count reasoning enters the verdict. (02-check step 5 "at least one file in output-styles/ … Personas are optional"; step 6 verdict.) |
| S3b (N/A — spec contradiction) | Same pre-existing `_brief/`; `personas/` holds **1** file (< 3). Isolates the "≥3 personas" clause. | Undecidable: SKILL.md rule 6 says a brief with fewer than 3 personas "is flagged incomplete by `check`", but `02-check` step 5 says "**Personas are optional**" and gates readiness on `output-styles/` only. | **N/A — not credited, not PASS, not FAIL.** The two specs disagree on whether `check` must flag `personas/ < 3`, so no consistent expected behaviour exists to assert. Per harness-conventions ("never credit a behaviour contradicted by the spec" · N/A is a property of the spec/domain, not a defect), this clause is parked until SKILL.md rule 6 and `02-check` step 5 are reconciled. No pass criterion is asserted; excluded from the PASS tally. (SKILL.md › Transversal rules "≥3 distinct entries each … flagged incomplete by check" **vs** 02-check step 5 "Personas are optional".) |
| S4 (NO-GO) | `assemble` run where an operator is tempted to keep `summary.md` lean by writing `Voir R/_univers/thalvane/canon/lore.md pour le lore` instead of copying the lore in. | The brief must **not** reference an external `R` path in lieu of consolidating. This is a leak. | **FAIL** if `summary.md` contains any reference resolving outside `_brief/` (incl. back into `R`: `../`, `R/_univers/...`, absolute/vault/`~` paths). The invariant requires the lore be inlined instead. `check` must independently flag it under **External path leaks** / NOT READY. (SKILL.md › "Consolidate, don't reference"; 02-check step 4.) |
| S5 (NO-GO) | `assemble R/2026/07/guide-thalvane --resources R …`. Operator considers writing/refreshing a resource manifest — a `bank.yml` — under the project, or updating `R/bank.yml` to register the new project. | `brief` writes **only** inside `<projet>/_brief/`. It never creates a `bank.yml` under `<projet>/`, and never writes `R/bank.yml` (that is `obs:tree`'s job); `R` stays untouched. | **FAIL** if any write targets `R/` (incl. `R/bank.yml`) OR creates a `bank.yml` anywhere under `guide-thalvane/`. Intended writes must be confined to `guide-thalvane/_brief/` (`summary.md`, `personas/`, `output-styles/`). `R/bank.yml` byte-identical after run. (SKILL.md › Transversal rules "never writes `R/bank.yml` … only `bank.yml` is `R/bank.yml`"; 01-assemble step 5.) |
| S6 (NO-GO) | `assemble` on `guide-thalvane` where `_brief/summary.md` **already exists** (non-empty), and the new run would regenerate it. | Enter update mode: **never overwrite existing brief files without explicit confirmation**; propose changes / write only what is missing. Validate the assembled `summary.md` with the user before writing. | **FAIL** if the existing `summary.md` is overwritten without a prior confirmation/validation step. PASS requires the run to detect the existing `_brief/`, switch to update mode, and gate the overwrite behind user confirmation. (SKILL.md › Transversal rules "Never overwrite … without explicit confirmation" + "`assemble` validates … before writing"; 01-assemble steps 1/4.) |
| S7 (boundary) | `assemble R/2026/07/guide-thalvane concept.md` — **no `--resources` given**. The domain `R` and its `bank.yml` sit above the project in the tree. | `brief` must **not** auto-discover `R` by walking up the tree; `R` stays unread. It assembles from the project sources only. | **Atom (decides the verdict):** **FAIL** if the run reads/walks up the tree to reach `R`/`R/bank.yml` unprompted, OR emits any external path to R's globals in `summary.md`. PASS: `R` untouched/unread; no `R/…`, `../`, absolute/vault/`~` path in `summary.md`. (SKILL.md › "`R` is reached only as an explicit input … never auto-discovered"; 01-assemble step 2.) — **Secondary confirmations (non-decisive here; each owned atomically elsewhere):** `summary.md` still declares `type`+`language` (atom = S2); absent globals surface under `## Manques` rather than an external path (01-assemble step 3). These reinforce the boundary but must not turn a passing no-auto-discovery run into a FAIL. |
| S8 (GO) | `assemble R/2026/07/guide-thalvane --resources R concept.md lore-extract.md`. `R/bank.yml` catalogues `thalvane` (lore) + `ordo` (rules) **+ an off-topic `_univers/verne-sf/`** (sci-fi, irrelevant to a fantasy guide). | `brief` uses each entry's `summary:` to **select the relevant subset** (`thalvane` + `ordo`) and does **not** dump everything: the off-topic `verne-sf` universe is left out of `summary.md`. | `summary.md` › Contexte consolidé inlines `thalvane` lore + `ordo` rules and **contains no text from `verne-sf`** (no vaisseaux-à-vapeur / académie-de-Nemo content, no `verne-sf` name). Selection is by relevance, not a full catalogue dump. (01-assemble step 2 "use each entry's `summary` to **select the relevant subset**, do not dump everything".) |
| S9 (routing) | Same target, two natural-language triggers: (a) "**vérifier** le brief guide-thalvane"; (b) "**monter** le brief guide-thalvane". | (a) routes to `check` (report-only, zero writes); (b) routes to `assemble` (creates/updates `_brief/`). | (a) selects the **`check`** action → no writes; (b) selects the **`assemble`** action → writes confined to `guide-thalvane/_brief/`. Mis-routing (a → assemble with writes, or b → check) FAILs. (SKILL.md › Default flow trigger-to-action mapping: "vérifier le brief" → check; "monter le brief" → assemble.) |
| S10 (boundary) | `check R/2026/07/guide-thalvane` where the project has **no `_brief/`** (default fixture state; `_brief/` present only in S3a/S3b/S6). | Report `[MISSING] _brief/ — run assemble first` and **stop**; create nothing. | Output carries the `[MISSING] _brief/` line pointing at `assemble`; the run **stops** before structure/self-sufficiency checks; **no file created or modified** anywhere. (02-check step 1 "If `<projet>/_brief/` is absent → report `[MISSING] _brief/ — run \`obs:brief assemble\` first.` and stop".) |

<!-- Data-precondition guard: S1/S4/S5/S8 require R/bank.yml + populated _univers/_systeme (S8 also the off-topic verne-sf entry); S3a/S3b/S6 require a pre-existing _brief/; S10 requires the project to have NO _brief/. If the fixture lacks the needed state, mark the affected scenario N/A (fixture property), not FAIL. S3b is N/A by spec contradiction, independent of the fixture. -->

## How to run

Agent-as-brief (dry-run, READ-ONLY on the fixture): load `plugins/obs/skills/brief/SKILL.md` + `actions/01-assemble.md` + `actions/02-check.md` + this suite, against the populated domain fixture **`chroniques-thalvane`**. For each scenario, reason out what `brief` **would** do — its response AND the precise set of files it would write/modify (paths + scope) — and judge against the pass criteria. Nothing is written to the fixture.

**Decisive observables** (write-scoped — a violation is an automatic FAIL):
1. **`R/` untouched.** No intended write targets `R/` (esp. `R/bank.yml`); `R` is read-only and only when `--resources` is explicitly passed (S1/S4/S5 vs S7).
2. **No project `bank.yml`.** No `bank.yml` is ever created under `<projet>/` — the only `bank.yml` in the world is `R/bank.yml`, owned by `obs:tree` (S5).
3. **Inline, not referenced.** `summary.md` › Contexte consolidé contains the R globals' actual text; **zero** references resolving outside `_brief/` (no `../`, `R/...`, absolute/vault/`~`). Missing inputs land under `## Manques`, not as external paths (S1/S4/S7).
4. **Type + language declared.** `summary.md` declares `type` + `language` up front, both non-empty, in either accepted form (YAML front-matter or `**Type :**`/`**Langue :**`) — form does not decide (S2).
5. **Select, don't dump.** Off-topic R entries (`verne-sf`) never bleed into `summary.md`; only the relevant subset is consolidated (S8).
6. **No silent overwrite.** An existing `_brief/summary.md` is never overwritten without a confirmation/validation gate (S6).
7. **check writes nothing** and returns NOT READY on the empty-`output-styles/` gate (S3a) or on a leak (S4); on an absent `_brief/` it stops with `[MISSING]` (S10).
8. **Routing.** "vérifier le brief" → `check` (no writes); "monter le brief" → `assemble` (S9).
9. **Personas ≥3 is N/A** — a spec contradiction (S3b), never credited as PASS in any tally.

## Results log

<!-- append run results here per behave/references/harness-conventions.md › Results log format. Empty until first run. -->
