---
name: code-review
description: Code review — obs plugin, JDR solo hardening session (2026-06-13)
argument-hint: N/A
---

# Code Review for: obs plugin — JDR solo hardening (refactor `_savoir/`, agent fixes, eval suites, checklists, Python checkers)

Revue de la **logique authored** pendant la session du 2026-06-13 sur le plugin `obs`. **Scope** : le `git diff main` est dominé par le renommage mécanique `obsidian → obs` (suppressions trackées) et le contenu réel de `plugins/obs/` est **untracked** (non visible au diff). La revue porte donc sur les fichiers du working tree effectivement écrits/modifiés cette session — specs de skills, prompts d'agents, suites d'eval, références go/no-go, et deux checkers Python — **pas** sur le rename mécanique.

- Statuts: 🟡 Approuvé avec réserves (aucun bloquant ; cohérence + dette de maintenance à traiter)
- Confidence: Élevée sur la logique (tous les comportements vérifiés par runs d'eval dry-run + 2 checkers Python exécutés sur le dépôt réel) ; Moyenne sur l'intégration (références inter-agents non harmonisées, contenu untracked non commité)

---

- [Main expected Changes](#main-expected-changes)
- [Scoring](#scoring)
- [Code Quality Checklist](#code-quality-checklist)
- [Final Review](#final-review)

## Main expected Changes

- [x] Refactor `_savoir/` → `_univers/` · `_systeme/` · `_subsystems/` à travers tous les skills/agents/references obs (+ `obsidian:` → `obs:`)
- [x] Fix « déclenchement des règles » : la boucle de jeu invoque la mécanique du système quand l'action du PJ est incertaine (narrateur + SKILL T13 + `02-scene` + `04-roll`), généralisé système-agnostique (PbtA + d100)
- [x] Fix « basculement de point de vue » parallaxe + clarification de division des subsystems (oracle = parallaxe/muses, narrateur = cinerio/conversation-cards)
- [x] Checklists go/no-go : `dialogue-go-no-go.md` (narrateur) + `rebondissement-go-no-go.md` (oracle), ancrées sur la craft
- [x] Suites d'eval comportementales : rpg, pc, play-loop, rules-triggering, parallaxe-pov, dialogue-quality, rebondissement-quality (+ logs de run)
- [x] Checkers Python : `references/jdr-layout-checks.py` (nouveau), `evals/oracle-data-checks.py` (résolution robuste)

## Scoring

- [🟡] **Standards — incohérence de chemin de référence** `agents/narrateur.md:20,22,179` vs `agents/oracle.md:52` — le narrateur référence ses références via `@references/dialogue-go-no-go.md` (et `@references/response-templates.md`), l'oracle via `${CLAUDE_PLUGIN_ROOT}/skills/solo-mc/references/rebondissement-go-no-go.md`. Deux styles pour le même dossier cible (`skills/solo-mc/references/`). De plus `@references/` depuis un fichier d'`agents/` est ambigu (les références ne vivent pas sous `agents/references/`). → harmoniser sur le chemin explicite `${CLAUDE_PLUGIN_ROOT}/skills/solo-mc/references/<file>` et **vérifier la résolution** à l'invocation de l'agent.
- [🟡] **Architecture — duplication producteur/consommateur** `agents/oracle.md` (§ Parallaxe mastery) ↔ `agents/narrateur.md` (§ Rendering a parallaxe result) — la table Focale→vantage et la discipline de lecture (Impulsions-angles / Signe-à-inventer / anti-linéarité) sont énoncées dans les **deux** fichiers (+ le canon `parallaxe.md`). Alignées aujourd'hui, mais risque de **dérive d'édition** : modifier une copie sans l'autre crée une contradiction silencieuse producteur/consommateur. → désigner une source unique (p.ex. le narrateur pointe la directive de l'oracle sans re-détailler le mapping) ou extraire une référence partagée.
- [🟡] **Architecture — enforcement mono-propriétaire** `agents/narrateur.md` (§ Mechanic triggering) — le déclenchement des règles ne s'exécute que si le **narrateur est invoqué**. Un tour RP traité hors invocation du narrateur est un angle mort. Mitigé par T13 porté aussi dans `SKILL.md`, mais aucun garant n'assure que chaque beat passe par le check. → expliciter dans `01-play`/`02-scene` que tout beat RP joueur DOIT passer par le narrateur (ou par le check T13) avant narration.
- [🟢] **Sécurité** — `oracle-data-checks.py` / `jdr-layout-checks.py` sont **lecture seule**, pas d'exécution, pas d'entrée réseau, pas d'injection ; manipulation de chemins locale et bornée. RAS.
- [🟡] **Code Health (Python)** `evals/oracle-data-checks.py:38` — `read()` fait `read_text(...).splitlines()` sans gestion d'erreur ; `canon_dir()` ne valide que l'index `<nom>.md`, pas les fichiers de données lus ensuite (`cartes-rebondissements.md`, `cartes-standard.md`…). Un canon partiel (index présent, fichier de données manquant) lève un `FileNotFoundError` non capturé au lieu d'un `[FAIL]` propre. → encapsuler chaque `read()` de fichier de données dans un check qui rapporte un FAIL lisible.
- [🟢] **Code Health (Python)** `references/jdr-layout-checks.py` — modèle de sévérité WARN (advisory, n'échoue pas) vs FAIL (malformé) **pertinent** : univers `sources/`-only = pipeline en attente (WARN), univers vide = FAIL. Discrimination validée sur 2 domaines réels (zombiology PASS, monsterhearts WARN+correctifs). RAS.
- [🟢] **Code Health (Python)** `evals/oracle-data-checks.py` — résolution robuste alignée sur la logique de l'agent oracle ; **exécutée sur le dépôt réel → 23/23 PASS**. Bonne parité agent/checker.
- [🟡] **Code Health (checklists)** `references/dialogue-go-no-go.md` GO#6 (révéler par l'action) et GO#11 (effort dosé) — portés **uniquement** par la checklist, pas par les templates du narrateur (`response-templates.md` marque le beat d'action « optionnel »). Si la checklist n'est pas chargée, ces critères régressent les premiers (constaté au run dialogue). → ancrer GO#6/#11 dans `response-templates.md` / la section NPC-management.
- [🟡] **Standards — versioning/CHANGELOG** `plugins/obs/CHANGELOG.md` / `.claude-plugin/plugin.json` — changements comportementaux majeurs (mechanic-triggering, parallaxe POV, division des subsystems, checklists) **non journalisés** (seule l'entrée « nommage de session » a été ajoutée) et version non bumpée. → ajouter les entrées CHANGELOG manquantes + bump SemVer avant publication.
- [🔴-process] **Contenu untracked** — l'ensemble de `plugins/obs/` (y compris tous les nouveaux fichiers de cette session) est **non suivi par git** ; le rename `obsidian → obs` n'est pas finalisé (obsidian supprimé côté tracké, obs non ajouté). → `git add plugins/obs` (et confirmer la suppression de `plugins/obsidian`) pour que le travail soit capturé. *(Process, pas qualité de code — mais bloquant pour la traçabilité.)*

## Code Quality Checklist

### Potentially Unnecessary Elements

- [x] Discipline de lecture parallaxe énoncée 3× (canon + oracle + narrateur) — voir duplication ci-dessus. Pas « inutile » (producteur/consommateur) mais redondance à contrôler.

### Standards Compliance

- [🟡] Naming conventions — slugs `kebab-case`, dirs de travail préfixés `_` : **conformes** (vérifié par grep + linter). Préfixe `obs:` propagé partout (0 `obsidian:` résiduel).
- [🟡] Coding rules — **incohérence de style de référence inter-agents** (voir Scoring). Reste à harmoniser.

### Architecture

- [🟡] Design patterns — division des subsystems propre (oracle=decision/hasard, narrateur=description/dialogue), affirmée dans le rôle de chaque agent. Bémol : duplication producteur/consommateur (drift).
- [🟢] Separation of concerns — oracle interprète/émet une directive, narrateur rend ; checklists séparées par propriétaire. Cohérent.

### Code Health

- [🟢] Tailles de fichiers — specs/agents/evals raisonnables ; aucun fichier monstre.
- [🟡] Gestion d'erreur (Python) — `oracle-data-checks.py` : `read()` non protégé sur fichiers de données (voir Scoring). `jdr-layout-checks.py` : robuste.
- [🟢] Pas de magic numbers non documentés — les comptes (54 cartes, 200, 27, exclusions) sont des invariants de données **assertés** dans le checker, pas des nombres en dur arbitraires.
- [🟡] Messages d'erreur — `canon_dir()` émet un message clair de non-résolution ; les `read()` de données ne dégradent pas proprement.

### Security

- [🟢] SQL injection / XSS / auth / CORS / env — **N/A** (pas de surface : prompts markdown + scripts Python lecture-seule locaux).
- [🟢] Data exposure — les checkers ne lisent que des données de jeu locales ; aucun secret manipulé.

### Error management

- [🟡] Dégradation gracieuse bien spécifiée côté agents (subsystem absent → `[HRP]` + fallback). Côté Python, la résolution échoue proprement (`sys.exit` avec message) mais la lecture de fichiers de données individuels n'est pas protégée.

### Performance

- [🟢] N/A significatif — `resolve_subsystem` parcourt parents × 5 candidats (borné, négligeable). Pas de chemin chaud.

### Frontend specific

- [🟢] N/A — pas d'UI.

### Backend specific

#### Logging

- [🟢] Les checkers impriment un rapport PASS/FAIL/WARN clair ; les suites d'eval tiennent un Results log daté (bonne traçabilité de régression).

## Final Review

- **Score**: 🟡 7.5/10 — logique solide et entièrement vérifiée (runs d'eval dry-run reproduisant défaut→fix, 2 checkers Python exécutés réels), mais dette de cohérence (références inter-agents), de maintenance (duplication producteur/consommateur) et de process (untracked, CHANGELOG/version) à solder.
- **Feedback**:
  - **Forces** : démarche test-d'abord exemplaire (chaque fix précédé d'un run qui reproduit le défaut, suivi d'un run qui confirme — ex. rules-triggering 3/13→13/13, parallaxe 0/8→8/8) ; généralisation système-agnostique validée sur deux classes (PbtA + d100) ; checkers Python alignés sur la logique des agents et exécutés sur données réelles ; séparation honnête logique/données dans les rapports.
  - **Faiblesses** : duplication de spec à risque de dérive ; deux styles de chemin de référence ; deux critères de dialogue (GO#6/#11) non garantis par les templates ; gestion d'erreur Python partielle ; travail non commité et CHANGELOG incomplet.
- **Follow-up Actions**:
  1. Harmoniser les chemins de référence des agents sur `${CLAUDE_PLUGIN_ROOT}/skills/solo-mc/references/<file>` et **vérifier la résolution** (narrateur `@references/...` inclus, préexistant).
  2. Résoudre la duplication parallaxe (source unique ou référence partagée) pour éliminer le risque de dérive producteur/consommateur.
  3. Protéger les `read()` de fichiers de données dans `oracle-data-checks.py` (FAIL propre si un fichier de données manque).
  4. Ancrer GO#6 (révéler par l'action) et GO#11 (effort dosé) dans `response-templates.md`.
  5. Expliciter le garant d'enforcement du mechanic-triggering (tout beat RP → check T13/narrateur).
  6. Compléter le CHANGELOG (mechanic-triggering, parallaxe, checklists, suites), bumper la version, `git add plugins/obs`.
- **Additional Notes**: Aucune des suites d'eval n'écrit dans le domaine (dry-run respecté). Les N/A des suites (C6/L13/L16…) sont des préconditions de domaine de test, pas des défauts de skill. Revue effectuée sur le working tree (contenu obs untracked, invisible au `git diff main`).
