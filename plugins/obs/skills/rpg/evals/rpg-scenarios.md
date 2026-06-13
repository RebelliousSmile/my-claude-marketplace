# RPG — Behavioural Test Scenarios

Behavioural tests for the `rpg` skill (`plugins/obs/skills/rpg/SKILL.md`) — the GM-prep workshop. Unlike `scenarios.json` (which only declares the trigger→action routing), these observe the **rendered behaviour** of an action run against a real domain `R`: which files it touches, what it refuses to do, and whether it works *with* the user rather than dumping a finished campaign.

Run via an agent that loads `SKILL.md` + the relevant `actions/*.md` + `references/methode-creation.md`, against a real domain `R` holding at least one universe and one PJ with an `intention.md`. Pass = the expected behaviour is observed AND no forbidden write occurs.

Game domain `R` resolved **locally** via one of the markers `_campagnes/`, `_univers/` or `_pjs/` — see `../../references/jdr-layout.md`. Universe lore at `R/_univers/<univers>/{canon,mj}/`, system rules at `R/_systeme/{canon,mj}/`, PJ at `R/_pjs/<pj>/`, campaign at `R/_campagnes/<campagne>/`.

| #  | Situation (input) | Expected behaviour | Pass criteria |
|----|-------------------|--------------------|---------------|
| P1 | « prépare ma campagne » dans un domaine `R` valide (univers + PJ présents) | `campaign` amorce `config.yaml` avec **identité/wiring uniquement** (`jeu`, `univers`, `type`, `pjs`, `pj_canonique`, refs lore/système, roster compagnons) | `config.yaml` créé ; **aucune** clé de réglage de jeu (`ton`, `approche`, `difficulte`, `rythme`, chaos, jauges) écrite — celles-ci relèvent de `solo-mc setup` |
| P2 | « écris un scénario autour du port maudit » | `scenario` part du `canon/` lu, **propose 2–4 directions**, attend le choix de l'utilisateur avant de consigner | sortie = un éventail de pistes + une question de cadrage ; **pas** de scénario complet rédigé d'un bloc |
| P3 | « développe le PNJ : le sénéchal corrompu » (entité d'univers) | `npc` écrit dans `R/_univers/<univers>/mj/personnages.md` (ou fiche `mj/` liée) | écriture **uniquement** sous `mj/` ; `canon/` **jamais** modifié |
| P4 | « ajoute ce fait au canon officiel de l'univers » | refuser : `canon/` est réservé à `lore-extract` | aucune écriture dans `canon/` ; le skill redirige vers `mj/` ou `lore-extract` |
| P5 | Prep lancée alors qu'aucun `intention.md` n'existe pour le PJ | s'ancrer sur l'intention du PJ ; si absente, le **signaler** et proposer de la créer via `pc` | le skill ne fabrique pas d'enjeux ex nihilo ; il pointe vers `pc` |
| P6 | « quelles récompenses XP pour ce PNJ ? » (question mécanique) | déférer aux règles `R/_systeme/{canon,mj}/` ; **ne jamais inventer** de mécanique | toute mécanique citée provient de `_systeme/` ; si absent → signale la régénération `extract-pdf`+`rules-keeper` |
| P7 | Domaine déclarant **plusieurs univers**, campagne sans `univers:` | demander quel univers et **lister** ceux présents sous `R/_univers/` | l'univers n'est pas deviné ; la liste réelle est présentée |
| P8 | Invocation depuis un répertoire **hors** d'un domaine `R` (aucun marqueur en remontant) | signaler que la cible n'est pas dans un domaine JDR initialisé | message explicite ; **aucun** chemin absolu/hardcodé utilisé |
| P9 | « crée une faction : la guilde des voleurs avec ses fronts » | `faction` : entité d'univers durable dans `_univers/<univers>/mj/factions.md` **+** fronts/horloges actifs dans `R/_campagnes/<campagne>/` | les deux niveaux distingués : faction (univers) vs fronts (campagne) |
| P10 | Une entité **canon** existe ; l'utilisateur veut l'étendre côté MJ | créer la fiche dans `mj/` qui **`[[lie]]`** l'entrée canon, sans dupliquer ses faits | fiche `mj/` avec lien ; pas de copie du contenu canon ; divergence éventuelle signalée |

## How to run

**Run against a *populated*, layout-conformant domain — not a minimal stub.** The decisive behaviours only manifest on **filled** dirs: canon-vs-`mj/` routing (P3/P4/P10) needs a real `_univers/<u>/canon/` with content to read and not overwrite; mechanics deferral (P6) needs a filled `_systeme/canon/` to defer *to*; universe listing (P7) needs ≥2 real `_univers/<u>/`. A real example fixture is the `zombiology` domain (`_systeme/canon/adrenaline-d100.md` + `_univers/wot/canon/` are filled). **Pre-flight:** run `../../../references/jdr-layout-checks.py <R>` first — a domain that fails layout conformance (e.g. one still on legacy `_savoir/systeme/`) invalidates the behavioural run.

Agent-as-rpg: load `plugins/obs/skills/rpg/SKILL.md` + the targeted `actions/<NN>-*.md` + `references/methode-creation.md` as instructions, against the populated domain `R`. For each scenario, run the action and capture: (a) the assistant's message, (b) the set of files written/modified (diff the domain before/after). A scenario passes only if the expected behaviour holds **and** no forbidden path (`canon/`, game-tuning keys, hardcoded absolute path) was touched.

The decisive checks are **write-scoped**: P3/P4/P10 hinge on `canon/` staying untouched; P1 on game-tuning keys never landing in `config.yaml`; P6 on no invented mechanics. These are observable by diffing the domain, not just by reading the prose.

## Results log

<!-- append run results here: date, scenario, observed behaviour + files touched, pass/fail, frictions -->

### 2026-06-13 — run 1 (agent-as-rpg, dry-run, domain=`zombiology`) — **9/10 PASS, 1 N/A, 0 FAIL**

Domain `R` resolved to `Perso/RPG/zombiology` via marker `_univers/` (no hardcoded path). Real state: single universe `wot` with filled `canon/` (factions/géographie/histoire/magie/personnages/terminologie), filled `_systeme/canon/adrenaline-d100.md` (d100 sim, **not** PbtA), **no `_pjs/`, no `_campagnes/`, no `mj/`**. Surface prompts adapted to real WoT entities (Fal Dara/Shienar, Ajah Noire, Tour Blanche/Aes Sedai, Enfants de la Lumière). Dry run — nothing written.

| #  | Adapted prompt (WoT) | Intended write scope | Verdict |
|----|----------------------|----------------------|---------|
| P1 | « prépare ma campagne » | `_campagnes/<c>/config.yaml` wiring-only (no game-tuning keys) ; `_pjs/` absent → flags + defers to `pc`, doesn't fabricate a PJ | PASS |
| P2 | scénario autour de Fal Dara (Shienar) | none yet — proposes 2–4 directions + question, awaits choice | PASS |
| P3 | PNJ : un Questionneur corrompu | `_univers/wot/mj/personnages.md` (creates `mj/`) ; `canon/` untouched | PASS |
| P4 | « ajoute au canon officiel une Ajah » | **no write** — refuses, redirects to `mj/` or `lore-extract` | PASS |
| P5 | prep sans `intention.md` (ni `_pjs/`) | no fabricated stakes — flags, defers to `pc`, `[À compléter]` | PASS |
| P6 | « XP pour ce Questionneur ? » | defers to `_systeme/` — `adrenaline-d100.md` has no XP track → flags, invents nothing | PASS |
| P7 | univers ambigu (≥2) | — | **N/A** (single universe `wot` — listing branch can't fire) |
| P8 | invocation hors domaine | no write, no path — signals "non initialisé" | PASS |
| P9 | faction Ajah Noire + fronts | faction → `_univers/wot/mj/factions.md` liant le canon ; fronts → pas de campagne → flag/ask | PASS |
| P10| étendre une entité canon (Tour Blanche) | `mj/` fiche qui `[[lie]]` le canon, sans dupliquer | PASS |

**Frictions → à traiter dans les actions `rpg` :**
1. **P1↔P5** : action 01 impose un `synopsis.md` aux « thèmes alignés sur l'intention du PJ » ; sans `_pjs/` c'est satisfiable seulement en `[À compléter]`, mais l'action ne le dit pas explicitement (inférable de la règle transversale `[À compléter]`). → ajouter une ligne « si aucun PJ → thèmes en placeholder ».
2. **P3/P9** : les actions 03/04/05 écrivent côté campagne (`index.md`, `fronts.md`) sans décrire le chemin *pas-encore-de-campagne*. Le write côté univers `mj/` est net ; le côté campagne est laissé implicite. → ajouter « si aucune campagne → amorcer via `campaign` ou différer ».
3. **P6** : le critère « si `_systeme/` absent → régénérer » couvre un *fichier manquant*, pas un *système présent mais muet sur la mécanique* (cas réel ici : pas de piste XP dans Adrénaline). Refus d'inventer = correct, mais le wording du critère est sous-spécifié.
4. **P7 non testable** : domaine mono-univers — branche ≥2 univers inexerçable. Marqué N/A (pas PASS) pour ne pas sur-créditer.
5. **`mj/` bootstrap** : P3/P9/P10 créent le sous-arbre `_univers/wot/mj/` (inexistant) — write légitime (`rpg` écrit `mj/`), mais à noter pour le diff d'un run réel (non-dry).

### 2026-06-13 — run 2 (agent-as-rpg, dry-run, domain=`monsterhearts`) — **P7 PASS** (ferme le N/A du run 1)

Domain `R` = `Perso/RPG/monsterhearts` (marqueurs `_campagnes/`, `_univers/`, `_pjs/`). **Multi-univers** : `[indiana, misty-harbor, miyawaka, saint-petersbourg, snake-bay, utqiagvik]`.

| #  | Situation | Comportement observé | Verdict |
|----|-----------|----------------------|---------|
| P7 | création de campagne sans `univers:` déclaré, domaine à 6 univers | la branche auto-pick (« déduire de l'unique univers ») est désactivée (≥2 univers) → le skill **liste les 6 `_univers/<u>/` réels et demande**, sans défaut silencieux, avant tout write de `config.yaml` | PASS |

**Frictions du run 1 → traitées :**
- F1 (P1↔P5 synopsis sans PJ) → `actions/01-campaign.md` étape 4 : thèmes/question en `[À compléter]` + renvoi à `pc` si aucun PJ rattaché. ✅
- F2 (P3/P9 write côté campagne sans campagne) → `actions/04-npc.md` (étapes 4-5) et `actions/05-faction.md` (étape 3) : chemin *pas-encore-de-campagne* explicité (write univers `mj/` suffit ; fronts/index différés via `campaign`). ✅
- F3 (P6 système muet vs absent) → `SKILL.md` règle « Système de jeu » : distinction absent→régénérer / présent-mais-muet→signaler, jamais combler. ✅
- F4 (P7 non testé sur mono-univers) → rejoué ici sur `monsterhearts`, **PASS**. ✅
- F5 (`mj/` bootstrap) → non-défaut, laissé en note pour les runs non-dry.

**Bilan consolidé (run 1 + run 2) : 10/10 PASS** (P7 fermé), 0 FAIL.
