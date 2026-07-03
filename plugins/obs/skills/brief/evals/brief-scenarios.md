# Brief — Auto-containment & Portability of `_brief/` (generic core + JDR profile) Behavioural Test Scenarios

<!--
One suite = one durable regression spec for ONE aspect of ONE target.
This suite pins the self-containment / portability invariant of the produced `_brief/`
and the assemble/check routing — for the AGNOSTICISED skill: durable resources are
"whatever R/bank.yml catalogues" (free bucket names), the JDR bucket names being one
profile among others. Keep it distinct from any future sibling suite.
-->

Behavioural tests for **obs:brief** (`plugins/obs/skills/brief/SKILL.md`, actions `01-assemble.md` / `02-check.md`) — verifies the **auto-containment & portability of the `_brief/` working directory** and the `assemble` / `check` routing, on the **domain-agnostic** contract. The decisive property: `assemble` consolidates **INLINE whatever `R/bank.yml` catalogues** (regardless of the bucket names it points into), producing a `summary.md` that is **self-contained** (globals *selected* and copied in, opened by a machine-checkable header declaring `type` + `language`), the project owns **only** `<projet>/` (never `R/`, never a `bank.yml`), and `R` is reached **only** as an explicit `--resources` input, never auto-discovered.

**Generic core, then profile.** The primary contract is **domain-agnostic** (generic model `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md`): buckets have **free names** catalogued by `R/bank.yml`, feeders are the generic `writing:forge` (concept) + `obs:research` (data). The **JDR profile** (documented in `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` § JDR profile) is one instance where the same catalogue happens to point into `_univers`/`_systeme` and the feeders are `ttrpg:lore-extract` / `ttrpg:rules-keeper`. **The assembly behaviour is identical across both — only the bucket names and feeder names change** (S13 pins exactly this).

> **Downstream contract unchanged.** The `_brief/ → _output/` contract consumed by the `writing` plugin (`writing:references/brief-model.md`) is **not modified** by the agnosticisation: `writing` still reads only a self-contained `summary.md` (Type/Langue/Intention/Contexte) + `personas/` + `output-styles/`, and still never climbs back into `R`. Every GO scenario's structure/keys must remain what `brief-model.md` expects.

This suite is **distinct** from:
- any machine-readable eval fixture list (different format/purpose — not touched here).
- **this file** — the human-authored behavioural regression spec for the auto-containment / portability / bucket-agnostic invariant.

> **Fixture / preconditions — TWO populated fixtures, both READ-ONLY.**
>
> **Fixture A — `atelier-lenteur` (GENERIC, non-JDR — primary).** A writing domain `R` whose `R/bank.yml` catalogues buckets with **free names** (`_notes`, `_sources-perso`) and carries **no `profile:` key** → the generic core applies (no `canon/`+`mj/` split, no `campagne` scope). Feeders upstream are the generic `writing:forge` + `obs:research`.
> ```
> Perso/Écrits/atelier-lenteur/            ← R = domain working directory (owned by obs:tree); NO profile:
>   bank.yml                               ← generic manifest, catalogues (each with summary:):
>                                              notes-lenteur → _notes/lenteur.md            (kind: reference)
>                                              citations     → _sources-perso/citations.md  (kind: reference)
>                                              fiscalite     → _sources-perso/fiscalite.md  ← OFF-TOPIC decoy (S3):
>                                                perso tax notes, irrelevant to an essay on slowness — catalogued
>                                                but must NOT be consolidated when assembling essai-lenteur
>   _notes/
>     lenteur.md                           ← global notes: éloge de la lenteur (Sansot, Illich, la marche)
>   _sources-perso/
>     citations.md                         ← global excerpts: citations perso sur le temps et la lenteur
>     fiscalite.md                         ← OFF-TOPIC global (decoy for S3)
>   2026/07/
>     essai-lenteur/                       ← the PROJECT (<projet>) — brief's target
>       concept.md                         ← upstream: writing:forge overview (essai, ton, périmètre)
>       research.md                        ← upstream: obs:research report (données/citations vérifiées)
>       _brief/                            ← present ONLY in S6/S8 (pre-existing brief); ABSENT elsewhere
>         summary.md                       ← (S8) self-contained, no leaks, Type/Langue/Intention/Contexte present
>         personas/                        ← (S8) 1 persona file → below the ≥3 threshold
>         output-styles/                   ← (S8) 0 files → the discriminant for the output-styles readiness gate
> ```
>
> **Fixture B — `chroniques-thalvane` (JDR PROFILE).** Same generic contract, JDR bucket names. `R/bank.yml` declares `profile: jdr` and catalogues buckets `_univers`/`_systeme`. Feeders `ttrpg:lore-extract` / `ttrpg:rules-keeper`.
> ```
> Perso/RPG/chroniques-thalvane/           ← R = JDR domain; bank.yml carries profile: jdr
>   bank.yml                               ← manifest, catalogues (each with summary:):
>                                              thalvane → _univers/thalvane/canon/lore.md   (kind: lore)
>                                              ordo     → _systeme/ordo/canon/rules.md      (kind: rules)
>                                              verne-sf → _univers/verne-sf/canon/lore.md    ← OFF-TOPIC decoy (S12):
>                                                sci-fi universe, irrelevant to a fantasy guide
>   _univers/
>     thalvane/canon/lore.md               ← global lore: cités-états, la Faille, calendrier des Trois Lunes
>     verne-sf/canon/lore.md               ← OFF-TOPIC global lore: vaisseaux à vapeur, académie de Nemo (S12)
>   _systeme/
>     ordo/canon/rules.md                  ← global rules: résolution 2d6, dés de tension, table des séquelles
>   2026/07/
>     guide-thalvane/                      ← the PROJECT (<projet>) — brief's target
>       concept.md                         ← upstream: writing:forge overview (guide joueur, ton, périmètre)
>       lore-extract.md                    ← upstream: ttrpg:lore-extract slice (3 cités clés + la Faille)
> ```
>
> Decisive generic scenarios (S1/S3/S4/S5) need `atelier-lenteur/bank.yml` + populated `_notes/`/`_sources-perso/` (S3 also the off-topic `fiscalite`). Profile scenarios (S11/S12) need `chroniques-thalvane/bank.yml` (with `profile: jdr`) + populated `_univers/`/`_systeme/` (S12 also the off-topic `verne-sf`). S13 needs **both** fixtures. S6/S8 need a pre-existing `_brief/`; S9 needs the project to have **none**. A precondition a fixture lacks → mark the scenario **N/A**, not FAIL.

## Scenarios

<!-- Situation → Expected → Pass criteria. Pass criteria are write-scoped where possible and cite the instruction (file + section). Each row isolates ONE atomic behaviour. -->

| #   | Fixture · type | Situation (input, adapted to fixture) | Expected behaviour | Pass criteria (write-scoped where possible; instruction cited) |
|-----|----------------|---------------------------------------|--------------------|----------------------------------------------------------------|
| S1 | A · GO | `assemble R/2026/07/essai-lenteur --resources R concept.md research.md`. `R/bank.yml` catalogues `notes-lenteur` (→ `_notes/lenteur.md`) + `citations` (→ `_sources-perso/citations.md`), **no `profile:` key**. Feeders: `writing:forge` concept + `obs:research` report. No `_brief/` yet. | Read `R/bank.yml`, select the relevant catalogued resources **whatever the bucket names**, and **consolidate them INLINE** into `summary.md` › **Contexte consolidé**. `writing` never climbs back to `R`. | `summary.md` written under `essai-lenteur/_brief/`. **Contexte consolidé** contains the **actual text** of `_notes/lenteur.md` + `_sources-perso/citations.md` copied in, **not** a link. **No path pointing back into `R`** (no `../`, no `R/_notes/…`, no absolute/vault/`~`). Nothing written outside `essai-lenteur/`. (SKILL.md › Transversal rules "Consolidate, don't reference" + "consolidates **what `R/bank.yml` catalogues**, whatever the buckets are named"; 01-assemble step 3.) |
| S2 | A · GO | Same `assemble` run; the work unit is a French-language essay. | `summary.md` **declares `type` AND `language` up front**, non-empty, in the form prescribed by the spec (front-matter YAML **or** `**Type :**`/`**Langue :**` header). | Head of `summary.md` carries both `type` (e.g. `essay`/`technical-doc`) and `language` (e.g. `fr`), **both non-empty**, in **either** accepted form. Missing either key FAILs; the **form** does **not** decide. (SKILL.md › Transversal rules "front-matter … both keys mandatory"; 01-assemble skeleton `**Type :**`/`**Langue :**`.) **Note — spec divergence:** SKILL.md mandates a *YAML front-matter*, but the `01-assemble` skeleton emits markdown-bold — a form contradiction to reconcile in the spec; do **not** fail the target on which form it picks, only on a missing key. |
| S3 | A · GO | `assemble R/2026/07/essai-lenteur --resources R concept.md research.md`. `R/bank.yml` also catalogues the **off-topic** `fiscalite` (→ `_sources-perso/fiscalite.md`, perso tax notes). | `brief` uses each entry's `summary:` to **select the relevant subset** (`notes-lenteur` + `citations`) and does **not** dump everything: the off-topic `fiscalite` is left out. | `summary.md` › Contexte consolidé inlines the two on-topic globals and **contains no text from `fiscalite.md`** (no tax content, no `fiscalite` name). Selection by relevance, not a catalogue dump. (01-assemble step 2 "use each entry's `summary` to **select the relevant subset** … do not dump everything".) |
| S4 | A · NO-GO | `assemble` run where an operator is tempted to keep `summary.md` lean by writing `Voir R/_notes/lenteur.md pour les notes` instead of copying the notes in. | The brief must **not** reference an external `R` path in lieu of consolidating — that is a leak. | **FAIL** if `summary.md` contains any reference resolving outside `_brief/` (incl. back into `R`: `../`, `R/_notes/…`, absolute/vault/`~`). The invariant requires the notes be **inlined**. `check` must independently flag it under **External path leaks** → NOT READY. (SKILL.md › "Consolidate, don't reference"; 02-check step 4.) |
| S5 | A · NO-GO | `assemble R/2026/07/essai-lenteur --resources R …`. Operator considers writing/refreshing a resource manifest — a `bank.yml` — under the project, or updating `R/bank.yml` to register the new project. | `brief` writes **only** inside `<projet>/_brief/`. It never creates a `bank.yml` under `<projet>/`, and never writes `R/bank.yml` (that is `obs:tree`'s job); `R` stays untouched. | **FAIL** if any write targets `R/` (incl. `R/bank.yml`) **or** creates a `bank.yml` anywhere under `essai-lenteur/`. Intended writes confined to `essai-lenteur/_brief/` (`summary.md`, `personas/`, `output-styles/`). `R/bank.yml` byte-identical after run. (SKILL.md › Transversal rules "never writes `R/bank.yml` … the only `bank.yml` that exists is `R/bank.yml`"; 01-assemble step 5.) |
| S6 | A · NO-GO | `assemble` on `essai-lenteur` where `_brief/summary.md` **already exists** (non-empty); the new run would regenerate it. | Enter update mode: **never overwrite existing brief files without explicit confirmation**; propose changes / write only what is missing. Validate the assembled `summary.md` with the user before writing. | **FAIL** if the existing `summary.md` is overwritten without a prior confirmation/validation step. PASS requires: detect the existing `_brief/`, switch to update mode, gate the overwrite behind user confirmation. (SKILL.md › Transversal rules "Never overwrite … without explicit confirmation" + "`assemble` validates … before writing"; 01-assemble steps 1/4.) |
| S7 | A · boundary | `assemble R/2026/07/essai-lenteur concept.md` — **no `--resources` given**. The domain `R` and its `bank.yml` sit above the project in the tree. | `brief` must **not** auto-discover `R` by walking up the tree; `R` stays unread. It assembles from the project sources only. | **Atom (decides the verdict):** **FAIL** if the run reads/walks up the tree to reach `R`/`R/bank.yml` unprompted, **or** emits any external path to R's globals in `summary.md`. PASS: `R` untouched/unread; no `R/…`, `../`, absolute/vault/`~` in `summary.md`. (SKILL.md › "`R` is reached only as an **explicit input** … never auto-discovered"; 01-assemble step 2.) **Secondary (non-decisive; each owned atomically elsewhere):** `summary.md` still declares `type`+`language` (atom = S2); absent globals surface under `## Manques`, not an external path (01-assemble step 3). |
| S8 | A · GO (check) | `check R/2026/07/essai-lenteur`. Pre-existing `_brief/` has a self-contained `summary.md` (Type/Langue/Intention/Contexte present, **no leaks**) and `output-styles/` with **0** files. Personas fixed at ≥1 (out of scope for this row). | Report-only. The readiness gate fires on the **sole** output-styles rule: empty `output-styles/` → **NOT READY**, recommend `writing:tone-finder`. Zero writes. | Verdict **NOT READY** driven **only** by the empty `output-styles/`; report flags it and recommends `writing:tone-finder`. **No file created or modified** under `_brief/`. No persona-count reasoning enters the verdict. (02-check step 5 "at least one file in `output-styles/` … Personas are optional"; step 6 verdict.) |
| S9 | A · boundary | `check R/2026/07/essai-lenteur` where the project has **no `_brief/`** (default fixture state). | Report `[MISSING] _brief/ — run assemble first` and **stop**; create nothing. | Output carries the `[MISSING] _brief/` line pointing at `assemble`; run **stops** before structure/self-sufficiency checks; **no file created or modified** anywhere. (02-check step 1 "If `<projet>/_brief/` is absent → report `[MISSING] _brief/ …` and stop".) |
| S10 | A · routing | Same target, two natural-language triggers: (a) "**vérifier** le brief essai-lenteur"; (b) "**monter** le brief essai-lenteur". | (a) routes to `check` (report-only, zero writes); (b) routes to `assemble` (creates/updates `_brief/`). | (a) selects **`check`** → no writes; (b) selects **`assemble`** → writes confined to `essai-lenteur/_brief/`. Mis-routing (a → assemble with writes, or b → check) FAILs. (SKILL.md › Default flow: "vérifier le brief" → check; "monter le brief" → assemble.) |
| S11 | B · GO (profile) | `assemble R/2026/07/guide-thalvane --resources R concept.md lore-extract.md`. `R/bank.yml` declares **`profile: jdr`** and catalogues `thalvane` (→ `_univers/thalvane/canon/lore.md`, lore) + `ordo` (→ `_systeme/ordo/canon/rules.md`, rules). Feeders: `writing:forge` + `ttrpg:lore-extract`. | **Same** behaviour as S1 with JDR bucket names: read `R/bank.yml`, select `thalvane` lore + `ordo` rules, **consolidate INLINE**. No climb back to `R`. | `summary.md` under `guide-thalvane/_brief/` inlines the **actual text** (la Faille, 2d6, dés de tension), **not** links. **No path back into `R`** (no `../`, `R/_univers/…`). Nothing written outside `guide-thalvane/`. The JDR profile changes only bucket/feeder names — the assembly rule is unchanged. (SKILL.md › Transversal rules "Consolidate, don't reference"; 01-assemble step 3; domain-layout.md § JDR profile buckets.) |
| S12 | B · GO (profile, select) | Same run; `R/bank.yml` also catalogues the **off-topic** `_univers/verne-sf/` (sci-fi, irrelevant to a fantasy guide). | Select the relevant subset (`thalvane` + `ordo`); do **not** dump the off-topic `verne-sf`. | Contexte consolidé inlines `thalvane` lore + `ordo` rules and **contains no text from `verne-sf`** (no vaisseaux-à-vapeur / académie-de-Nemo, no `verne-sf` name). (01-assemble step 2 "select the relevant subset … do not dump everything".) Mirror of S3 under the JDR profile. |
| S13 | A + B · GO (bucket-agnostic) | Two assemble runs, **same behaviour under test, different bucket names**: (a) fixture A, catalogued resource lives in generic bucket `_notes/lenteur.md`; (b) fixture B, catalogued resource lives in JDR bucket `_univers/thalvane/canon/lore.md`. | In **both**, `brief` consolidates the catalogued resource **INLINE** into `summary.md` › Contexte consolidé, identically — the verdict must **not** depend on whether the bucket is named `_notes` or `_univers`. | **PASS iff the verdict is the same for (a) and (b):** both inline the resource's actual text, both leave **no** back-reference to `R`, both write only under `<projet>/_brief/`. **FAIL** if the target treats one bucket name as special (e.g. only consolidates when it sees `_univers`, or hardcodes a JDR bucket) — that would break agnosticism. (SKILL.md › "consolidates **what `R/bank.yml` catalogues**, whatever the buckets are named"; domain-layout.md "Bucket names are **free** … the skills never hardcode a bucket name in the generic core".) |
| S14 | A · N/A (spec contradiction — do NOT resolve) | `check` on a pre-existing `_brief/` whose `personas/` holds **1** file (< 3). Isolates the "≥3 personas" clause. | Undecidable: SKILL.md rule 6 says a brief with fewer than 3 personas "is flagged incomplete by `check`", but `02-check` step 5 says "**Personas are optional**" and gates readiness on `output-styles/` only. | **N/A — not credited, not PASS, not FAIL, and NOT resolved by the judge.** The two specs disagree on whether `check` must flag `personas/ < 3`; no consistent expected behaviour exists to assert. Per harness-conventions ("never credit a behaviour contradicted by the spec"; N/A is a property of the spec/domain, not a defect), the clause is **parked** until SKILL.md rule 6 and `02-check` step 5 are reconciled. Excluded from the PASS tally. (SKILL.md › Transversal rules "≥3 distinct entries each … flagged incomplete by check" **vs** 02-check step 5 "Personas are optional".) |

<!-- Data-precondition guard: S1/S3/S4/S5 need atelier-lenteur/bank.yml + populated _notes/_sources-perso (S3 also fiscalite); S11/S12 need chroniques-thalvane/bank.yml (profile: jdr) + populated _univers/_systeme (S12 also verne-sf); S13 needs BOTH fixtures; S6/S8 need a pre-existing _brief/; S9 needs the project to have NONE. Missing state → N/A (fixture property), not FAIL. S14 is N/A by spec contradiction, independent of the fixtures. -->

## How to run

Agent-as-brief (dry-run, READ-ONLY on the fixtures): load `plugins/obs/skills/brief/SKILL.md` + `actions/01-assemble.md` + `actions/02-check.md` + `${CLAUDE_PLUGIN_ROOT}/references/domain-layout.md` + `${CLAUDE_PLUGIN_ROOT}/references/bank-yml.md` (domain-layout.md § JDR profile covers the S11–S13 profile buckets) + this suite. Generic scenarios run against **`atelier-lenteur`**; profile scenarios against **`chroniques-thalvane`**; S13 against both. For each scenario, reason out what `brief` **would** do — its response AND the precise set of files it would write/modify (paths + scope) — and judge against the pass criteria. Nothing is written to either fixture.

**Decisive observables** (write-scoped — a violation is an automatic FAIL):
1. **`R/` untouched.** No intended write targets `R/` (esp. `R/bank.yml`); `R` is read-only, and read only when `--resources` is explicitly passed (S1/S4/S5/S11 vs S7).
2. **No project `bank.yml`.** No `bank.yml` ever created under `<projet>/` — the only `bank.yml` is `R/bank.yml`, owned by `obs:tree` (S5).
3. **Inline, not referenced.** `summary.md` › Contexte consolidé contains the R globals' **actual text**; **zero** references resolving outside `_brief/` (no `../`, `R/…`, absolute/vault/`~`). Missing inputs land under `## Manques`, not as external paths (S1/S4/S7/S11).
4. **Bucket-agnostic consolidation.** Consolidation fires on **what `R/bank.yml` catalogues**, regardless of bucket name — generic `_notes` and JDR `_univers` yield the **same** verdict (S13); no bucket name is hardcoded.
5. **Type + language declared.** `summary.md` declares `type` + `language` up front, both non-empty, in either accepted form — form does not decide (S2).
6. **Select, don't dump.** Off-topic catalogued entries never bleed into `summary.md`: `fiscalite` (generic, S3) and `verne-sf` (JDR, S12) are left out; only the relevant subset is consolidated.
7. **No silent overwrite.** An existing `_brief/summary.md` is never overwritten without a confirmation/validation gate (S6).
8. **check writes nothing** and returns NOT READY on the empty-`output-styles/` gate (S8) or on a leak (S4); on an absent `_brief/` it stops with `[MISSING]` (S9).
9. **Routing.** "vérifier le brief" → `check` (no writes); "monter le brief" → `assemble` (S10).
10. **Downstream contract intact.** Every produced `_brief/` matches `writing:references/brief-model.md` (self-contained `summary.md` + `personas/` + `output-styles/`, `writing` never reaching back into `R`) — the agnosticisation does not change the keys/structure `writing` consumes.
11. **Personas ≥3 is N/A** — a spec contradiction (S14), **not resolved** by the judge, never credited as PASS in any tally.

## Results log

<!-- append run results here per behave/references/harness-conventions.md › Results log format. Empty until first run. -->

### 2026-07-03 — run 1 (initial, dry-run, target=brief, fixture=atelier-lenteur+chroniques-thalvane) — **13/13 PASS (1 N/A)**

**Fixtures (READ-ONLY).** A `atelier-lenteur` (GENERIC): `bank.yml` **without** `profile:`, buckets `_notes/`+`_sources-perso/` populated, off-topic decoy `fiscalite` catalogued, project `2026/07/essai-lenteur/` (concept.md + research.md) carrying a **pre-existing `_brief/`** = self-contained `summary.md` + `personas/` (1 file) + **empty `output-styles/`**. B `chroniques-thalvane` (JDR): `bank.yml` `profile: jdr`, buckets `_univers/`+`_systeme/` (canon lore/rules), off-topic decoy `verne-sf`, project `2026/07/guide-thalvane/` (concept.md + lore-extract.md), no `_brief/`. Pre-flight checker: **n/a** (suite carries a prose data-precondition guard, no executable checker). The physical `_brief/` overlay serves S6/S8; the assemble rows (S1/S3/S4/S5/S7) and S9 are judged against the suite-declared per-scenario `_brief` state ("present ONLY in S6/S8; ABSENT elsewhere").

| # | Fixture · type | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|---|----------------|----------------------|---------|-----------|--------------------------|
| S1 | A · GO | Read `bank.yml`, consolidate `_notes`+`_sources-perso` globals INLINE, no back-ref to `R` | PASS | = (new) | Intended write `essai-lenteur/_brief/summary.md` inlines actual text of `_notes/lenteur.md`+`citations.md`; zero `R/…`/`../`. (SKILL › "Consolidate, don't reference"; 01-assemble step 3) |
| S2 | A · GO | `summary.md` declares `type`+`language` up front, both non-empty | PASS | = (new) | Skeleton emits `**Type :** essay` / `**Langue :** fr` — both keys present, non-empty. Form (bold vs YAML) not decisive. (SKILL rule "both keys mandatory"; 01-assemble skeleton) |
| S3 | A · GO (select) | Off-topic `fiscalite` excluded from consolidation | PASS | = (new) | `summary:` "sans rapport avec l'essai" → left out; no tax text in Contexte consolidé. (01-assemble step 2 "select the relevant subset … do not dump") |
| S4 | A · NO-GO | Never reference an external `R` path in lieu of inlining (leak) | PASS | = (new) | Spec mandates inline; target emits no ref outside `_brief/`. `check` step 4 independently flags any leak → NOT READY. (SKILL "Consolidate, don't reference"; 02-check step 4) |
| S5 | A · NO-GO | No write to `R/`; no `bank.yml` under `<projet>/` | PASS | = (new) | Intended writes confined to `essai-lenteur/_brief/`; `R/bank.yml` byte-identical. (SKILL transversal "never writes `R/bank.yml` … only `bank.yml` is `R/bank.yml`"; 01-assemble step 5) |
| S6 | A · NO-GO | Existing `summary.md` not overwritten without confirmation | PASS | = (new) | `_brief/` present → update mode; overwrite gated behind user validation. (01-assemble steps 1/4; SKILL "Never overwrite … without explicit confirmation") |
| S7 | A · boundary | No `--resources` → `R` not auto-discovered up-tree | PASS | = (new) | Assembles from `concept.md` only; `R` unread; absent globals → `## Manques`, not an external path. (SKILL "R reached only as explicit input … never auto-discovered"; 01-assemble step 2) |
| S8 | A · GO (check) | Readiness gate fires on empty `output-styles/` only; zero writes | PASS | = (new) | NOT READY driven solely by empty `output-styles/` → recommend `writing:tone-finder`; no persona-count in verdict; no file written. (02-check steps 5/6) |
| S9 | A · boundary | Absent `_brief/` → `[MISSING]` + stop, create nothing | PASS | = (new) | Judged against S9's declared no-`_brief` config: 02-check step 1 emits `[MISSING] _brief/ — run assemble first` and stops. (02-check step 1) |
| S10 | A · routing | "vérifier"→`check` (no writes); "monter"→`assemble` (writes `_brief/`) | PASS | = (new) | Trigger table maps both correctly. (SKILL › Default flow) |
| S11 | B · GO (profile) | Same S1 behaviour with JDR bucket names; consolidate `thalvane`+`ordo` INLINE | PASS | = (new) | `guide-thalvane/_brief/summary.md` inlines la Faille/2d6/dés de tension; no `../`/`R/_univers/`. (SKILL "Consolidate…"; 01-assemble step 3; jdr-layout profile) |
| S12 | B · GO (select) | Off-topic `verne-sf` excluded (mirror of S3, JDR) | PASS | = (new) | `verne-sf` `summary:` "hors-sujet" → left out; no vaisseaux-à-vapeur/Nemo text. (01-assemble step 2) |
| S13 | A+B · GO (bucket-agnostic) | Verdict identical whether bucket is `_notes` (A) or `_univers` (B) | PASS | = (new) | **Decisive:** generic core keys consolidation on `bank.yml` `path`/`summary`, never on bucket name — no branch on `_univers`. (a) and (b) both inline, both no back-ref, both write only `<projet>/_brief/`. (SKILL "whatever the buckets are named"; domain-layout "Bucket names are free … never hardcode a bucket name") |
| S14 | A · N/A | Personas < 3 flagging — spec contradiction | **N/A** | — | SKILL rule 6 "fewer … flagged incomplete by check" vs 02-check step 5 "Personas are optional". Parked, NOT resolved, excluded from PASS tally. (SKILL transversal vs 02-check step 5) |

**Frictions / gaps:**
- **Spec form divergence (S2, non-fatal):** SKILL.md mandates a *YAML front-matter* for `type:`/`language:`, but the `01-assemble` skeleton emits markdown-bold `**Type :**`/`**Langue :**`. Both carry the two mandatory keys, so no target-behaviour FAIL — but the two spec files disagree on the *form* and should be reconciled (pick YAML front-matter OR bold, consistently).
- **Personas contradiction (S14):** SKILL rule 6 vs 02-check step 5 — genuine spec contradiction, parked N/A until reconciled. Not a defect of the target.
- **Fixture single-state overlay:** one on-disk `essai-lenteur` cannot simultaneously hold "`_brief/` present" (S6/S8) and "absent" (S9). The physical build carries the pre-existing `_brief/` (per S6/S8); S1/S3/S4/S5/S7 and S9 are judged against the suite-declared per-scenario `_brief` state. Coverage preserved; noted for transparency.

**Tally:** 13/13 PASS (1 N/A) — first run on this suite, no prior baseline; suite is **green**. S14 (personas ≥3) held N/A by spec contradiction and excluded from the PASS denominator. Zero FAIL: every credited PASS rests on an explicit instruction (no false-good-test among them); the decisive agnosticity scenario S13 confirms the generic core branches on `bank.yml` catalogue entries, never on bucket names. Nothing was written to either fixture.
