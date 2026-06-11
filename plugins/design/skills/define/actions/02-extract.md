# 02 - extract

Chemin maquettes. Capturer l'évidence visuelle d'une référence livrée, puis en dériver un token set structuré + un inventaire de composants candidats. Fusionne l'ancien `from-reference` (capture + extract) avec la logique `image-extract-details`.

## Inputs

- La source qualifiée par `01-intake` : image/screenshot, URL live, export Figma, ou CSS/feuille de style.
- Le schéma de tokens : `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md`.

## Process

### A. Capturer l'évidence (note de travail, pas encore des tokens)

1. **Charger la référence selon son type** :
   - Image → la lire avec l'outil Read (elle s'affiche visuellement).
   - URL → la récupérer ; si le responsive importe, noter la mise en page à une largeur étroite et une large. Si la récupération est impossible ici, demander un screenshot ou la feuille de style — ne pas deviner les valeurs.
   - CSS / export Figma → lire la source directement (le plus fiable : les valeurs sont explicites).
2. **Cataloguer les valeurs observées** : couleurs réellement utilisées (fonds, texte, accents, bordures, états) avec hex approximatif ; type (familles, graisses, tailles distinctes, line-heights, contraste titre/corps) ; rythme d'espacement (gaps/paddings récurrents → unité de base, souvent 4 ou 8 px) ; radius, ombres/élévation, largeurs de bordure ; motion si observable.
3. **Noter l'évidence responsive** : signes de breakpoints, nombre de colonnes selon la largeur, contenu n'apparaissant qu'en large, pattern mobile spécifique.
4. **Signaler les manques** : ce que la référence ne révèle pas (états disabled, dark mode, motion…).

### B. Dériver les tokens (structurés, dédupliqués, selon le schéma)

0. **Core trio d'abord (vite)** — présenter en une passe rapide les trois décisions qui définissent le look avant le token set complet : **ancre de palette** (marque dominante + température des neutres), **type** (familles/pairing), **jeu d'icônes** (quelle librairie la référence semble utiliser — Lucide/Phosphor/Heroicons/Material/custom — + style ; consigner `icon.library`/`icon.style`). Si la référence utilise des emoji comme icônes, le signaler : le système les remplace par un vrai jeu d'icônes, jamais d'emoji.
1. **Rationaliser les couleurs** en ramps + rôles sémantiques : grouper les hex quasi identiques ; mapper `background`, `surface`, `text`, `text-muted`, `border`, `primary` (+ secondary/accent si présents), états (`success`/`warning`/`danger`/`info`) ; vérifier chaque paire texte/fond en WCAG AA et noter les échecs.
2. **Construire l'échelle de type** : familles/graisses, ajuster les tailles observées à une échelle modulaire, proposer `clamp()` pour les pas qui doivent croître entre breakpoints, fixer les line-heights.
3. **Dériver l'échelle d'espacement** depuis l'unité de base inférée ; exprimer en `rem`.
4. **Capturer** radius, ombres (tokens composites), largeurs de bordure, motion (durée + easing), tailles/strokes d'icônes (`icon.size.*`/`icon.stroke.*`) là où observés ; marquer le reste comme supposé.
5. **Fixer les breakpoints** : valeurs prouvées par la référence ; sinon les défauts du schéma (`sm 640 / md 768 / lg 1024 / xl 1280`), marqués supposés.
6. **Inventorier les composants candidats** vus dans la référence (boutons, inputs, cartes, nav…) avec leurs variantes apparentes. Cet inventaire est **candidat et malléable** — il n'est pas un manifeste.

## Outputs

Un token set proposé complet (forme schéma) + stratégie responsive observée + liste de composants candidats, présentés pour revue rapide. Toute hypothèse va sous "Open questions". Cette matière alimente `04-write-material`.

## Test

Le token set couvre chaque groupe requis du schéma ; chaque paire texte/fond porte un verdict de contraste ; chaque valeur supposée est signalée ; l'inventaire de composants est explicitement marqué *candidat*, pas figé.
