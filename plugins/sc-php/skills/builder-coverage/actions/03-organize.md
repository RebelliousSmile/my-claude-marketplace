# Action 03 — organize

Ranger la bibliothèque de patterns par **rôle de section**, appliquer un nommage
cohérent, et vérifier l'équilibre. Complète `01-scan` (complétude) par la
lisibilité : une bibliothèque complète mais mal rangée reste inutilisable par un
éditeur non-technique.

## Taxonomie de référence — par rôle de section

Catégoriser par **fonction de la section dans le flux de page**, pas par type de
composant. Cette grille tient sur ~90 % des sites vitrine / corporate / SaaS et
correspond à la façon dont un éditeur compose (comme un builder Divi/Elementor).
Ordre = flux typique d'une page :

| # | Catégorie (slug) | Rôle | Exemples de patterns |
|---|---|---|---|
| 1 | `hero` | Ouvertures de page | héro accueil, service, avec stats, contact, géo, hub |
| 2 | `proof` | Preuve & réassurance | KPIs, chiffres, témoignages, piliers, personas, équipe |
| 3 | `offer` | Offre & tarifs | offres, forfaits, double offre, comparatifs prix |
| 4 | `services` | Services & prestations | grilles de services, inclus, process, avantages, focus |
| 5 | `content` | Contenu éditorial | prose, FAQ, pour/contre, galerie, à la une, faits locaux |
| 6 | `data` | Données & encadrés | grilles d'info, profils, tableaux comparatifs, timeline, notes |
| 7 | `contact` | Conversion & contact | CTA, formulaires, cartes contact, coordonnées, newsletter |
| 8 | `nav` | Navigation & utilitaires | plan du site, filtres, en-têtes de section, cartes de catégories, TOC |
| 9 | `blog` | Blog & article | carte d'article, alertes/callouts, CTA d'article (100 % natifs) |

Adapter les libellés/slugs au préfixe du projet (ex. `mau-hero`). Toutes les
catégories utilisées doivent être **enregistrées** (thème : `register_block_pattern_category`).

## Règles d'assignation (ce qui fait la méthode)

1. **Une catégorie primaire par pattern** — pas de multi-catégorie, sauf transverse assumé.
2. **Aucun fourre-tout** — si une catégorie dépasse ~8 patterns, la scinder par
   sous-rôle (ex. `content` → `content` + `data`). Jamais de bucket « divers ».
3. **Regrouper les variantes** — toutes les ouvertures dans `hero` (héro service,
   contact, géo, hub…), toutes les preuves dans `proof`, etc. Un « Contact — Héro »
   va dans `hero`, pas dans un bucket contact.
4. **Nommage** `Rôle — Variante`, sans préfixe de marque (« Mauceri — » retiré).
5. **Contrainte native** — une pattern rangée dans `blog` (ou toute catégorie
   marquée 100 %-natif par le projet) ne doit contenir aucun `wp:html` : si elle a
   des îlots (image, formulaire, CTA-lien), la ranger ailleurs (`content`, `contact`…).

## Process

### Step 1 — Enregistrer les catégories de rôle

Dans le thème (`functions.php` → `register_block_pattern_category`), déclarer le
jeu de rôles utilisé. Préfixer les libellés par `1 ·`, `2 ·`… pour forcer l'ordre
« flux de page » dans l'inserteur (WordPress trie alphabétiquement).

### Step 2 — Assigner chaque pattern

Mettre à jour l'en-tête `Categories:` (et normaliser `Title:`) de chaque
`patterns/*.php` selon la grille. Un mapping explicite (fichier → catégorie, titre)
scripté est plus sûr que 50 éditions manuelles.

### Step 3 — Lint d'équilibre

```bash
pnpm dlx @wordpress/env run cli wp eval-file <chemin>/category-balance.php
```

Objectif `ISSUES: 0` : aucune catégorie > `BC_MAX` (défaut 8), aucune pattern
insérable sans catégorie. Corriger puis relancer.

### Step 4 — Vérifier (cache + gates)

1. Bumper `Version:` du thème puis `wp_clean_themes_cache()` (le cache masque les
   changements de catégorie — cf. SKILL.md « Pièges »).
2. `01-scan` → couverture toujours `GAPS: 0`.
3. `patterns-lint` (ou équivalent projet) : contrainte native (blog) respectée.
4. Contrôle visuel de l'inserteur : catégories ordonnées, effectifs équilibrés,
   toutes les variantes d'un rôle regroupées.

## Output

```
✅ builder-coverage organize
   Catégories : hero 7 · proof 6 · offer 4 · services 8 · content 6 · data 6 · contact 5 · nav 5 · blog 5
   Équilibre  : ISSUES: 0 (aucun fourre-tout, aucune orpheline)
   Couverture : GAPS: 0 (inchangée)
   Nommage    : « Rôle — Variante », préfixe de marque retiré
```
