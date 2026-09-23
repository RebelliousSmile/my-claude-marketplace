# Render (sc-php)

## Rôle

Rendre l'élément neutre en **block pattern WordPress FSE** idiomatique + mettre à jour `theme.json` si nécessaire. Dérive strictement du spec de rendu reçu de `design:diffuse/03-pivot`.

## Input attendu (spec de rendu)

```
## Design render spec
Source: design/tokens.json + design/components.json
Version: <semver>
Component: { name, base, elements, modifiers, backgrounds, a11y }
Variants to produce: [...]
Render target: { language: php-fse-block, output_dir: ... }
```

Vérifier que le spec est présent avant de continuer.

## Prérequis WP

Lire `${SC_PHP_PLUGIN_ROOT}/skills/design-bridge/references/wordpress-pitfalls.md` intégralement avant de produire quoi que ce soit. Points critiques :
- CLI conteneur obligatoire pour toute opération DB, via `pnpm wp`
- Classes appariées `has-*` → décider de les déclarer dans le manifeste ou les exclure du lint
- `wp eval-file` deprecated → utiliser `wp eval` avec `file_get_contents`
- Propagation block patterns : la source doit être réimportée après modification
- **Piège 8** : jamais de reset sur sélecteur descendant d'élément (`.wp-site-blocks a`) — il écrase
  toutes les classes simples du manifeste
- **Piège 9** : l'oracle de fidélité est relatif, il ne voit pas les défauts de la maquette → un gate
  absolu (contraste rendu) est obligatoire au-dessus
- **Piège 10** : le périmètre de l'oracle énumère *tous* les templates, `single*`/`archive*`/`404` compris

## Étape 1 — Produire le HTML du block pattern

Le block pattern WP est du HTML enrichi de commentaires Gutenberg (`<!-- wp:... -->`). Seules les classes du spec sont utilisées dans les balises HTML ; Gutenberg peut ajouter les siennes dans les commentaires (ex. `{"className":"card card--featured"}`).

Structure type :

```html
<!-- wp:group {"className":"<base> <modifier>","style":{}} -->
<div class="wp-block-group <base> <modifier>">

  <!-- wp:image {} -->
  <figure class="wp-block-image <base>__<element>">
    <img src="" alt=""/>
  </figure>
  <!-- /wp:image -->

  <!-- wp:group {} -->
  <div class="wp-block-group <base>__body">

    <!-- wp:heading {"level":2} -->
    <h2 class="wp-block-heading <base>__title">Titre</h2>
    <!-- /wp:heading -->

  </div>
  <!-- /wp:group -->

</div>
<!-- /wp:group -->
```

Règle : la classe design system (`card`, `card__body`, etc.) est sur l'élément HTML ; la classe WP (`wp-block-group`, etc.) est sur le même élément mais ne fait PAS partie du manifeste design — ne pas la linéter contre le manifeste.

### Étape 1b — Lier les blocs core à leur élément peint

`className` ne tombe pas toujours sur l'élément qui reçoit les styles visibles. Le renderer porte cette
connaissance de plateforme et maintient `<theme>/assets/css/design/fse-bindings.css` :

| Bloc core | Porteur de `className` | Élément peint | Sélecteur dérivé |
|---|---|---|---|
| `core/button` | `.wp-block-button.<classe-ds>` | `.wp-block-button__link` | `.<classe-ds> > .wp-block-button__link` |
| `core/navigation-link` | `.wp-block-navigation-item.<classe-ds>` (front) ou ancre `<classe-ds>` (éditeur) | `.wp-block-navigation-item__content` | `.wp-block-navigation .<classe-ds> .wp-block-navigation-item__content, .wp-block-navigation .<classe-ds>.wp-block-navigation-item__content` |

L'ancêtre `.wp-block-navigation` du lien n'est pas décoratif : le core émet lui-même un sélecteur à
trois classes sur l'ancre, et le canvas peut intercaler un wrapper de bloc. Le binding mesuré doit au
minimum atteindre cette spécificité, tolérer les deux porteurs, puis être chargé après le core ;
`.<classe-ds> > …` seul perd réellement malgré la présence de la classe DS.

Pour chaque binding utilisé :

1. lire les déclarations du sélecteur DS correspondant dans les feuilles composants produites par
   `sc-css:design-bridge` ;
2. recopier mécaniquement ces déclarations sous le sélecteur hôte dérivé, sans inventer de classe ni de
   valeur ;
3. annoter le bloc avec sa feuille source et son hash ;
4. régénérer si la source change ; une source absente rend le binding `unrealized`, jamais vide et vert ;
5. déclarer `fse-bindings.css` dans les sources de `sc-css:design-bridge/03-realize-lint`.

`fse-bindings.css` est produit par sc-php, parce que le DOM core est une connaissance WordPress. sc-css
le contrôle mais ne le réécrit pas. Le point d'entrée le charge après les composants génériques.

### Étape 1c — Retirer les overrides de présentation concurrents

Sur un bloc portant une classe DS, ne produire aucun attribut Gutenberg de présentation (`fontSize`,
`textColor`, `backgroundColor`, `style.typography`, `style.color`) pour une propriété déjà déclarée par
la feuille du composant. Retirer l'attribut à la source du pattern ou de l'import et re-sérialiser le bloc.
Une conservation explicitement demandée devient une déviation documentée ; elle n'est jamais compensée
silencieusement par un nouveau `!important`.

## Étape 2 — Adapter `theme.json`

Résoudre le `theme.json` actif comme dans `01-realize-lint`, puis utiliser l'adaptateur du pivot. Il
matérialise toutes les échelles WP supportées, pas seulement les fonds du composant :

```bash
# Aperçu obligatoire : aucune écriture
node "${SC_PHP_PLUGIN_ROOT}/skills/design-bridge/tools/theme-json-adapter.mjs" \
  --tokens design/tokens.json \
  --theme "wp-content/themes/${WP_ACTIVE_THEME}/theme.json"

# Après inspection du diff
node "${SC_PHP_PLUGIN_ROOT}/skills/design-bridge/tools/theme-json-adapter.mjs" \
  --tokens design/tokens.json \
  --theme "wp-content/themes/${WP_ACTIVE_THEME}/theme.json" \
  --write
```

Passer `--token-theme <nom>` seulement lorsque ce thème WordPress matérialise explicitement l'overlay
de tokens homonyme. L'adaptateur applique alors l'overlay sparse avant de résoudre les alias.

Correspondances déterministes : `color.*` → `settings.color.palette`, `font.size.*` →
`settings.typography.fontSizes`, `space.*` → `settings.spacing.spacingSizes`. Les slugs viennent du path
sans son préfixe de groupe. Le marqueur `settings.custom.design.designTokenPresets` délimite les presets
générés : une ré-exécution les remplace sans doublon et retire les générés devenus obsolètes. Les clés,
styles et presets humains hors de ce marqueur sont préservés. Un slug humain qui entrerait en collision
avec un preset généré fait échouer l'adaptateur avant écriture ; il n'est jamais écrasé.

Enfin vérifier que chaque `.backgrounds` du composant résout vers le slug généré correspondant. Un fond
absent de la palette ou une valeur différente de la `Token scale` active est une divergence bloquante
(voir piège 7 de `wordpress-pitfalls.md`). Rejouer l'adaptateur après écriture doit produire un diff vide.

## Étape 3 — Enregistrer le block pattern

Créer le fichier du pattern dans l'output dir du spec (ex. `patterns/<canonical-name>.php`) avec une en-tête WordPress :

```php
<?php
/**
 * Title: <Nom du composant>
 * Slug: <plugin-ou-theme>/<canonical-name>
 * Categories: <categorie>
 * Inserter: yes
 * Viewport Width: 1200
 */
?>
<!-- Block pattern HTML ici -->
```

Si le projet utilise un répertoire `patterns/` dans le thème, placer le fichier `.php` à cet endroit.
Le dernier segment de `Slug` égale le nom du fichier, le slug est unique et la catégorie est enregistrée.
Valider aussi l'équilibre/imbrication des délimiteurs et le JSON de chaque commentaire de bloc.

## Étape 4 — Gate enforce

Linter le HTML du block pattern produit :

```bash
# Extraire le HTML (sans les commentaires wp:...) dans un fichier temporaire
# Puis linter contre le contrat
node design/lint/lint-core.mjs /tmp/pattern-<canonical-name>.html
```

Si exit 1 → corriger les classes non conformes, re-lint, ne pas livrer en exit 1.

### Étape 4b — Gates absolus (indépendants de la maquette)

Le lint de vocabulaire et l'oracle de fidélité sont tous deux **relatifs** (au manifeste, à la maquette).
Deux contrôles supplémentaires sont dus avant de livrer un rendu, parce qu'aucun des deux premiers ne
peut les produire (pièges 8 et 9) :

1. **Contraste sur page rendue.** Pour chaque paire texte/fond du composant, lire `color` et
   `background-color` **calculés** (`getComputedStyle`) sur une instance réellement rendue, pas les
   valeurs déclarées dans le CSS. Une paire déclarée conforme peut rendre 1,06:1 si un reset descendant
   l'écrase. Seuil : WCAG AA (4,5:1 texte courant, 3:1 texte large et éléments d'interface).
2. **Cascade.** Pour chaque propriété que les feuilles composants et `fse-bindings.css` déclarent,
   vérifier sur le front et dans l'éditeur que la déclaration gagnante vient de l'une de ces feuilles.
   Le contrôle couvre notamment les sélecteurs descendants, presets `has-*`, styles inline,
   `!important`, ordre de chargement et layers. Le protocole exécutable est celui de
   `design:enforce/05-fidelity-gate`; une simple comparaison de spécificité ne constitue pas la preuve.
   Générer le config avec une option `--ownership-stylesheet` par feuille composant et pour
   `fse-bindings.css`. Les deux surfaces (`front`, `editor`) sont obligatoires ; l'éditeur reçoit sa
   session via `WP_EDITOR_STORAGE_STATE` ou `WP_EDITOR_AUTH_HOOK`. Sans session, la preuve est
   `unrealized` et le verdict reste `OPEN`. Un gagnant n'est accepté que si sa feuille est attendue et
   si son sélecteur porte la classe DS mesurée.

Un échec ici n'est **jamais** absorbable par le registre de déviations : le ledger sert à acter un écart
*au contrat*, pas un défaut d'accessibilité. Si la maquette est la source du défaut, corriger des deux
côtés (piège 9).

## Étape 5 — Poser le pattern

Un pattern enregistré n'est **rendu nulle part**. Il entre dans l'inserteur de l'éditeur, et c'est tout :
aucune page ne le contient tant qu'il n'a pas été posé. Le gate de vocabulaire linte le fichier du pattern
et sort vert ; le gate de fidélité mesure des templates qui ne le contiennent pas et sort vert. Deux verts,
site inchangé — le rendu est livré et invisible.

Le spec de rendu ne porte pas cette information : son `Render target` nomme un langage et un répertoire de
sortie, jamais un point d'insertion, et le contrat interdit à `03-pivot` de transporter des contraintes de
plateforme. Le placement appartient donc à ce réceptacle.

Trois destinations, une seule à choisir, **écrite** :

| Destination | Forme | Quand |
|---|---|---|
| Template du thème | `<!-- wp:pattern {"slug":"<prefix>/<canonical-name>"} /-->` dans `templates/*.html` ou `parts/*.html` | la section appartient à une vue, pas à une page |
| Contenu en base | markup du pattern copié dans `post_content` | la section appartient à une page éditée |
| Aucune, assumée | — | brique d'auteur destinée à l'insertion manuelle |

La troisième est un **statut déclaré**, jamais un silence : `posé: non — brique d'auteur`. Sans elle, un
pattern oublié et un pattern délibérément non posé laissent la même trace, et le bilan ne peut que les
confondre.

Deux conséquences à connaître avant de choisir :

- L'insertion par `wp:pattern` dans un **fichier** de thème est résolue au rendu : le contenu suit la
  source. L'insertion par copie ne suit rien (piège 2).
- Dès qu'un template est sauvegardé depuis l'éditeur de site, WordPress en écrit une copie en base qui
  **prend le pas sur le fichier du thème**, pattern aplati compris. Le fichier corrigé ensuite ne change
  plus rien à l'écran. C'est le piège 2 appliqué aux templates.

Vérification : charger la vue qui doit porter le pattern et y trouver un marqueur du markup produit. Un
`patterns/` peuplé n'est pas une preuve de pose.

## Étape 6 — Propagation (si pattern existant mis à jour)

Si le pattern existait déjà en DB, relancer le script d'import du projet pour propager :

```bash
pnpm wp eval \
  '$c = file_get_contents("/var/www/html/tools/import/<script>.php"); eval($c);'
```

Puis relancer `design:enforce/03-lint-instances` pour vérifier les instances en DB.

## Sortie attendue

> Block pattern WP produit : `patterns/<canonical-name>.php`
> Variantes : <liste>
> theme.json : <mis à jour / aucune modification>
> Binding FSE : <fse-bindings.css + sélecteurs dérivés / non requis>
> Posé dans : <template ou page, et le marqueur qui le prouve> · ou `non — brique d'auteur`
> Gate enforce : vert (exit 0)
> Gates absolus : contraste <ratio min> · spécificité <0 conflit / N conflits>
> Couverture : mesuré = <liste> · non mesuré = <liste + raison>
>
> Retour à design:diffuse — rendu WP livré.

**Aucune sortie ne conclut avec un gate `OPEN`.** Si un gate reste rouge, la sortie porte le verdict
rouge, le commit d'origine de la régression (`git log -S"<chaîne>" -- <fichier>` — c'est la commande qui
transforme « on ne sait pas d'où ça vient » en attribution) et un propriétaire nommé. « Préexistant »,
« hors périmètre de cette part » et « sans rapport avec ce travail » ne sont pas des statuts : ce sont
des formulations qui font traverser un gate rouge à plusieurs itérations sans que personne n'en hérite.
