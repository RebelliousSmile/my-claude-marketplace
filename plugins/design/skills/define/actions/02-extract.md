# Extract

Chemin maquettes. Capturer l'évidence visuelle d'une référence livrée, puis en dériver un token set structuré + un inventaire de composants candidats. Fusionne l'ancien `from-reference` (capture + extract) avec la logique `image-extract-details`.

## Inputs

- La source qualifiée par `01-intake` : image/screenshot, URL live, export Figma, ou CSS/feuille de style.
- Le schéma de tokens : `${DESIGN_PLUGIN_ROOT}/references/token-schema.md`.

## Process

### A. Capturer l'évidence (note de travail, pas encore des tokens)

1. **Charger la référence selon son type** :
   - Image → la lire avec l'outil Read (elle s'affiche visuellement).
   - URL → la récupérer ; si le responsive importe, noter la mise en page à une largeur étroite et une large. Si la récupération est impossible ici, demander un screenshot ou la feuille de style — ne pas deviner les valeurs.
   - CSS / export Figma → lire la source directement (le plus fiable : les valeurs sont explicites).
   - Dossier d'export d'outil de design → format propre à l'outil et à sa version, non normé : lire ce qui s'y trouve, ne rien supposer. La feuille de jetons fait foi pour les valeurs (comme un CSS) ; chaque planche HTML est une évidence de rendu, lue sans l'exécuter ni reprendre ses scripts ou fichiers de support ; l'index JSON ne sert qu'à relier les planches ; la note de passation informe l'intention et les contraintes, qui vont en Open questions, jamais en tokens. Une planche dont le rendu dépend d'un fichier absent est signalée comme non mesurable.
2. **Cataloguer les valeurs observées** : couleurs réellement utilisées (fonds, texte, accents, bordures, états) avec hex approximatif ; type (familles, graisses, tailles distinctes, line-heights, contraste titre/corps) ; rythme d'espacement (gaps/paddings récurrents → unité de base, souvent 4 ou 8 px) ; radius, ombres/élévation, largeurs de bordure ; motion si observable.
3. **Noter l'évidence responsive** : signes de breakpoints, nombre de colonnes selon la largeur, contenu n'apparaissant qu'en large, pattern mobile spécifique.
4. **Signaler les manques** : ce que la référence ne révèle pas (états disabled, dark mode, motion…).

### B. Dériver les tokens (structurés, dédupliqués, selon le schéma)

0. **Core trio d'abord (vite)** — présenter en une passe rapide les trois décisions qui définissent le look avant le token set complet : **ancre de palette** (marque dominante + température des neutres), **type** (familles/pairing), **jeu d'icônes** (quelle librairie la référence semble utiliser — Lucide/Phosphor/Heroicons/Material/custom — + style ; consigner `icon.library`/`icon.style`). Si la référence utilise des emoji comme icônes, le signaler : le système les remplace par un vrai jeu d'icônes, jamais d'emoji.
1. **Rationaliser les couleurs** en ramps + rôles sémantiques : grouper les hex quasi identiques ; mapper `background`, `surface`, `text`, `text-muted`, `border`, `primary` (+ secondary/accent si présents), états (`success`/`warning`/`danger`/`info`).

   **Relever les appariements observés, pas seulement les couleurs.** Une couleur ne dit pas d'elle-même qu'elle porte du texte : c'est la référence qui le montre, et c'est le seul moment de l'entonnoir où l'information est directement visible. Noter, pour chaque texte lisible dans la référence, **quelle couleur est posée sur quelle couleur** — y compris quand l'avant-plan est une couleur de marque et non un rôle sémantique. Un `brand.deep` qui porte un titre est un appariement à relever exactement comme `semantic.text` sur `semantic.background` ; un nom de rôle n'est ni nécessaire ni suffisant.

   Vérifier chaque paire ainsi relevée en WCAG AA et noter les échecs. Cette liste n'est pas un sous-produit : c'est la matière que `components.json § .foregrounds` réclamera au figeage (`${DESIGN_PLUGIN_ROOT}/skills/adjust/references/manifest-schema.md § Invariant 7`), et un contrat qui arrive sans elle ne se fige pas.
2. **Construire l'échelle de type** : familles/graisses, ajuster les tailles observées à une échelle modulaire, proposer `clamp()` pour les pas qui doivent croître entre breakpoints, fixer les line-heights.
3. **Dériver l'échelle d'espacement** depuis l'unité de base inférée ; exprimer en `rem`.
4. **Capturer** radius, ombres (tokens composites), largeurs de bordure, motion (durée + easing), tailles/strokes d'icônes (`icon.size.*`/`icon.stroke.*`) là où observés ; marquer le reste comme supposé.
5. **Fixer les breakpoints** : valeurs prouvées par la référence ; sinon les défauts du schéma (`sm 640 / md 768 / lg 1024 / xl 1280`), marqués supposés.
6. **Inventorier les composants candidats** vus dans la référence (boutons, inputs, cartes, nav…) avec leurs variantes apparentes, **chacun avec ses fonds et ses avant-plans observés** — les chemins de tokens de l'étape 1, attachés au composant qui les emploie. Cet inventaire est **candidat et malléable** — il n'est pas un manifeste ; mais l'appariement qu'il porte, lui, ne se retrouve plus nulle part une fois la référence refermée.

## Outputs

Un token set proposé complet (forme schéma) + stratégie responsive observée + liste de composants candidats **avec leurs paires avant-plan/fond observées**, présentés pour revue rapide. Toute hypothèse va sous "Open questions". Cette matière alimente `04-write-material`.

## Test

Le token set couvre chaque groupe requis du schéma ; les paires texte/fond **observées dans la référence** sont relevées nommément — avant-plan et fond, y compris hors `color.semantic` — et chacune porte un verdict de contraste ; chaque composant candidat porte les siennes ; chaque valeur supposée est signalée ; l'inventaire de composants est explicitement marqué *candidat*, pas figé.
