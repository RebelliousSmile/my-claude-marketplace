# 06 - review

Vérifie la cohérence et l'état de jouabilité de la prep avant de jouer avec `solo-mc`.

## Inputs

- `campagne` (requis) — nom de la campagne.

## Process

Lire la prep de campagne (`synopsis.md`, `scenarios/`, `prep/`, `fronts.md`, `config.yaml`), les données d'univers liées (`JDR/univers/<univers>/.docs/` : `personnages.md`, `factions.md`, `geographie.md`) et l'`intention.md` du PJ, puis vérifier — signaler par sévérité, corriger sur demande :

1. **Service du PJ** (bloquant) — au moins un scénario/accroche touche la ligne rouge ou la question viscérale du PJ ; sinon la prep ne sert pas le joueur.
2. **Fronts jouables** (bloquant) — chaque faction active a au moins une horloge chiffrée (état + déclencheur + échéance) dans `fronts.md`, que `solo-mc` peut faire avancer.
3. **Scénarios actionnables** (warning) — chaque scénario a des amorces de scènes ET des issues possibles (pas un script figé, pas une simple idée).
4. **PNJ jouables** (warning) — chaque PNJ d'univers en jeu a motivation + secret/levier + une voix.
5. **Liens & arborescence univers** (warning) — les `[[liens]]` scénario→univers (PNJ, factions, lieux) résolvent ; aucune donnée d'univers dupliquée côté campagne (une info dans un seul fichier) ; `index.md` à jour.
6. **Conformité config** (note) — ton/rythme/chaos de la prep cohérents avec `config.yaml`.
7. **Parallaxe** (bloquant) — aucune mécanique Parallaxe inventée hors de la référence.

## Outputs

Un rapport par sévérité (bloquant / warning / note) avec, pour chaque constat, le fichier concerné et le correctif. Verdict : PRÊT À JOUER / À COMPLÉTER / INCOHÉRENT (INCOHÉRENT ou À COMPLÉTER si ≥ 1 bloquant).

## Test

Chaque constat cite un fichier et un correctif ; le verdict est « prêt à jouer » seulement si aucun bloquant ne subsiste (service du PJ, fronts chiffrés, Parallaxe conforme).
