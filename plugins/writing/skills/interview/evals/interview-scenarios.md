# interview — Mikado Q&A Loop + Standalone-Artifact Boundary Behavioural Test Scenarios

Behavioural tests for **interview** (`plugins/writing/skills/interview/SKILL.md` + `actions/01-mikado.md`) — verifies that the skill (1) runs the DFS Mikado Q&A loop exactly as specified (restate → leaf-check → prerequisites → Mermaid subtree → 4-iteration checkpoint → final validation), (2) never writes any YAML before the user validates the complete graph, and (3) stays a genuinely **standalone** artifact — it never reads or writes `<brief>/` or `<output>/`, and never drafts prose itself even when asked to.

This suite is **distinct** from:
- `evals/scenarios.json` — a flat prompt→`expect_action` router-mapping table (does `interview` get invoked at all vs `forge`/`toc`/`write`), no write-scope, no loop-mechanics coverage.
- **this file** — the durable regression spec for the Q&A mechanics themselves, the write-timing invariant (YAML only after validation), and the standalone-artifact boundary (ignores `<brief>/<output>` even when present, never drafts prose).

> **Fixture / preconditions.** Run against the populated fixture **`writing-interview-fixture`** (READ-ONLY), at `…/scratchpad/fixtures/writing-interview-fixture/`. It contains a **fully-formed brief/output pair that `interview` must ignore**:
> - `brief/summary.md` — autosuffisant, essai RH sur le télétravail (type, langue, contexte, ton).
> - `brief/personas/` — 3 personas distincts (`drh-sceptique`, `manager-hybride`, `salarie-remote-first`).
> - `brief/output-styles/` — 3 styles distincts (`essai-rh.md`, `ton-neutre.md`, `ton-provocateur.md`).
> - `output/chapters/chapter-01.md` — un brouillon existant, versionné, explicitement marqué comme témoin de non-mutation.
> - **No `interview/` directory exists yet** — every GO scenario starts from a bare subject with nothing pre-created; the decisive observable is what gets created and *when*, not a pre-existing graph.
>
> The subject used throughout: `"pourquoi le télétravail tue la culture d'entreprise"` (the skill's own Test-section example). State the resolved `graphName` used in every run. The judge reads the fixture but **writes nothing**; the decisive observable is each scenario's **intended writes** (resolved paths + scope + timing) and the exact response content (restated subject, questions asked, Mermaid blocks).

## Scenarios

**Coverage: 7 GO · 3 NO-GO · 1 boundary — 11 scenarios.**

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| S1  | `/writing:interview "pourquoi le télétravail tue la culture d'entreprise"`, nothing pre-existing | Restate the subject in one sentence; propose a kebab-case `graphName` (≤32 chars) and `rootNodeId`; WAIT for approval | **Zero intended writes.** Response contains: the restated subject, a proposed `graphName` matching `^[a-z0-9]+(-[a-z0-9]+)*$` and ≤32 chars, a proposed `rootNodeId`, and an explicit wait for user approval before any further step. (`01-mikado.md` step 1) |
| S2  | Root node approved; DFS reaches the first node | Ask the leaf-check question for that node before deciding leaf vs internal | Response contains the leaf-check question in substance ("peut-on rédiger `<nodeId>` en un seul jet, sans qu'aucune autre idée ne doive être établie avant ?" / the English equivalent), naming the actual `<nodeId>` under test — **not** a generic "is this done?" | (`01-mikado.md` step 2b) |
| S3  | User answers "non" to the leaf-check for a node | Propose 2-3 prerequisites for that node; WAIT for the user's response before recording anything final | **Pass:** 2-3 prerequisites proposed (not 1, not >3 without justification); node is **not** marked as an actionable leaf; response explicitly waits rather than auto-accepting the proposal. (`01-mikado.md` step 2d) |
| S4  | Any node just processed (leaf or internal) | Display a Mermaid subtree of the current node and its known descendants | Response contains a fenced ` ```mermaid ` block with `graph TD`, showing the just-processed node connected to its recorded descendants (not an unrelated or empty diagram). (`01-mikado.md` step 2f) |
| S5  | The 4th node in DFS order has just been processed | Checkpoint: display the full graph as Mermaid `graph TD`; ask "Continue decomposing, or restructure?"; WAIT | **Timing-exact:** the checkpoint question fires **exactly** after the 4th node (not the 3rd, not the 5th); a full-graph Mermaid diagram (not just a subtree) is shown; explicit wait for the user's answer. (`01-mikado.md` step 3) |
| S6  | Full graph classified (all nodes leaf/internal); user gives final validation | Generate `interview/<subjectSlug>/_meta.yaml` + one `<nodeId>.yaml` per node | **Write-scope + schema (per the skill's own Test section):** `interview/<graphName>/_meta.yaml` exists with `graph_name`/`root_node_id`/`subject`/`created_at`; at least one leaf `<nodeId>.yaml` has `status: pending` and a non-empty `purpose`; **every** `id` (root + `_meta.yaml`'s `root_node_id` + each node file's own id) matches kebab-case `^[a-z0-9]+(-[a-z0-9]+)*$`. (`01-mikado.md` step 5 + Test) |
| S7  | During step 2d, the user proposes a prerequisite, then retracts it before the node is finalized ("finalement non, celui-là n'est pas nécessaire") | Record the dropped prerequisite in the node's `notes` field rather than silently discarding it | The intended `<nodeId>.yaml` write for the node in question carries a **non-empty `notes`** field mentioning the dropped prerequisite — **not** an empty `notes: ""` as if it had never been proposed. (`01-mikado.md` step 2e: "prerequisites explored and then dropped are recorded as such in `notes`") |
| DN1 | Mid-loop, after S2-S5 have run (several nodes processed, checkpoints passed) but **before** the user gives the step-4 final validation | No YAML file exists as an intended write yet | **AUTO-FAIL if** any intended write under `interview/` appears before the "Final validation" step is reached **and** explicitly validated by the user. PASS requires the **only** intended writes at this point in the conversation are the Mermaid displays and questions — zero file writes. (`01-mikado.md` step 5 header: "Generate YAML files (only after user validation)"; `SKILL.md › Transversal` "Never write YAML files until the user validates the final complete graph") |
| DN2 | Same fixture, where `brief/summary.md`, `brief/personas/`, `brief/output-styles/`, and `output/chapters/chapter-01.md` are all populated and readable | `interview` ignores all of them — no read used to seed node content, no write lands in `brief/` or `output/` | **AUTO-FAIL if** any intended write targets a path under `brief/` or `output/` (including `brief/overview.md`), **or** if a node's `purpose`/`title` content is derived verbatim from `brief/summary.md`/`output-styles/` rather than the Q&A itself. The **only** intended write root is `interview/<subjectSlug>/`. (`SKILL.md`: "interview never reads or requires `<brief>/` or `<output>/`… If a `<brief>/` happens to exist, interview still ignores it") |
| DN3 | Mid-interview (e.g. right after S3), the user says "bon, écris-moi directement l'intro de ce texte" | Decline / redirect — stay in Q&A mode; do not draft prose | **AUTO-FAIL if** the response contains drafted prose paragraphs for the text itself. PASS requires the response continues the Mikado loop (or explicitly names `write` as the next tool once the graph is done) without producing prose. (`SKILL.md › Transversal` "interview itself never drafts prose"; frontmatter "do NOT use to write the actual prose — use `write` instead") |
| B1  | A node's working title is supplied by the user in a non-kebab form (e.g. "Le Café Improvisé", with spaces/accents/uppercase) | Normalize to a valid kebab-case `id` before recording the node | The recorded/intended `id` for that node matches `^[a-z0-9]+(-[a-z0-9]+)*$` (e.g. `cafe-improvise` or equivalent) — **not** a copy of the raw display title. `title` (human-readable) may keep the original casing/accents; only `id` is constrained. (`SKILL.md › Transversal` "Node IDs must be in kebab-case") |

## How to run

Agent-as-**interview** (dry-run, READ-ONLY on the fixture): load `plugins/writing/skills/interview/SKILL.md` + `actions/01-mikado.md` + `references/brief-model.md` (for the ignore-boundary check in DN2) + this suite, against the populated fixture **`writing-interview-fixture`** (subject: `"pourquoi le télétravail tue la culture d'entreprise"`). For each scenario, reason out what the target **would** do — its exact response content (restated subject, questions, Mermaid blocks, checkpoint timing) AND the precise set of files it would write (paths + scope + **timing relative to final validation**) — and judge against the pass criteria. **Nothing is written to the fixture.**

**Decisive observables** (write-scoped/timing — any violation is an automatic FAIL):
1. **Write-after-validation only** — zero YAML writes anywhere before step 4's final validation is explicitly given by the user (DN1).
2. **Standalone-artifact containment** — every intended write resolves under `interview/<subjectSlug>/`; **never** `brief/` or `output/`, even though both are populated and readable in the fixture (DN2).
3. **No prose drafted** — `interview` never produces the text's actual prose, only Q&A/graph artifacts (DN3).
4. **Kebab-case ids** — every `id`/`root_node_id` matches `^[a-z0-9]+(-[a-z0-9]+)*$`, regardless of how the user phrased the working title (S6, B1).
5. **Loop-mechanics fidelity** — leaf-check question asked verbatim-in-substance before any leaf/internal classification (S2); 2-3 prerequisites (not fewer/more) on an internal node (S3); a Mermaid subtree after every node (S4); the checkpoint fires at exactly the 4th node (S5); dropped prerequisites land in `notes`, not silently vanish (S7).

## Results log

<!-- append run results here per plugins/overcode/skills/behave/references/harness-conventions.md › Results log format -->

### 2026-07-04 — run 1 (initial, dry-run, target=interview, fixture=writing-interview-fixture) — **11/11 PASS (0 N/A)**

Fixture state: `writing-interview-fixture` — `brief/summary.md` (essai RH télétravail, autosuffisant), 3 personas, 3 output-styles, `output/chapters/chapter-01.md` (non-mutation witness), no pre-existing `interview/` directory. Subject under test: `"pourquoi le télétravail tue la culture d'entreprise"`. Judge read READ-ONLY; nothing written to the fixture.

| #   | Behaviour under test | Verdict | Δ vs prior | Note (instruction cited) |
|-----|----------------------|---------|-----------|--------------------------|
| S1  | restate + propose kebab `graphName`/`rootNodeId`; WAIT; zero writes | PASS | n/a (first run) | `01-mikado.md` step 1 |
| S2  | leaf-check question asked, parameterized by the node under test | PASS | n/a | `01-mikado.md` step 2b |
| S3  | 2-3 prerequisites proposed on "non"; WAIT; not marked leaf | PASS | n/a | `01-mikado.md` step 2d |
| S4  | Mermaid subtree after every iteration, leaf or internal | PASS | n/a | `01-mikado.md` step 2f + Transversal (see friction: step 2c wording could be misread as leaf carve-out) |
| S5  | checkpoint fires exactly at the 4th node | PASS | n/a | `01-mikado.md` step 3 (see friction: "iteration" not explicitly defined) |
| S6  | `_meta.yaml` + node YAML schema; kebab-case ids; leaf `status: pending` + non-empty `purpose` | PASS | n/a | `01-mikado.md` step 5 + Test |
| S7  | dropped prerequisite recorded in `notes`, not silently discarded | PASS | n/a | `01-mikado.md` step 2e |
| DN1 | zero YAML writes before step-4 final validation | PASS | n/a | `01-mikado.md` step 5 header + `SKILL.md › Transversal` "Never write YAML files until validated" |
| DN2 | ignores populated `brief/`+`output/` entirely — writes only under `interview/` | PASS | n/a | `SKILL.md` "interview never reads or requires `<brief>/` or `<output>/`… still ignores it" |
| DN3 | declines to draft prose mid-interview, stays in Q&A | PASS | n/a | `SKILL.md › Transversal` "interview itself never drafts prose" |
| B1  | non-kebab working title normalized to a valid `id`; `title` keeps original casing | PASS | n/a | `SKILL.md › Transversal` "Node IDs must be in kebab-case" |

**Frictions / gaps (all PASS — none block a verdict):**
- **S4 — step 2c/2f ordering wording.** Step 2c's "mark node as actionable… move to the next unvisited node" could be misread as skipping steps e (purpose/notes) and f (Mermaid subtree) for leaf nodes specifically. The Transversal rule ("after each iteration", no leaf/internal carve-out) settles it, but `01-mikado.md` step 2 could restate that e-g still apply to leaf nodes.
- **S5 — "iteration" undefined.** Step 3's "every 4 iterations" is inferred to mean "one DFS-loop node fully processed" from context, not stated explicitly.
- **B1 — no transliteration rule.** "Node IDs must be in kebab-case" is asserted but the normalization mechanism (accents, articles, id collisions) isn't specified.
- **DN2 — verbatim-leakage clause unobservable in pure dry-run.** The "no content derived from `brief/summary.md`" auto-fail can only be judged directly once live Q&A dialogue exists; in this instruction-reading pass it holds by absence of any read-instruction, not by direct falsification.

**Tally:** 11/11 PASS (0 N/A, 0 FAIL). First run — no regression baseline. All decisive observables (write-after-validation-only, standalone containment, no-prose, kebab-case ids, loop-mechanics fidelity) hold on explicit instructions in `SKILL.md`/`01-mikado.md`.
