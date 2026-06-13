# Solo-MC — Play-Loop Behavioural Test Scenarios

Behavioural tests for the `solo-mc` **skill loop itself** (`plugins/obs/skills/solo-mc/SKILL.md`, transversal rules T0–T14) — distinct from the two agents it drives (`oracle`, `narrateur`), which have their own scenario files (`oracle-scenarios.md`, `narrateur-scenarios.md`). These observe the **session-management behaviour**: domain resolution, state read/write discipline, continuous logging, fact routing, and companion substitution.

Run via an agent that loads `SKILL.md` + the targeted `actions/*.md`, against a real domain `R` with an active campaign. Pass = the transversal rule is honoured AND no forbidden write/invention occurs.

Game domain `R` resolved **locally** via l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/` — see `../../references/jdr-layout.md`. Mechanical state at `R/_campagnes/<c>/.session-state.yaml`; dated narrative logs at `R/<AAAA>/<MM>/<campagne>/`; system rules at `R/_systeme/{canon,mj}/`; subsystems at `R/_subsystems/<nom>/{canon,mj}/`.

| #   | Situation (input) | Rule | Expected behaviour | Pass criteria |
|-----|-------------------|------|--------------------|---------------|
| L1  | Action lancée depuis un sous-dossier de campagne | T0 | remonter au premier dossier contenant `_campagnes/`, `_univers/` ou `_pjs/` = `R` | `R` résolu sans chemin absolu ; cohérent quel que soit le sous-dossier de départ |
| L2  | Invocation hors domaine (aucun marqueur en remontant) | T0 | signaler que la cible n'est pas un domaine JDR initialisé ; proposer d'initialiser | message explicite ; aucune écriture |
| L3  | `play`/`play-resume` sans nom de campagne | T1 | détecter la campagne active via `R/.current-session` **avant** de demander | la campagne active est utilisée ; pas de question superflue |
| L4  | Une action de jeu lit l'état mécanique en cours de session | T3 | lire `R/_campagnes/<c>/.session-state.yaml` ; **n'écrire** l'état qu'au `play-end` | aucune écriture de `.session-state.yaml` hors `play-end` |
| L5  | Réponse en session active (`play`/`play-resume`) | T10 | **avant de répondre**, archiver l'échange précédent dans le log daté `R/<AAAA>/<MM>/<campagne>/session-<AAAA-MM-JJ>-<N>.md` | log lu → concaténé → écrit, **puis** réponse ; log narratif distinct de `.session-state.yaml` |
| L6  | Détail trivial décidé (couleur de cheveux d'un figurant) | T13 | rester dans le **log de session seul** ; aucune promotion | rien écrit dans un `mj/` ; pas d'oracle invoqué |
| L7  | Nouveau PNJ nommé, portée **campagne** | T13 | promouvoir dans `R/_campagnes/<c>/mj/` | écriture dans le `mj/` de campagne ; pas dans l'univers |
| L8  | Fait de **portée mondiale** réutilisable entre campagnes | T13 | promouvoir dans `R/_univers/<univers>/mj/` | écriture dans le `mj/` d'univers ; pas dans la campagne |
| L9  | Une **règle de conduite** de jeu solo établie en partie | T13 | écrire dans `R/_systeme/mj/solo.md` (règles seulement) | `solo.md` reçoit une règle ; **aucun** fait de fiction n'y atterrit |
| L10 | Issue à enjeu (conséquence joueur, embranchement) | T13 | **DOIT** passer par l'oracle (muses-et-oracles / parallaxe) ; jamais narrer l'issue librement | un tirage est invoqué ; pas de résultat scénarisé sans test |
| L11 | Question de règle posée en pleine scène (`[HRP] …`) | T9 | séparer HRP/RP : répondre en `[HRP]` d'abord, puis reprendre `[RP]` | réponse mécanique isolée ; pas de règle dans le `[RP]` |
| L12 | Fait fictionnel mêlé à la connaissance d'un PNJ | T9 | **fixer d'abord le fait dans le monde** (si durable → `R/_univers/<u>/mj/`), puis séparer ce que le perso sait/ignore | le fait du monde est posé avant la couche perso ; jamais l'inverse |
| L13 | Une scène s'ouvre là où seul le compagnon est présent | T14 | substitution : charger le roster, geler la position du PJ (`active_character`, `pc_frozen_at`), jouer **une** scène compagnon, puis rendre la main | gel/dégel dans `.session-state.yaml` ; fiche compagnon lue depuis `R/_pjs/<pj>/compagnons/` |
| L14 | Substitution demandée mais fiche compagnon absente | T14 | dégradation gracieuse : `[HRP]` indiquant la fiche manquante + commande `pc companion create` | message de dégradation explicite ; pas de fiche inventée |
| L15 | Numérotation/datation d'une nouvelle session | Pitfall | balayer **tous** les dossiers `R/<AAAA>/<MM>/<campagne>/` ; ne pas se fier à `config.yaml › session_courante` | `<N>` calculé depuis le système de fichiers ; date système vérifiée |
| L16 | Session lancée alors que `R/_systeme/canon/` est absent | T7 | exiger la régénération (`extract-pdf` + `rules-keeper`) avant de jouer | mécaniques/oracle de base indisponibles signalés ; subsystems/univers/house-rules durables préservés |

## How to run

**Run against a *populated*, layout-conformant domain — not a minimal stub.** Fact routing by scope (L7/L8/L9) only means something against a real `_campagnes/<c>/mj/`, `_univers/<u>/mj/` and `_systeme/mj/`; the no-play-without-canon gate (L16) needs a filled `_systeme/canon/` to begin with; world-fact-first (L12) needs filled `_univers/<u>/`. A real example fixture is the `zombiology` domain (filled `_systeme/canon/` + `_univers/wot/canon/`), augmented with an active `_campagnes/<c>/` (a `config.yaml`, a `.session-state.yaml`, a `mj/`) and — for L13/L14 — a `_pjs/<pj>/compagnons/`. **Pre-flight:** run `../../../references/jdr-layout-checks.py <R>` first — a domain failing layout conformance (e.g. legacy `_savoir/systeme/`) invalidates the run.

Agent-as-solo-mc: load `plugins/obs/skills/solo-mc/SKILL.md` + the targeted `actions/<NN>-*.md`, against the populated domain `R`. For each scenario, run the loop and capture (a) the assistant message, (b) the domain diff (which `mj/`, log, or state file changed). Pass requires the rule **and** the write-scope invariant.

Decisive write-scoped checks: L4 (state written only at `play-end`), L5 (log written *before* the reply), L6–L9 (fact lands in the right `mj/` by scope, or nowhere), L10 (no free narration of stakes), L13 (freeze/thaw recorded), L16 (no play without regenerated canon).

## Results log

<!-- append run results here: date, scenario, observed behaviour + files touched, pass/fail, frictions -->

### 2026-06-13 — run 1 (agent-as-solo-mc play-loop, dry-run, domain=`monsterhearts`, campagne=`les-fantomes-de-snake-high`) — **11/16 PASS, 2 N/A, 1 FAIL**

Campagne : `config.yaml` (jeu=monsterhearts, univers=snake-bay, PJ=thomas), `pj/`, `scenes/`, `fronts.md`. **Absents** (conditions réelles 1er lancement) : `.session-state.yaml`, `mj/` campagne, `.current-session`, `_subsystems/`. `_systeme/canon/` rempli, `_univers/snake-bay/{canon,mj}` présents. Dry run — rien écrit.

| #   | Règle | Verdict | Note |
|-----|-------|---------|------|
| L1  | T0 résolution `R` | PASS | multi-marqueur, relatif, stable depuis tout sous-dossier |
| L2  | T0 hors domaine | PASS | signale « non initialisé », pas de write |
| L3  | T1 campagne active | PASS+friction | `.current-session` absent **et 2 campagnes** → doit demander (auto-pick = FAIL) |
| L4  | T3 état mécanique | PASS | `.session-state.yaml` absent → lecture gracieuse ; écrit seulement au `play-end` |
| L5  | T10 log avant réponse | PASS+friction | ordre correct ; **mais** le nom de log créé ne matche pas l'existant (voir L15) |
| L6  | T13 trivial | PASS | log seul, pas de `mj/`, pas d'oracle |
| L7  | T13 fait campagne | PASS | `_campagnes/<c>/mj/` (créé au 1er write) |
| L8  | T13 fait monde | PASS | `_univers/snake-bay/mj/` |
| L9  | T13 règle solo | PASS | `_systeme/mj/solo.md` (créé au 1er write), règles seulement |
| L10 | T13 enjeu → oracle | PASS+friction | routage correct ; **mais** `_subsystems/` absent et **aucun chemin de dégradation défini** au niveau skill |
| L11 | T9 HRP/RP | PASS | séparation, règles lues dans `_systeme/canon/` |
| L12 | T9 fait avant perso | PASS | fait du monde posé d'abord (`_univers/snake-bay/mj/`) |
| L13 | T14 substitution | **N/A** | pas de `compagnons:` ni `_pjs/thomas/compagnons/` → bascule en L14, write freeze/thaw non exerçable |
| L14 | T14 fiche absente | PASS | message `[HRP]` de dégradation exact, aucune fabrication |
| L15 | datation/numérotation | **FAIL** | méthodo correcte (scan FS, ignore `config.yaml`) **mais** glob `<campagne>-session-*.md` matche **0** fichier réel (`session-3.md`, `session-2026-06-01-03.md`…) → `<N>` repart à 1, recap « Précédemment… » vide |
| L16 | T7 gate canon absent | **N/A** | `_systeme/canon/` présent → gate non déclenchable (canon partiel Vol-1 noté hors-scope) |

**Point dur — mismatch de nommage des sessions (FAIL L15, impacte aussi L5 et pc C2) :** les skills écrivent/scannent `<campagne|pj>-session-<AAAA-MM-JJ>-<N>.md`, mais le domaine réel contient des `session-*.md` nus (`session-3.md`, `session-4.md`, `session-2026-06-01-03.md`, `session-2025-12-03.md`). Le scan matche 0 → renumérotation à 1 et recap vide. Le préfixe slug est **redondant** (le dossier parent est déjà `<campagne>/` ou `<pj>/`). À trancher : standardiser sur `session-<date>-<N>.md` nu (aligner skills + layout sur l'existant) **ou** rendre le glob tolérant + renommer les fichiers du domaine.

> **Résolu 2026-06-13** — décision : **slug nu**. Le nommage `session-<AAAA-MM-JJ>-<N>.md` (sans préfixe) et le scan `session-*.md` (tolère les `session-N.md` legacy) sont désormais la convention dans `solo-mc` (`SKILL.md` T10/pitfall, `01-play`, `11-play-resume`), `pc` (`SKILL.md` log-session/reorganize/show), `jdr-layout.md` (`<session-root>`) et les critères d'eval (L5, C2). Aucun fichier réel renommé (le glob nu matche l'existant).

### 2026-06-13 — run 2 (L15 seul, dry-run, domain=`monsterhearts`) — **L15 PASS** (confirme le fix)

Glob `session-*.md` sur `R/<YYYY>/<MM>/les-fantomes-de-snake-high/` → **6 fichiers matchés** (`session-2025-12-03.md`, `session-2025-12-03-prep-02.md`, `session-2026-05-31.md`, `session-3.md`, `session-4.md`, `session-2026-06-01-03.md`). `<N>`=5 (depuis `session-4.md`), nouveau fichier `session-2026-06-13-5.md`, recap non-vide. `config.yaml › session_courante` ignoré. Critères de L15 satisfaits.

**Nouvelle friction (non bloquante, sous-spécification) :** le fix résout le *matching*, mais la règle d'**extraction de `<N>`** n'est pas explicitée. Avec des formes mêlées dans un même dossier — compteur nu (`session-3.md`→3), daté+suffixe (`session-2026-06-01-03.md`→N=03), daté sans suffixe (`session-2025-12-03.md`, le `03` est le jour), variante `-prep-` — un parse naïf « dernier entier » peut mal lire le jour `03` comme `<N>`, et un « glob-and-count » donnerait 7 au lieu de 5. **Recommandation** : pin la règle — `<N>` = max(index lu dans le slot `-<N>` des fichiers datés **et** compteur des `session-<N>.md` nus) + 1 ; exclure `-prep-`/variantes non-session de la numérotation.

### 2026-06-13 — run 3 (regression, post move-triggering fix, dry-run, domain=`monsterhearts`) — **11/16 PASS, 2 N/A, 0 FAIL, 0 régression**

Vérifie que le fix move-triggering (T13 Étape 1/3, `02-scene`, `04-roll`, `narrateur`) n'a rien cassé du play-loop. **L5** PASS+friction → **PASS net** (nommage nu aligné). **L15** déjà confirmé PASS (run 2). Aucun PASS antérieur régressé. **L10 explicitement vérifié non-régressé** : l'edit T13 dit qu'un enjeu *couvert par une move* va à la move (pas l'oracle), mais L10 teste un enjeu *sans move applicable* (hasard pur/décision du monde) — la branche « Sinon → oracle » est préservée. L13/L16 toujours N/A. Friction persistante L10 : `_subsystems/` absent, dégradation non spécifiée au niveau skill (pré-existant, hors scope du fix).

### 2026-06-13 — run 4 (régression post-généralisation système-agnostique, dry-run, domain=`monsterhearts`) — **11/16 PASS, 2 N/A, 0 FAIL, 0 régression**

Vérifie que la généralisation de T13 Étape 1 (« déclencheur de move » → « action du PJ incertaine ») + pitfall + `02-scene`/`04-roll` n'a rien cassé du play-loop. **L6 non avalé** : l'Étape 1 ne se déclenche que sur une issue *incertaine ET à enjeu* — un détail trivial reste en Étape 3 « log seul ». **L10 préservé** : la branche oracle pour les enjeux *sans résolution système* survit (SKILL T13 Étape 3, `02-scene:29`, `04-roll` ne capte que le chemin système). Tous les autres PASS conservés ; L13/L16 N/A ; L15 PASS (glob nu). Identique à la baseline.

**Autres frictions :** L3 (`.current-session` absent + multi-campagne → toujours demander) ; L10 (`_subsystems/` absent, dégradation non spécifiée au niveau skill — seule T14 l'a explicitement) ; configs domaine en chemins `pjs/`/`univers/`/`systeme/` sans `_`.
