# Action 02 — migrate

## Rôle

Proposer un plan de migration pour les patterns legacy identifiés en `01-scan`, attendre la validation, puis exécuter fichier par fichier.

## Procédure

1. **Prioriser** selon effort/impact (XS d'abord pour les gains rapides).
2. **Proposer** le plan : pour chaque type de pattern, montrer un exemple représentatif avant/après.
3. **Attendre validation** — ne pas démarrer les éditions avant confirmation.
4. **Migrer par fichier** : éditer un fichier à la fois, confirmer chaque écriture.
5. **Signaler les exceptions** : patterns qui résistent à la migration automatique (float de layout complexe, variable SCSS utilisée dans une expression arithmétique Sass).

## Stratégies par pattern

### float/clearfix → flex/grid
- Identifier le conteneur parent et ses enfants flottants.
- Si disposition en ligne simple → `display: flex; flex-wrap: wrap;` sur le parent, supprimer `float`/`clear` sur les enfants.
- Si grille → `display: grid; grid-template-columns: ...` selon le nombre de colonnes.
- Supprimer les pseudo-éléments clearfix (`.clearfix::after { content:''; display:table; clear:both; }`).

### px → rem (typo uniquement)
- Remplacer `font-size: Npx` par `font-size: Xrem` (N/16).
- Ne pas toucher aux `px` dans `margin`/`padding` sauf si la tâche le demande explicitement.
- Ne pas toucher aux `@media (max-width: Npx)` — breakpoints en `px` = intentionnel.

### vendor prefixes
- Supprimer les préfixes dont la propriété standard est supportée par le baseline 2020+.
- Garder `--webkit-` uniquement pour les fonctionnalités encore non standardisées (ex. `-webkit-text-stroke`).

### variables SCSS/Less → custom properties
- Pour chaque `$var: value;`, créer `--nom-var: value;` dans `:root`.
- Remplacer chaque usage `$var` par `var(--nom-var)`.
- Si un contrat design est disponible et que la variable correspond à un token, utiliser le nom du token (`--color-brand-primary` pas `--primary-color`).
- Les expressions arithmétiques Sass (`$size * 2`) qui deviennent `calc(var(--size) * 2)` : signaler et proposer manuellement.
