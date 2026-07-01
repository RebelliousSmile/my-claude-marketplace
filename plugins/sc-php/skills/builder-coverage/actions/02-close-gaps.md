# Action 02 — close-gaps

Amener `GAPS` à 0 en créant (ou étendant) une pattern éditable pour chaque
composant non couvert remonté par `01-scan`.

## Principe

Une pattern par **type de composant**, aussi **éditable** que le support le permet :
- texte (titres, descriptions, prix, libellés) → **blocs natifs** (`wp:heading`,
  `wp:paragraph`, `wp:list`, `wp:details`, `wp:button`) ;
- liens/icônes/SVG/formulaires SSR irréductibles → **îlots `wp:html`** (comme le
  précédent `compare-table` du projet).

## Process — par composant en gap

### Step 1 — Récupérer le markup natif fidèle

Extraire depuis une page qui l'utilise (repérée par `01-scan`) :

```bash
BC_DUMP_POST=181 BC_DUMP_CLASS=mau-contact-card \
  pnpm dlx @wordpress/env run cli wp eval-file <chemin>/dump-section.php
```

C'est la **source de vérité** : le markup déjà en DB rend correctement et passe
déjà les linters DS. Le copier plutôt que réinventer.

### Step 2 — Écrire la pattern

Créer `wp-content/themes/<theme>/patterns/<slug>.php` avec l'en-tête auto-enregistré :

```php
<?php
/**
 * Title: <Titre lisible>
 * Slug: <theme>/<slug>
 * Categories: <catégorie enregistrée>
 * Inserter: true
 * Keywords: …
 * Description: …
 */
?>
<!-- markup ici -->
```

Règles de fidélité et d'éditabilité :
- **Carte-lien → group éditable.** Si le composant est un `<a>` enveloppant tout
  (carte-lien), le rendre en `wp:group` portant la même classe (le CSS est basé
  classe → rendu identique) + un `wp:button`/îlot pour le lien. Le texte devient
  éditable.
- **Neutraliser le block-gap** : les `wp:group` portent
  `{"style":{"spacing":{"blockGap":"0"}}}` ; le rythme vient du CSS composant.
- **Sous-éléments** (`__title`, `__desc`…) : vérifier qu'ils sont déclarés au
  vocabulaire DS (manifeste) avant de les émettre en natif (sinon erreur F-vocab).
  S'ils existent déjà en natif sur les pages et que `ds-lint:db` passe, c'est bon.
- **Îlots** : icônes SVG (`<use href="#…">`), emojis décoratifs, liens, `<form>`
  SSR restent en `wp:html`.
- **Section** : envelopper dans le group de section du projet avec un fond explicite
  (`backgroundColor`) et, si la classe de section porte un modificateur, un
  `metadata.name` (sinon « Groupe » dans l'arbre de l'éditeur).
- **SSR** : si le seul « pattern » est un bloc dynamique, fournir **en plus** une
  variante native (ex. FAQ `wp:details`).

Un composant déjà présent mais via une pattern à structure différente
(ex. grille en `wp:columns` sans la classe attendue) : **étendre** la pattern
existante pour porter la classe du composant, plutôt que d'en créer une seconde.

### Step 3 — Invalider le cache des patterns

Bumper `Version:` dans `style.css` (durable, invalide au déploiement) puis :

```bash
pnpm dlx @wordpress/env run cli wp eval 'wp_clean_themes_cache();'
```

### Step 4 — Vérifier

1. `01-scan` de nouveau → viser `GAPS: 0`.
2. Linters DS du projet à 0 erreur (`patterns-lint`, `ds-lint`, `ds-lint:db`).
3. Rendu sans fatal :
   ```bash
   wp eval 'echo strlen(do_blocks(WP_Block_Patterns_Registry::get_instance()->get_registered("<theme>/<slug>")["content"]));'
   ```
4. Enregistrement effectif (`inserter=1`) via `get_registered`.

## Output

```
✅ builder-coverage close-gaps
   Patterns créées   : contact-hero, hero-stats, faq-editable
   Patterns étendues : team (+mau-team-grid), obligations (+mau-obligation-grid)
   Re-scan           : GAPS: 0
   Lints             : patterns-lint 0 · ds-lint 0 · ds-lint:db 0 · do_blocks OK
   Version thème     : 0.4.59 → 0.4.60
```
