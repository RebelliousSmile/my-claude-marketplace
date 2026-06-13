# Narrateur — Functional Test Scenarios

Functional tests for the `narrateur` agent (`plugins/obsidian/agents/narrateur.md`) — the GM voice. Unlike the oracle (data-deterministic), the narrateur is **qualitative**: tests observe the rendered output against behavioural criteria. Run via an agent that loads `narrateur.md` + `references/response-templates.md`, against a real domain `R`, with a minimal synthetic context.

Subsystems for the narrateur (under `R/_savoir/subsystems/`): **conversation-cards** (dialogue — present, `validated: true`) and **cinerio** (description — NOT installed yet → must graceful-degrade). Game domain `R` resolved **locally** via the `_savoir/` marker — see `../../../references/jdr-layout.md`.

| # | Situation (input) | Expected behaviour | Pass criteria |
|---|-------------------|--------------------|---------------|
| N1 | Open a scene (PJ arrives at a tense location) | route `description` → cinerio → **absent → graceful degrade** (`[HRP] subsystem cinerio not installed…`), render via **Scene block** template, micro-scene (2–3 sentences + a question) | degrade note present; Scene block used; ends on a question; ≤ ~4 narrative sentences |
| N2 | Voice a hostile NPC who refuses to help | route `dialogue` → conversation-cards → pick a card (e.g. Famille=Aggressive), apply its verbs/actions, render via **Dialogue block** | NPC line reflects a real conversation-cards entry (verbs/actions); Dialogue block template; voice tic present |
| N3 | Player asks a rules question mid-scene (`[HRP] est-ce que je peux voir dans le noir ?`) | **HRP/RP separation**: answer in `[HRP]` first, then resume fiction in `[RP]` | mechanical answer isolated in `[HRP]`; no rule-talk inside `[RP]` |
| N4 | Render an oracle result handed over (`oracle: Non, mais…`) | convert the result into **fiction** (no dice shown), then a question to the player | fiction consequence consistent with “No, but…”; die not surfaced; ends with player prompt |
| N5 | Player posts an RP action (`je dégaine et j'avance`) | respond with consequence + question; **do not decide the PC's next action** nor reveal PC internal thoughts | no PC decision authored; narrateur asks what the player does |

## How to run

Agent-as-narrateur: load `plugins/obsidian/agents/narrateur.md` + `plugins/obsidian/skills/solo-mc/references/response-templates.md` as instructions; provide a minimal context (a system + a scene); for each scenario render the output and capture it. conversation-cards drawn from `R/_savoir/subsystems/conversation-cards/canon/conversation-cards.md`.

Note: the narrateur has `tools: Read, Glob` (no Bash) — it **selects** a conversation card by attitude/emphasis rather than rolling; true random draws are the oracle's job.

## Results log

<!-- append: date, scenario, observed output summary, pass/fail, frictions -->

### 2026-06-01 — run 1 (harness agent-as-narrateur, real domain, synthetic 2d6/PbtA context) — **5/5 PASS**

| # | Observé | Verdict |
|---|---------|---------|
| N1 | cinerio absent → `[HRP] subsystem cinerio not installed…` + Scene block + micro-scène (≤4 phrases, finit sur question) | PASS |
| N2 | conversation-cards #1 « I won't help you… » (Aggressive/Casual) sélectionnée + Verbes/Actions appliqués, Dialogue block + tic de voix | PASS |
| N3 | `[HRP]` (fait du monde + mécanique) puis `[RP]` ; pas de mélange ; pas de pensée imposée | PASS |
| N4 | « Non, mais… » converti en fiction (2ᵉ silhouette occupée), aucun dé montré, question finale | PASS |
| N5 | action RP exécutée → conséquence + question, pas de pré-décision du PJ | PASS |

**Frictions → corrigées :**
- « Tirer » vs « sélectionner » sans RNG → ajout note « Select, don't roll ; random draw = oracle ».
- §51 prescrivait une écriture dans le domaine alors que narrateur est read-only → reformulé en « flag pour la grille T13 (le skill persiste) ».
- Réponses hybrides description+dialogue → note « router chaque segment ».
- Détection subsystem absent → « Glob ne retourne rien → degrade ».
- Mechanical Q Block vs oracle déjà résolu → note d'usage ajoutée dans `response-templates.md`.
