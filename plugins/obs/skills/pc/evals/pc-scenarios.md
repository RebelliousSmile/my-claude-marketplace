# PC — Behavioural Test Scenarios

Behavioural tests for the `pc` skill (`plugins/obs/skills/pc/SKILL.md`) — player-character management. `scenarios.json` only declares the trigger→action routing; these observe the **rendered behaviour**: which files land where, what stays out of `_pjs/`, and what the skill refuses to invent.

Run via an agent that loads `SKILL.md` + the targeted `actions/*.md`, against a real domain `R` with a `_pjs/<pj>/` and a `_systeme/`. Pass = expected behaviour observed AND no forbidden write/invention.

Game domain `R` resolved **locally** via l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/` — see `../../references/jdr-layout.md`. PJ durable state at `R/_pjs/<pj>/`; dated session logs at `R/<AAAA>/<MM>/<pj>/`; system rules at `R/_systeme/{canon,mj}/`.

| #   | Situation (input) | Expected behaviour | Pass criteria |
|-----|-------------------|--------------------|---------------|
| C1  | « nouveau PJ Kael » | `new` crée `pj.md`, `fiche_technique.md`, `intention.md`, `etat-jeu.md`, `backlog.md` sous `R/_pjs/kael/` | les 5 fichiers présents ; **aucun `journal.md`** créé |
| C2  | « fin de session, mets à jour Kael » (session 5, déjà 4 sessions réparties sur plusieurs mois) | `log-session` crée un **fichier daté** `R/<AAAA>/<MM>/kael/session-<AAAA-MM-JJ>-5.md` | `<N>=5` déterminé en balayant **tous** les dossiers année/mois (global, pas par mois) ; `etat-jeu.md` mis à jour |
| C3  | `reorganize` sur un PJ possédant un vieux `journal.md` agrégé | éclater le `journal.md` en fichiers datés (un par entrée) sous `R/<AAAA>/<MM>/<pj>/`, puis archiver l'original | plus de `journal.md` actif ; entrées éclatées datées ; source archivée sous `.archive/`, jamais supprimée |
| C4  | « ajoute le compagnon Mira » alors que Mira a déjà une fiche canonique (prétiré d'univers) | `companion` propose le mode **par référence** : fiche wrapper avec `ref:`, sans dupliquer les mécaniques | fiche pointe `_univers/<u>/pretires/mira.md` via `ref:` ; aucune mécanique recopiée |
| C5  | Création d'un compagnon **sans campagne active** | enregistrer dans le **roster PJ-level** `R/_pjs/<pj>/compagnons/_roster.yaml` | roster PJ-level créé/complété ; pas d'exigence de campagne active |
| C6  | Compagnon créé **avec** campagne active | le `config.yaml` de campagne **référence** le roster (`compagnons: { roster: _pjs/<pj>/compagnons/_roster.yaml }`) ou recopie les entrées `actif: true` | la campagne pointe vers le roster PJ-level ; pas de redéfinition divergente |
| C7  | « construis le background » sans texte de départ | `background` : questionnaire **guidé par le genre** du jeu, par **lots de 2–4 questions**, 2–3 pistes proposées par question | questions par genre (table `references/genres-et-background.md`) ; allers-retours, pas un bloc unique |
| C8  | `fill` invoqué mais l'utilisateur n'a aucun texte | basculer sur `background` plutôt que remplir à vide | le skill redirige vers `background` ; ne fabrique pas de contenu |
| C9  | Toute action citant une stat/tag/jet alors que `R/_systeme/canon/` est absent | **ne rien inventer** ; signaler la régénération (`extract-pdf` puis `rules-keeper`) | aucune mécanique inventée ; message de régénération ; lore `_univers/` et house rules `_systeme/mj/` non bloqués |
| C10 | `show` sans argument, avec session active | résoudre le PJ via `.current-session`, charger l'état par ordre de priorité (`.session-state.yaml` > `config.yaml` > `fiche_technique.md`/`pj.md` > dernier log daté) | fiche affichée depuis la source prioritaire disponible ; pas de question si `.current-session` suffit |
| C11 | Contenu de prep de campagne (scénario, PNJ) collé dans `reorganize` | identifier ce qui **n'appartient pas** à `_pjs/` et rediriger (campagne → `rpg` ; univers → `lore-extract`/`rpg` ; jeu direct → `solo-mc`) | le hors-périmètre est signalé et routé, pas écrit dans `_pjs/` |
| C12 | `log-session` avec dossier PJ aux noms **mêlés** sur plusieurs `AAAA/MM` (compteurs nus `session-3.md`/`session-4.md`, datés `session-2026-06-01-03.md`, `session-2025-12-03.md`, `-prep-`) | `<N>` calculé par l'**ordre canonique** (`jdr-layout.md`) : extraction par forme de suffixe, exclusion `-prep-`, `max+1` ; jamais le jour `03`/`31` lu comme `<N>` | `<N>`=5 (max=4 depuis `session-4.md`) → nouveau `session-…-5.md` ; `<N>` confondu avec un jour ou `-prep-` compté = FAIL |
| C13 | `show` chargeant le « dernier log daté » (priorité 4), **même dossier mêlé** que C12 | « dernier » = fichier de `<N>` **max** par l'ordre canonique (la **même** clé que `solo-mc` play/play-resume), pas « most recent year/month, premier trouvé » | log lu = `session-4.md` (N=4) ; ancrage sur une séance antérieure (`session-3`/`session-2026-06-01-03`) = FAIL |
| C14 | `sessions <pj>` pour un PJ présent dans **plusieurs campagnes** | découvrir les campagnes du PJ via `_campagnes/*/config.yaml` (`pjs`/`pj_campagne`), agréger les séances de **chaque** axe campagne + l'axe PJ, **read-only**, groupé par source, ordonné par l'ordre canonique | un bloc par campagne du PJ + un bloc axe PJ ; `<N>` **indépendant par campagne** (pas de séquence agrégée) ; `-prep-` non compté ; **aucune écriture** ; oublier une campagne du PJ ou fusionner les `<N>` = FAIL |

## How to run

**Run against a *populated*, layout-conformant domain — not a minimal stub.** Mechanics deferral (C9) only manifests against a **filled** `_systeme/canon/`; companion-by-reference (C4) needs a real canonical sheet under `_univers/<u>/pretires/` to point at. A real example fixture is the `zombiology` domain (filled `_systeme/canon/` + `_univers/wot/canon/`); for C2 it must carry prior **dated** sessions across ≥2 year/month folders. **Pre-flight:** run `../../../references/jdr-layout-checks.py <R>` first — a domain failing layout conformance (e.g. legacy `_savoir/systeme/`) invalidates the run.

Agent-as-pc: load `plugins/obs/skills/pc/SKILL.md` + the targeted `actions/<NN>-*.md` (+ `references/genres-et-background.md` for C7), against the populated domain `R`. For each scenario, run the action and capture (a) the assistant message, (b) the domain diff. Pass requires the expected behaviour **and** the path/anti-invention invariant.

Decisive write-scoped checks: C1 (no `journal.md`), C2 (global `<N>` + dated path), C3 (journal exploded + archived not deleted), C4 (no mechanics duplicated), C9 (no invented mechanics), C11 (nothing out-of-scope written into `_pjs/`).

## Results log

<!-- append run results here: date, scenario, observed behaviour + files touched, pass/fail, frictions -->

### 2026-06-13 — run 1 (agent-as-pc, dry-run, domain=`monsterhearts`, sujet=`nastya-lebedeva`) — **8/11 PASS, 2 N/A, 0 FAIL**

Sujet `_pjs/nastya-lebedeva/` : `intention.md`, `compagnons/_roster.yaml` + 5 fiches, **`journal.md` legacy**, sessions datées campagne-axe. `_systeme/canon/` rempli (PbtA). Dry run — rien écrit.

| #   | Sujet/input | Verdict | Note |
|-----|-------------|---------|------|
| C1  | `new` Kael | PASS | 5 fichiers, **pas de `journal.md`** (conforme §new) |
| C2  | `log-session` (session 5) | PASS (logique) | scan global `<N>` correct, **mais** prémisse non reproductible — voir friction naming |
| C3  | `reorganize` journal legacy | PASS | `journal.md` éclaté en fichier daté + archivé `.archive/`, jamais supprimé |
| C4  | companion Marina (= prétiré) | PASS | déjà implémenté par référence (`ref: univers/saint-petersbourg/pretires/marina-volkova.md`), pas de duplication |
| C5  | roster sans campagne | PASS | `_roster.yaml` au niveau PJ, append-non-duplicate |
| C6  | roster référencé par campagne | **N/A** | seule campagne active = `thomas`, pas `nastya` → précondition absente |
| C7  | `background` | PASS | genre Monsterhearts → famille « Contemporain + Fantastique », questions par lots de 2–4 |
| C8  | `fill` sans texte → `background` | PASS | redirige, n'invente pas |
| C9  | mécanique, `_systeme/canon/` absent | **N/A** | canon **présent** → branche « régénérer » non déclenchable (anti-invention OK) |
| C10 | `show` sans `.current-session` | PASS | marqueur absent → prompt ; ordre de priorité respecté |
| C11 | prep de campagne dans `reorganize` | PASS | hors-périmètre routé hors `_pjs/` |

**Frictions :** voir le point dur **naming de session** (C2) consigné dans `play-scenarios.md` run 1 (défaut partagé pc/solo-mc). Autres : `pc` n'a pas de `actions/*.md` (specs inline dans SKILL.md) ; les `config.yaml` du domaine référencent `pjs/`/`univers/`/`systeme/` **sans** préfixe `_` (divergence avec la spec skill) ; `.current-session` absent, le domaine utilise `config.yaml › session_courante:`.

### 2026-06-13 — run 2 (regression, post-fix naming, dry-run, domain=`monsterhearts`) — **9/11 PASS, 2 N/A, 0 FAIL, 0 régression**

Après le fix de nommage (`session-*.md` nu). **C2 renforcé** : conditional-PASS (run 1, glob préfixé matchait 0) → **PASS net** (le glob nu matche les fichiers réels ; la logique de scan global `<N>` est correcte — l'axe campagne-vs-PJ des sessions reste une propriété du domaine, orthogonale au fix). Tous les autres PASS conservés (C1, C3, C4, C5, C7, C8, C10, C11) ; C6/C9 toujours N/A (préconditions inchangées). Le fix move-triggering de solo-mc ne touche pas `pc`. **Aucune régression.**

### 2026-06-14 — run 3 (C12/C13, **reproduce-then-confirm en une passe**, dry-run, domain=`monsterhearts`) — **2/2 PASS (spec-logic), 0 FAIL**

Propagation de la **règle canonique d'ordre des séances** (`jdr-layout.md › Ordre canonique des séances`, posée pour le fix solo-mc L17/L18) côté `pc` : `04-log-session` (step 1 : extraction de `<N>` par forme de suffixe, exclusion `-prep-`, `max+1`), `05-show` (priorité 4 : dernier log = `<N>` max, **même** clé que solo-mc), et nouvelle transversal rule « Session dating / numbering » dans `pc/SKILL.md`.

| #   | Pré-fix | Post-fix | Note (instruction citée) |
|-----|---------|----------|--------------------------|
| C12 | **aurait FAIL** | **PASS** (logique) | `04-log-session` step 1 + `jdr-layout` 1-4 : exclut `-prep-`, jour `03`/`31` jamais lu comme `<N>`, `session-2026-06-01-03`→N=3, max=4 → `<N>`=5. Pré-fix (« scan, `<N>` global » sans règle d'extraction) → un modèle pouvait compter `-prep-` ou lire le jour comme `<N>`. |
| C13 | **aurait FAIL** | **PASS** (logique) | `05-show` priorité 4 : dernier log = `<N>` max = `session-4.md`, rejette « most recent year/month, premier trouvé » ; clé partagée solo-mc (`jdr-layout` note de clôture). Pré-fix (« most recent year/month » sans départage intra-mois) → choix lexicographique/premier-trouvé sur 3 fichiers du même mois. |

**Data limit (explicite) :** aucun `session-*.md` sur l'axe PJ (`R/<AAAA>/<MM>/<pj>/`) dans le domaine réel — toutes les séances vivent sur l'axe campagne. Verdicts rendus comme **spec-logic** sur le désordre équivalent de l'axe campagne (l'algorithme d'ordre est axe-agnostique). Pour une confirmation comportementale réelle, seeder le même jeu de noms mêlés sous un `R/<AAAA>/<MM>/<pj>/`. **Cohérence inter-skills vérifiée :** `pc` (log-session/show/SKILL) et `solo-mc` (play/play-resume/SKILL) pointent désormais la **même** procédure canonique — pas de dérive.
**Tally :** 2/2 PASS (spec-logic) — propagation confirmée.

### 2026-06-14 — run 4 (C14, **nouvelle action `sessions`**, dry-run, domain=`monsterhearts`) — **1/1 PASS (spec-logic)**

Nouvelle action read-only `08-sessions.md` (liste toutes les séances d'un PJ, agrégées par campagne + axe PJ), branchée dans `pc/SKILL.md` (table 08 + router) et `scenarios.json`. Découverte des campagnes via `_campagnes/*/config.yaml`.

| #   | Verdict | Note (instruction citée) |
|-----|---------|--------------------------|
| C14 | **PASS** (spec-logic) | `08-sessions` 1-5 + Test : découverte des campagnes du PJ (`pjs`/`pj_campagne`), agrégation par axe campagne + axe PJ, `<N>` **indépendant par campagne** (`jdr-layout` L38), `-prep-` exclu, **read-only** (4 assertions : titre, Outputs, step 5, Test). |

**Frictions → corrigées dans la foulée :**
- **Match de découverte fragile** (configs réels en `pjs/`/`campagnes/` **sans** `_`, ma spec matchait `_pjs/`) → step 2 rendu **tolérant** (slug nu, avec/sans préfixe `_`, normalisation avant comparaison).
- **Campagne découverte sans séance** (ex. `l-oeil-blanc` : 0 fichier) → step 5 : bloc affiché avec ligne explicite « aucune séance », jamais silencieusement omis.

**Data limits (non bloquants) :** aucun PJ réel n'est dans 2+ campagnes (clause multi-campagnes jugée spec-logic) ; axe PJ vide dans le domaine (agrégation axe-PJ jugée spec-logic). L'algorithme est axe-agnostique → l'axe campagne (réel, désordonné) est un substitut fidèle.
**Tally :** 1/1 PASS (spec-logic) — action read-only confirmée, 0 écriture.
