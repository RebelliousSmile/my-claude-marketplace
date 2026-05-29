# 06 - review

Vérifie la cohérence et l'état de jouabilité de la prep avant de jouer avec `solo-mc`.

## Inputs

- `campagne` (requis) — nom de la campagne.

## Process

Lire `synopsis.md`, `scenarios/`, `pnjs/`, `factions/`, `prep/`, `config.yaml` et l'`intention.md` du PJ, puis vérifier — signaler par sévérité, corriger sur demande :

1. **Service du PJ** (bloquant) — au moins un scénario/accroche touche la ligne rouge ou la question viscérale du PJ ; sinon la prep ne sert pas le joueur.
2. **Fronts jouables** (bloquant) — chaque faction active a au moins une horloge chiffrée (état + déclencheur + échéance) que `solo-mc` peut faire avancer.
3. **Scénarios actionnables** (warning) — chaque scénario a des amorces de scènes ET des issues possibles (pas un script figé, pas une simple idée).
4. **PNJ jouables** (warning) — chaque PNJ actif a motivation + secret/levier + une voix.
5. **Liens** (warning) — les `[[liens]]` entre scénarios, PNJ et factions résolvent ; `index.md` est à jour.
6. **Conformité config** (note) — ton/rythme/chaos de la prep cohérents avec `config.yaml`.
7. **J&T** (bloquant) — aucune mécanique J&T inventée hors de la référence.

## Outputs

Un rapport par sévérité (bloquant / warning / note) avec, pour chaque constat, le fichier concerné et le correctif. Verdict : PRÊT À JOUER / À COMPLÉTER / INCOHÉRENT (INCOHÉRENT ou À COMPLÉTER si ≥ 1 bloquant).

## Test

Chaque constat cite un fichier et un correctif ; le verdict est « prêt à jouer » seulement si aucun bloquant ne subsiste (service du PJ, fronts chiffrés, J&T conforme).
