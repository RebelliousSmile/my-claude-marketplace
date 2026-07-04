# Changelog — writing

> Fusion de `doc-writer` (v0.1.0) et `rpg-writer` (v0.10.0). Historique détaillé : `git log -- plugins/writing plugins/doc-writer plugins/rpg-writer`.

## [1.4.0] — 2026-07-04

### Added — couverture behave complète (11 skills)
- Suite `evals/<skill>-scenarios.md` pour `forge`, `toc`, `write`, `tone-finder`, `persona`, `review`, `storyboard`, `upgrade`, `specification`, `user-guide`, `technical-document` — chaque suite reproduit un défaut réel sur fixture peuplée (run pré-fix en FAIL) puis confirme le correctif (run post-fix, 0 FAIL).

### Fixed — gaps réels fermés par la couche de test comportementale
- **`persona`** : schéma YAML de `generate` réaligné en **plat** (`scope`/`weight_class` requis) — l'ancien schéma imbriqué ne fournissait pas la classification que la pondération de consensus de `review:comment` (project ×1.0 / universe ×0.8 / global ×0.5) exige. `train` gagne une **garde de corroboration** (≥3 chapitres non corroborés) avant tout réglage, pour ne jamais faire taire une persona qui détecte un vrai défaut.
- **`review`** : la craft checklist (NOVEL N1-N6 / RULES R1-R5 / SCENARIO S1-S5) citée par `comment` step 5c mais jamais définie est désormais inline et répondable. Le garde-fou de routing de `doctor` (step 11) ne testait que la branche « ≥2 personas plafonnées » — ajout de la branche indépendante « consensus ≤10/20 », alignée sur `review-loop.md`.
- **`forge`** : résolution du `type` de document rendue déterministe (ordre a/b/c) et persistée en frontmatter.
- **`toc`** : ajout d'une passe de confirmation avant d'écraser un `INDEX.md` existant.
- **`write`** : gestion du cas « TOC existe mais pas d'entrée pour le chapitre `<NN>` » ; le `type` en frontmatter devient prioritaire sur les formulations ambiguës du déclencheur.
- **`tone-finder`** : `improve` vérifie désormais le seuil systémique (`SYSTEMIC_CHAPTERS = 3`) avant d'agir ; `output-style.md` gagne des champs `version`/`applies_to`.
- **`upgrade`** : garde sur fichier manquant à l'étape 1 ; garde anti-remplissage-de-quota à l'étape 5.
- **`storyboard`** : mode description directe exige `--chapter <NN>` ; règle anti-invention généralisée à chaque élément (pas seulement aux NPC).
- **`specification`** : nouvelle règle « fidélité à la source » (step 9 de `challenge`) pour éviter la dérive par rapport au contexte élicité.
- **`user-guide`** : dérivation des `tasks` restreinte aux cas où le sujet porte assez de matière ; `review` croise désormais les hypothèses non confirmées de l'outline.
- **`technical-document`** : `verify` exige qu'une citation `file:line`/`file:symbol` corresponde réellement à ce qu'elle prétend vérifier (pas seulement au bon fichier).

## [1.3.0] — 2026-07-04

### Added — `interview`, `tune` + mode document libre
- **`interview`** : équivalent narratif d'`overcode:decompose` — applique la méthode Mikado à un sujet nu (Q&A DFS, subtree Mermaid après chaque itération, YAML seulement après validation) pour faire émerger la progression d'un texte (arguments/beats + prérequis) avant toute rédaction. Artefact **autonome** : écrit dans `interview/<sujet>/`, jamais dans `<brief>/<output>`. `forge`/`toc`/`write` peuvent ensuite s'appuyer sur son graphe, mais `interview` ne rédige jamais lui-même.
- **`tune`** : parcourt un document chunk par chunk (section ou paragraphe) **avec l'utilisateur** — présente le chunk, recueille ses remarques (style/forme/fond), corrige, resoumet, et répète jusqu'à validation avant de passer au suivant. Pilotage entièrement par l'utilisateur : `tune` ne propose jamais de correction de sa propre initiative. Prend n'importe quel fichier `.md`, projet ou non ; `--brief` optionnel, comme simple contexte de fond (voix, lore), jamais comme déclencheur.
- **Mode document libre formalisé** (`references/brief-model.md`) : trois familles de skills désormais explicites — craft narratif sur brief (dépendance structurelle à `<brief>/<output>`), documentation professionnelle autonome (déjà sans brief), et utilitaires document-libre (`interview`, `tune`, `upgrade`) qui n'exigent aucune structure de projet.
- Références croisées ajoutées dans `review`, `upgrade` (clauses « do NOT use ») pour éviter le chevauchement avec `interview`/`tune`.

## [1.2.0] — 2026-07-02

### Added — `forge` rapatrié depuis `obs`
- Le skill `forge` (challenge du concept/overview narratif jusqu'à validation, avant `toc`) rejoint `writing` : c'est une compétence de craft narratif générique (roman, scénario JDR écrit, guide), sans dépendance aux autres skills `obs`. Références internes ajustées (`toc` en bare, `research`/`brief` repointés vers `obs:research`/`obs:brief`).
- `README.md`, `.claude-plugin/plugin.json` et `skills/toc/SKILL.md` mis à jour en conséquence.

## [1.1.1] — 2026-06-13

### Fixed
- **Déclencheur `persona:train` corrigé** (`references/review-loop.md` + `persona/SKILL.md`) : un plafonnement répété d'une persona était routé vers `persona:train`, ce qui revenait à recalibrer (faire taire) une persona qui détectait un **vrai défaut**. Désormais `persona:train` ne se déclenche que sur un plafonnement **non corroboré** (persona *outlier* qui dérive : elle plafonne là où les autres personas + la craft checklist passent). Un plafonnement **corroboré** = défaut réel → `write --feedback` / `tone-finder:improve`. Défaut repéré par la couche de test comportementale (juge adverse).

## [1.1.0] — 2026-06-13

### Added
- **Boucle de review convergente + PLATEAU** (`references/review-loop.md`, source unique partagée par `review`/`write`/`persona`/`tone-finder`) : `comment` → triage → correction (`doctor` / `write --feedback` / révision d'intrant) → re-scoring → comparaison. Arrêt au **PLATEAU** (`Δ < 1.0` entre itérations) ; garde anti-boucle à 5 itérations (`CAP-ITERATIONS`) ; `PLATEAU` jamais déclaré tant que `Δ ≥ 1.0`. Terminal = chapitre figé (export ICML = étape séparée).
- **Artefact d'historique** `<output>/review/chapter-NN-scores.md` écrit par `comment` (une ligne/itération : consensus, `Δ`, verdict, route).
- **Routes de triage formalisées** : pattern systémique récurrent sur ≥3 chapitres → `tone-finder:improve` (output-style `v+1`) ; même persona plafonnée sur ≥3 chapitres → `persona:train`.

### Changed
- **Contrat brief resserré** (`references/brief-model.md`) : `<brief>/personas/` et `<brief>/output-styles/` exigent désormais **≥3 entrées distinctes** chacun (triangulation du scoring de `comment`).
- `persona:train` et `tone-finder:improve` documentent leur **déclencheur** (seuil ≥3 chapitres) via `review-loop.md`.

## [1.0.0] — 2026-06-13

### Added (fusion doc-writer + rpg-writer)
- **Documentation professionnelle** (ex-`doc-writer`) : `specification`, `technical-document`, `user-guide`, plus les références partagées `references/doc-principles.md` et `references/export-icml.md`.
- **Craft narratif — production à partir d'un brief** (ex-`rpg-writer`) : `toc`, `write`, `tone-finder`, `persona`, `review`, `storyboard`, `upgrade`.

### Changed
- **BREAKING** — les invocations passent de `/doc-writer:*` et `/rpg-writer:*` à `/writing:*`.
- **Séparation des responsabilités** : `writing` produit à partir d'un brief ; l'assemblage des intrants est délégué à `obsidian`. Refs cross-plugin namespacées (`obsidian:forge`, `obsidian:brief`, …).
- **BREAKING — nouveau modèle de travail `brief → output`** (`references/brief-model.md`). Tous les skills narratifs (`toc`, `write`, `review`, `persona`, `tone-finder`, `storyboard`, `upgrade`) abandonnent `bank.yml` et tout couplage au vault JDR (`<univers-root>`, `<systeme-root>`, `rules-files`, `.toc/`, `.wip/`, `chapitres/`). Désormais :
  - Entrée lecture seule `<brief>/` : `summary.md` (autosuffisant), `personas/`, `output-styles/`.
  - Sortie `<output>/` : `toc/INDEX.md` + `toc/chapter-NN.md`, `chapters/chapter-NN.md`, `review/chapter-NN-<persona>.md`, `storyboard/chapter-NN.md`.
  - Invocation : `<brief>` positionnel + `--out <output>`.
  - Écriture courte supportée : 0 TOC, 1 seul chapitre.

### Moved out (vers `obsidian`)
- Assemblage des intrants : `forge` (concept), `research` (données), `brief` (construit `_brief/`).
- Skills spécifiquement JDR : `lore-extract`, `rules-keeper`, `extract-pdf`.
- Agents JDR : `claude-code-optimizer-jdr`, `documentation-architect-jdr` (depuis supprimés en obsidian v0.13.0).

### Removed (de writing)
- `tabula-rasa` (obsolète — système de reset projet abandonné).

### Removed
- Plugins `doc-writer` et `rpg-writer` retirés du marketplace (contenu absorbé par `writing` et `obsidian`, sans alias de transition).
