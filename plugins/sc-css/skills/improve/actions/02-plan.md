# Action 02 — plan

## Rôle

Proposer le plan de modifications sous forme de diff lisible et attendre la validation humaine avant toute édition.

## Format du plan

Pour chaque amélioration :
```
[P0 | specificity] src/css/btn.scss:42
  Avant : #header .btn { font-size: 1rem !important; }
  Après  : .btn { font-size: var(--font-size-base); }
  Impact : supprime la guerre de cascade avec .has-body-font-size
```

## Règles

- Proposer le diff **exact** — pas de paraphrase. Le plan doit être lisible sans relire le code original.
- Mentionner explicitement si une modification peut changer le rendu visuel (ex. retrait d'un `!important` qui surpassait une règle WP).
- Attendre la validation (`oui` / confirmation) avant de passer aux éditions — ne pas enchaîner automatiquement.
- Après validation, éditer les fichiers et confirmer chaque modification par son chemin + résultat.
