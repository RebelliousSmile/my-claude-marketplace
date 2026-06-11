# 03 - construct

Chemin brief. Pas de visuel : on dérive un système cohérent et **distinctif** depuis l'intention écrite. Fusionne l'ancien `from-brief` (clarify + derive).

Distinctif par défaut : éviter le look générique par défaut du framework. La personnalité du brief doit être lisible dans les tokens produits.

## Inputs

- `brief` (required) — brief client, positionnement produit, ou user story (texte libre ou chemin de doc).
- La grille des drivers : `references/intake-questions.md`.
- Le schéma de tokens : `${CLAUDE_PLUGIN_ROOT}/references/token-schema.md`.

## Process

### A. Clarifier (cerner les attributs qui pilotent les tokens)

1. **Lire le brief** et extraire ce qui est déjà décidé : produit, audience, mots de ton, plateforme, mention de couleur/marque, contraintes.
2. **Identifier les ambiguïtés réelles** contre la liste de drivers de `references/intake-questions.md`.
3. **Poser au plus 3–4 questions en une liste numérotée** — uniquement les drivers à la fois inconnus ET déterminants pour un token. Puis attendre les réponses.
4. **Défauter le reste** via la table des défauts ; consigner chaque défaut pour que l'utilisateur puisse l'écraser.
5. **Assembler un profil d'attributs** : personnalité, audience/contexte, plateforme & usage, contraintes couleur/thème, barre d'accessibilité.

### B. Dériver (le profil → un token set cohérent et distinctif)

0. **Core trio d'abord (vite)** — avant l'échelle complète, trancher et présenter en une passe : **ancre de palette** (primary marque + température neutre), **type** (famille/pairing), **jeu d'icônes** (une librairie + style, ex. Lucide outline). Obtenir un oui/ajuste sur le trio, puis étendre. Jamais d'emoji comme iconographie.
1. **Système de couleurs** : un primary qui exprime la personnalité (pas le bleu par défaut du framework sauf demande du brief) ; ramp neutre à la bonne température (chaud/froid) ; secondary/accent seulement si la personnalité l'exige ; rôles sémantiques + états ; vérifier chaque paire texte/fond en WCAG AA (ou la barre énoncée).
2. **Typographie** : famille (ou pairing) cohérente avec la personnalité ; échelle modulaire avec `clamp()` pour une croissance fluide titre/corps ; graisses et line-heights ; plancher de corps confortable pour l'audience.
3. **Espacement** : unité de base (4 ou 8 px) et échelle cohérente en `rem`.
4. **Radius / ombre / bordures / motion / icônes** : accordés à la personnalité (net+plat pour technique, arrondi+doux pour amical, motion restreinte pour premium). Tokens durée + easing. `icon.size.*` aligné à l'échelle de type, `icon.stroke.*` pour le set outline choisi.
5. **Breakpoints** : défauts du schéma sauf si la plateforme implique autrement ; max-widths de conteneur par breakpoint.
6. **Stratégie responsive** : nommer le **mobile core** (chemin de tâche must-have), les ajouts **enriched-only** (≥ tablette/desktop), et les patterns **mobile-only** avec leurs équivalents desktop.
7. **Inventaire de composants candidats** : lister les composants que les flux du brief impliquent, avec leurs variantes prévues. Cet inventaire est **candidat et malléable** — il n'est pas un manifeste.

## Outputs

Un profil d'attributs + un token set proposé complet (forme schéma) + stratégie responsive + liste de composants candidats, présentés pour revue rapide, toute hypothèse signalée. Cette matière alimente `04-write-material`.

## Test

Le core trio (palette · type · jeu d'icônes) a été présenté pour approbation avant l'échelle complète ; au plus 3–4 questions en une passe ; chaque driver non répondu a un défaut consigné ; la palette est délibérément liée à la personnalité (pas le look stock) ; un seul jeu d'icônes sans emoji ; les paires de contraste passent la barre ; la stratégie responsive nomme mobile-core / enriched / mobile-only ; l'inventaire est explicitement *candidat*.
