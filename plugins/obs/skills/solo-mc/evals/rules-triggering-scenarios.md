# Solo-MC — Rules-Triggering Behavioural Test Scenarios

Behavioural tests for the **fiction→rule bridge** of the `solo-mc` play loop: do the agents actually **detect, read, and adjudicate the active game system's mechanics** when a PC's action is uncertain — instead of free-narrating the outcome? This targets a defect observed in real play: *the narration ran without any rules management* (mechanics never fired, no rolls, no outcomes).

> **Universal principle under test (system-agnostic):** *whenever a PC's action has an uncertain, staked outcome, the active system's rules decide it — never free narration.* Only the **form** of resolution changes by system: a textual move *déclencheur* (PbtA → `2d6+stat`, tiers), a roll under a threshold (d100 ≤ skill%+stat%), a roll vs DC (d20)… The suite therefore runs on **two system classes**: a **trigger system** (PbtA fixture: `monsterhearts`, Part A/B below) and a **judgement system** (d100 fixture: `zombiology` / Adrénaline — see the *Generality* run in the Results log).

This suite is **distinct** from the others:
- `oracle-scenarios.md` — the oracle subsystem (chance/decision draws).
- `narrateur-scenarios.md` — the GM voice (prose, HRP/RP, micro-scene loop).
- `play-scenarios.md` — session management (T0–T14).
- **this file** — the **mechanic triggering** loop: uncertain PC action → resolve via `R/_systeme/canon/` (roll + outcome + consequences) in whatever form the system uses, MC never rolls.

> **What this targets (expected to FAIL until fixed).** Move-triggering currently has **no explicit owner** in the loop. The narrateur (`agents/narrateur.md`) reads `R/_systeme/canon/` for *tone only*, has **no dice** (`Read, Glob`), and its micro-scene step 4 ("Resolve action (auto / roll / oracle)") never says *read the system's move triggers and route a matching beat to a roll*. The `04-roll` action exists but nothing invokes it from the fiction. The "trigger-first" rule lives only as a SKILL pitfall, not as an enforced step. So a faithful run on current behaviour should mostly FAIL these — that is the point: this file is the regression spec that pins the missing behaviour.

Run via agents that load the play loop (`SKILL.md` + `actions/{01-play,02-scene,04-roll}.md` + `agents/narrateur.md` + `agents/oracle.md`), against a **populated** domain whose `R/_systeme/canon/` actually contains the moves. Reference fixture: `monsterhearts` — `_systeme/canon/rules.md` (validated) holds the Core Loop (*fiction → déclencheur → 2d6 + caractéristique → palier → conséquences*) and the base actions **Allumer** (Sexy), **Rembarrer** (Glacial), **Garder son sang-froid** (Glacial), **Cogner** (Impulsif), **Fuir** (Impulsif), **Contempler l'Abysse** (Ténébreux), **Manipuler** (dépense d'ascendant) + `mues.md` (Darkest Self / *succomber*). Domain `R` resolved locally via l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/`.

## Part A — Mechanic triggering on a TRIGGER system (PbtA fixture: `monsterhearts`)

| #  | Fiction beat (player input, RP) | Expected mechanical handling | Pass criteria |
|----|----------------------------------|------------------------------|---------------|
| M1 | « Je me rapproche, je joue de mon charme pour qu'il craque. » | Read `_systeme/canon/`, match trigger → **Allumer** (Sexy). Prompt the player to roll **2d6 + Sexy**. Apply the tier (10+/7-9/6-) from the move text; on 6- play an MC reaction **and** award **1 PX**. | The move is **named**, the **2d6+Sexy** roll is requested (not auto-narrated), the **tier outcome** is applied from canon. FAIL if the seduction outcome is narrated freely with no roll. |
| M2 | « Je le fixe froidement et je le rembarre devant tout le monde. » | Trigger → **Rembarrer** (Glacial) → 2d6 + Glacial → tier. | Move named; 2d6+Glacial requested; tier applied. FAIL on free narration. |
| M3 | « Je perds mon sang-froid et je lui mets un coup. » | Trigger → **Cogner** (Impulsif) → 2d6 + Impulsif. Note: a **7-9** here can trigger *succomber* (Darkest Self). | Move named; roll requested; **7-9 branch** surfaces the Darkest-Self possibility from `mues.md`. FAIL if violence resolved by narration alone. |
| M4 | « Je le manipule : je lui promets mon aide s'il me couvre. » | Trigger → **Manipuler** → check the **ascendant/string** economy (the move *spends* leverage). | Move named; the **resource cost** (ascendant) is checked/applied per canon, not ignored. FAIL if manipulation just "works" narratively. |
| M5 | « Une horreur surgit du couloir ; est-ce que je garde mon calme ? » | Trigger → **Garder son sang-froid** (Glacial) → 2d6 + Glacial. | Move named; roll requested; tier applied. FAIL on free narration. |
| M6 | « Je détale, je cours vers la sortie. » | Trigger → **Fuir** (Impulsif) → 2d6 + Impulsif. | Move named; roll requested; tier applied. |
| M7 | 6- result is produced on any move (e.g. M1 returns 6-) | MC plays a **reaction** (*faire monter / balancer la sauce*) **and** the PC gains **1 PX**. | Both consequences fire: an MC reaction in fiction **and** the +1 PX bookkeeping. FAIL if the miss is narrated without the PX award or without an MC reaction. |

## Part B — Trigger-first discipline & agent division of labour

| #  | Situation | Expected behaviour | Pass criteria |
|----|-----------|--------------------|---------------|
| M8 | « Je traverse la cour pour rejoindre mon casier. » (no move trigger) | **Trigger-first**: no move matches → **no roll**, no ad-hoc mechanic. A soft MC reaction or a simple narration is valid. | No invented roll/mechanic; the loop does NOT force dice where no trigger applies. (Inverse of the Part-A failure.) |
| M9 | A staked outcome with **no** matching move (pure chance: « est-ce qu'il pleut ? ») | Route to the **oracle** (muses-et-oracles / parallaxe), not to a system move. | Oracle invoked for chance; not mis-routed to a move roll. |
| M10| A staked outcome **with** a matching move (e.g. seduction, as M1) | Use the **move's roll**, NOT a free oracle yes/no. | The move's 2d6+stat is used; the oracle is **not** substituted for an existing move. FAIL if the oracle answers what a move should resolve. |
| M11| Any roll is needed | The **MC never rolls**; the **player** rolls 2d6+stat. The narrateur (`Read, Glob`, no RNG) must **request** the roll / delegate, not fabricate a result. | The agent asks the player to roll (or routes to `04-roll`); it does not invent the PC's dice result. |
| M12| `_systeme/canon/` present but the beat matches **no** documented move and is not pure chance | Do not invent a mechanic; resort to an MC reaction (trigger-first) and, if a durable rule emerges, flag it for `_systeme/mj/solo.md` (T13). | No fabricated mechanic; correct fallback to MC reaction; no silent rule invention. |

## Part C — Data precondition (root-cause guard)

| #  | Check | Expected | Pass criteria |
|----|-------|----------|---------------|
| M13| Are the system's **moves actually in `R/_systeme/canon/`**? | The move list + Core Loop + tiers must be present and readable. | For `monsterhearts`: `rules.md` PATTERNS lists Allumer/Rembarrer/Garder son sang-froid/Cogner/Fuir/Contempler l'Abysse/Manipuler with tiers; `mues.md` holds Darkest Self. If absent → the loop can't trigger anything → gate per T6/T7 (regenerate), **never** free-narrate. |

## How to run

Two complementary harness modes:

1. **Agent-as-play-loop (behavioural).** Load `SKILL.md` + `actions/{01-play,02-scene,04-roll}.md` + `agents/narrateur.md` + `agents/oracle.md`, against the populated `monsterhearts` domain with active campaign `les-fantomes-de-snake-high` (system = Monsterhearts 2). Feed each Part-A/B beat as a player RP message mid-session and capture the response. **Judge the response against the pass criteria**: was the move *named from canon*, was the *roll requested* (2d6+stat), was the *tier outcome* applied, was *trigger-first* respected, did the *MC avoid rolling*? This is a dry run for domain writes — but the decisive observable is the **response content** (move identified + roll requested + tier), not a file diff.

2. **Ownership audit (structural).** Independently of any run, verify which component is *specified* to own move-triggering: grep `agents/narrateur.md`, `actions/02-scene.md`, `actions/04-roll.md`, and `SKILL.md` for an explicit step "read `_systeme/canon/` move triggers → match the fiction → route to a 2d6+stat roll → apply the tier". If no component owns it actively (only the SKILL *pitfall* mentions trigger-first), Part A is expected to FAIL behaviourally — record that as the root cause.

A scenario passes only if the mechanic is **triggered and adjudicated from canon**; free narration of a moveable outcome is a FAIL (that is the real-play defect this suite exists to catch).

## Results log

<!-- append run results here: date, scenario, observed handling (move named? roll requested? tier applied?), pass/fail, root-cause notes -->

### 2026-06-13 — run 1 (dry-run, domain=`monsterhearts`, système=Monsterhearts 2) — **3/13 PASS** (reproduit le défaut de jeu réel)

Données confirmées présentes (M13 PASS) : `_systeme/canon/rules.md` (Core Loop, Allumer/Rembarrer/Garder son sang-froid/Cogner/Fuir/Contempler l'Abysse/Manipuler, paliers 10+/7-9/6-) + `mues.md` (démon intérieur). Donc le défaut est **comportemental**, pas un manque de données.

| Bloc | Résultat |
|------|----------|
| **Part A** (M1–M7, déclenchement de moves) | **0/7 PASS** — aucun move nommé, aucun jet 2d6+carac demandé, aucun palier appliqué → narration libre |
| **Part B** (M8–M12, discipline/division du travail) | M8 PASS (mais « par accident » : pas de mécanique du tout) ; M9 PASS (oracle = seul chemin possédé) ; M10 FAIL (beat « movable » mal routé vers l'oracle yes/no au lieu du move) ; M11 partiel (le narrateur ne fabrique pas de dé — OK — mais rien ne lui dit de *demander* le jet) ; M12 partiel (fallback existe en *pitfall*, non appliqué) |
| **Part C** (M13, données) | PASS — moves présents et `validated: true` |

**Cause racine — le déclenchement de moves n'a aucun propriétaire actif :**
- `agents/narrateur.md` (propriétaire naturel de la boucle beat-par-beat) lit `_systeme/canon/` **pour le ton seulement** (L16/L40), n'a **pas de dés** (`Read, Glob`, L4), et son étape 4 « Resolve action (auto/roll/oracle) » (L63) ne dit **jamais** « lire les déclencheurs de moves, matcher la fiction, nommer le move, demander 2d6+carac, appliquer le palier ».
- `actions/02-scene.md` applique T13, mais **la seule sortie mécanique de T13 est l'oracle** (L68) — pas de branche « move du système ». D'où le mauvais routage M10.
- `actions/04-roll.md` n'est invoqué **que** sur « roll/lancer/dés » explicite du joueur (SKILL L39), jamais **depuis la fiction**.
- « trigger-first » n'existe qu'en **pitfall** SKILL (L83) — un avertissement, pas une étape.

**Fix minimal proposé (3 points) :** (1) `narrateur.md` — étape de déclenchement **avant** narration : lire les déclencheurs de `_systeme/canon/`, nommer le move, router vers `04-roll` (2d6+carac), appliquer le palier, 6- → réaction MC + 1 PX ; (2) `02-scene.md`/T13 — **branche « move du système » avant la branche oracle** ; (3) `04-roll.md` — chemin d'entrée depuis le narrateur (déclenché par la fiction), pas seulement par commande explicite. → Au prochain run, Part A doit passer.

### 2026-06-13 — run 2 (post-fix, dry-run, domain=`monsterhearts`) — **13/13 PASS** (Part A : 0/7 → 7/7)

Fix appliqué : `agents/narrateur.md` (nouvelle section **« Move triggering — the fiction→rule bridge (MANDATORY) »** + étape 4 de la boucle réécrite + lecture de la carac réelle sur la fiche PJ), `actions/02-scene.md` (étape 5 : move-triggering avant narration, beat couvert par une move → la move, pas l'oracle), `actions/04-roll.md` (section *Invoked by* : chemin déclenché par la fiction), `SKILL.md` T13 (Étape 1 = trigger-first ; Étape 3 défère à la move si elle couvre l'enjeu).

| Bloc | run 1 | run 2 |
|------|-------|-------|
| Part A (M1–M7, déclenchement) | 0/7 | **7/7** |
| Part B (M8–M12) | 1 PASS + 1 « accidentel » + partiels | **5/5** (M10 mauvais routage corrigé ; M11/M12 partiels → PASS) |
| Part C (M13) | PASS | PASS |
| **Total** | **3/13** | **13/13** |

**Lacunes résiduelles (non bloquantes) :** (1) ~~valeur de carac non lue~~ → **corrigé** (lecture de `R/_campagnes/<c>/pj/<name>.md`) ; (2) cas-bord système (Allumer sur cible non-consentante → « Rembarrer avec Sexy », précondition d'ascendant de Manipuler) reposent sur la lecture fine du canon par le narrateur — propre au jeu, couvert génériquement par « surface move-specific branches from canon » ; (3) **enforcement mono-propriétaire** : le déclenchement ne s'exécute que si le narrateur est invoqué — mitigé par T13 (Étape 1) porté aussi par le SKILL, mais un tour RP traité hors invocation du narrateur reste un angle mort théorique.

### 2026-06-13 — run 3 (généralisation système-agnostique) — test sur DEUX classes de systèmes

Le fix run-2 était **PbtA-overfit** : un test sur `zombiology` (Adrénaline d100, **sans déclencheur textuel**) a montré 2/7 seulement — les beats incertains (crochetage, sprint, stress) retombaient dans « pas de move → pas de jet → narration libre » (le bug d'origine, pour toute une classe de systèmes). Cause : le *gate* cherchait un *déclencheur textuel* au lieu d'un *jugement d'incertitude*.

**Généralisation appliquée** (principe utilisateur) : *dès qu'une action de PJ a une issue **incertaine et à enjeu**, on statue avec les **règles du système actif** ; seule la **forme** de résolution varie* (déclencheur textuel PbtA → 2d6+carac/paliers ; jet sous seuil d100 ≤ Compétence%+Carac% ; vs DC en d20…). Fichiers : `narrateur.md` § *Mechanic triggering — uncertainty → rules* (deux cas : trigger systems / judgement systems ; « Uncertainty is the gate, not a printed keyword » ; déclencheur aussi *GM-imposed* pour le stress) ; `SKILL.md` T13 Étape 1 + pitfall « Narrer une issue incertaine sans la résoudre » ; `02-scene.md`, `04-roll.md`.

| Fixture | Système | run 2 | run 3 (post-généralisation) |
|---------|---------|-------|------------------------------|
| `monsterhearts` | PbtA (déclencheur textuel) | 13/13 | **13/13** (non-régression — PbtA porté comme forme nommée du principe) |
| `zombiology` | Adrénaline d100 (jugement, sans trigger) | 2/7 | **7/7 logique** — Z1/Z3/Z5 FAIL→PASS ; jets concrets `[HRP]` faute de fiche PJ (limite **données**, pas logique) |

**Verdict : la boucle est désormais système-agnostique.** Le chemin PbtA validé reste intact ; les systèmes à jugement (%, vs DC) déclenchent correctement sur le critère d'incertitude. Limite restante côté `zombiology` : absence de `_campagnes/`/`_pjs/` → pas de valeurs de compétence concrètes (résolu honnêtement par un `[HRP]`, non simulé).
