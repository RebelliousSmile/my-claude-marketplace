---
description: Profil OPTIONNEL mobile-first/a11y — base = plus petit viewport, enrichissement additif, tokens sans magic number, composants à variantes, baseline a11y, un seul jeu d'icônes sans emoji. Injectable dans .claude/rules/08-design/.
paths: ["**/*.vue", "**/*.tsx", "**/*.jsx", "**/*.svelte", "**/*.astro", "**/*.css", "**/*.scss", "**/*.html", "design/**"]
---

# Profil mobile-first / accessibilité (optionnel)

Profil **injectable et optionnel** rapatrié de l'ancien `design:setup`. `define` ne l'impose plus d'office : il est proposé une fois par `01-intake` et installé dans `.claude/rules/08-design/` du projet seulement si l'utilisateur le retient. Il rassemble les 7 conventions liantes que `enforce` peut ensuite vérifier.

## 1. Authoring mobile-first

- Les styles de base ciblent le plus petit viewport ; aucune media query de largeur dans la couche de base ; une colonne par défaut ; contenu ordonné par priorité mobile.
- Enrichir vers le haut avec `min-width` **uniquement** ; jamais `max-width` comme axe primaire.
- Breakpoints nommés depuis `design/tokens.json` (`breakpoint.sm/md/lg/xl`) ; jamais de breakpoint ad-hoc ; un breakpoint se justifie par le contenu, pas par le device.
- Fluide par défaut : `clamp()` pour type et espacement ; unités relatives (`rem`, `%`, `fr`, `ch`) ; médias fluides (`max-width: 100%`). Un breakpoint seulement quand la mise en page doit se restructurer.

## 2. Enrichissement progressif (≥ tablette/desktop)

- Le core mobile complète la tâche seul ; l'enrichi est **additif, jamais porteur** ; ne jamais verrouiller une action requise derrière un breakpoint ni cacher du contenu critique au mobile.
- L'enrichi peut ajouter : panneaux secondaires, rails latéraux, nav persistante ; tables denses, galeries multi-colonnes ; previews inline, affordances hover ; visuels qui ont besoin de largeur.
- Révéler l'enrichi avec `min-width` seulement ; marquer chaque région enrichie (`data-enrich="md"`) ; même modèle de contenu à tous les breakpoints — seules densité et affordance changent.
- Plancher SEO/a11y : le contenu requis est dans le DOM sur mobile aussi ; jamais `display:none` sur du contenu utile à un mobile ou un crawler.

## 3. UX mobile-only

- Certains UX n'existent que sur mobile par design ; chaque pattern mobile-only **déclare son équivalent desktop** ; remplacer, jamais dupliquer ; résultat de tâche identique des deux côtés.
- Patterns sanctionnés : bottom sheet (→ side panel/modal), CTA sticky thumb-reachable / bottom tab bar (→ top nav/sidebar), swipe/pull-to-refresh/carousels snap (→ grille/rail à flèches), accordéons (→ colonnes), FAB (→ bouton inline).
- Documenter chaque paire dans le spec composant ; tout geste tactile a un fallback visible ; basculer au breakpoint, pas par sniffing d'user-agent.

## 4. Discipline des design tokens

- `design/tokens.json` est canonique (W3C DTCG) ; consommer via `adapters/tokens.css` (vars CSS) ou `theme.css` (Tailwind) ; ne jamais éditer les adapters générés ; régénérer les deux ensemble.
- **No magic number** : couleur, type, espace, radius, ombre, motion viennent des tokens ; jamais de hex ni de px en dur ; une valeur one-off = un nouveau token, pas un littéral inline.
- Tokens sémantiques plutôt que ramps brutes dans les composants (`--color-semantic-surface`, pas `--color-neutral-50`) ; nommer par rôle (`danger`, pas `red`).

## 5. Composants réutilisables à variantes

- Étendre par options plutôt que forker ; exposer la variation en props/variants, pas en fichiers dupliqués ; un composant = une responsabilité ; jamais de copier-coller pour changer une valeur.
- Variant = mode visuel nommé (`primary`, `ghost`, `danger`) ; size = pas d'échelle (`sm`/`md`/`lg`) ; booléens pour features additives (`icon`, `loading`) ; défauts utilisables sans props.
- Spec dans `design/components/<name>.md` : anatomie, options, variants, états (default/hover/focus/active/disabled/loading/empty/error), divergence responsive, a11y.

## 6. Baseline accessibilité

- Texte de corps WCAG AA (4.5:1) ; texte large et éléments UI 3:1 ; tokens sémantiques AA-vérifiés à la définition ; jamais d'état par la couleur seule.
- Focus visible sur tout élément focusable ; tout interactif atteignable au clavier ; ordre de tabulation logique.
- Cibles tactiles ≥ 44×44 px sur mobile ; espacement suffisant entre cibles ; actions primaires mobiles dans le thumb reach.
- Honorer `prefers-reduced-motion` ; `alt` signifiant (ou vide si décoratif) ; un `<h1>` par page, titres imbriqués ; landmarks (`header`/`nav`/`main`/`footer`) ; bouton pour action, lien pour navigation ; contrôles de formulaire labellisés.

## 7. Iconographie

- Toutes les icônes UI viennent du **jeu unique** choisi ; librairie + style consignés (`icon.library`/`icon.style`) ; ne jamais mélanger les sets ; un style par défaut (outline/solid) tenu.
- Taille depuis `icon.size.*` (alignée à l'échelle de type), stroke depuis `icon.stroke.*` ; couleur via `currentColor` ou token sémantique ; jamais de dimensions en dur.
- **Jamais d'emoji** comme icône UI, bullet, status dot ou glyphe de bouton : les emoji sont du contenu utilisateur, pas le langage visuel du système. Un statut = icône + texte/aria.
- Icône décorative → `aria-hidden="true"` ; icône signifiante → label accessible ; bouton icon-only toujours labellisé.
