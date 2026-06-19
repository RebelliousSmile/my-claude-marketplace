# Action 01 — audit

## Rôle

Analyser les fichiers CSS du projet sur les 5 dimensions et produire un rapport structuré.

## Procédure

### 01 — Spécificité

1. Parser les sélecteurs de tous les fichiers CSS.
2. Marquer `error` : `!important` hors `@layer reset`, sélecteurs avec ID (`#`), combinateurs > 3 niveaux de profondeur.
3. Marquer `warning` : surspécificité relative (ex. `.btn.btn--primary` quand `.btn--primary` suffit), cascade conflictuelle détectable (même propriété, même élément cible, spécificités différentes dans le même fichier).

### 02 — Code mort

1. Collecter tous les sélecteurs CSS.
2. Cross-référencer contre les classes/IDs présents dans `**/*.html`, `**/*.php`, `**/*.jsx/tsx`, `**/*.vue` (selon le projet).
3. Marquer `warning` : sélecteur jamais trouvé dans les sources HTML (potentiellement généré dynamiquement — signaler comme "possiblement mort" si la classe n'apparaît pas non plus dans les scripts JS).
4. Marquer `info` : `@keyframes` déclarées mais jamais référencées par `animation-name`.

### 03 — Magic numbers

1. Extraire toutes les valeurs de propriétés (`color`, `background-color`, `font-size`, `margin`, `padding`, `gap`, `border-radius`, `box-shadow`).
2. Exclure : `var(--)`, `inherit`, `auto`, `0`, `100%`, `currentColor`.
3. Si `design/tokens.json` est présent : vérifier si la valeur littérale correspond à un token résolu — si oui, marquer `warning` (devrait être `var(--token)`), sinon marquer `error` (hors contrat).
4. Si pas de contrat design : marquer `warning` toute valeur littérale non triviale.

### 04 — A11y

1. Extraire toutes les couleurs de texte + background pour les éléments de contenu (paragraphes, liens, boutons, badges).
2. Calculer le ratio de contraste WCAG (formule luminance relative) → `error` si < 4.5:1 (AA normal), `warning` si < 3:1 (AA large).
3. Chercher `outline: none`, `outline: 0` sans `:focus-visible` alternatif sur le même sélecteur → `error`.
4. Chercher les propriétés `animation`, `transition` sans `@media (prefers-reduced-motion: reduce)` dans le même fichier ou global → `warning`.

### 05 — Opportunités modernes

1. Patterns remplaçables par `:is()` / `:where()` : listes de sélecteurs identiques sauf un segment (`a:hover, button:hover, input:hover` → `:is(a,button,input):hover`).
2. Patterns remplaçables par `:has()` : combinaisons `parent + child` qui testent un état parent via JS classes (`.has-open-dropdown .menu` → `.menu:has(+ .dropdown[open])`).
3. Container queries : media queries qui testent la largeur viewport pour des composants réutilisés dans des contextes variables → candidats `@container`.
4. Nesting natif : blocs `.parent { ... } .parent .child { ... }` → `@nest` ou nesting CSS natif (si PostCSS).
5. Marquer `info` pour chaque opportunité — haut effort mais gain de maintenabilité.
