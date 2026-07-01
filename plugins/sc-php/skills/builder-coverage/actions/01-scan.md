# Action 01 — scan

Auditer la couverture builder : quels composants des pages n'ont **pas** de pattern
éditable enregistrée.

## Process

### Step 1 — Vérifier l'environnement

Confirmer que wp-env tourne et que le thème actif est un thème bloc avec
`patterns/*.php`. Utiliser exclusivement `pnpm dlx @wordpress/env run cli wp`.

### Step 2 — Lancer le gate

```bash
pnpm dlx @wordpress/env run cli wp eval-file <chemin>/builder-coverage.php
```

Surcharges optionnelles (sinon auto) :
- `BC_PREFIX=mau-` — préfixe des classes composant (auto-détecté par défaut).
- `BC_POST_TYPES=page,post,sc_service` — post types audités (publics par défaut).

Copier le script depuis `actions/scripts/builder-coverage.php` (le poser dans un
dossier accessible au conteneur, ex. `tools/qa/`).

### Step 3 — Lire le verdict

La sortie donne `COUVERTS`, `NON COUVERTS` (avec pages exemples) et une ligne
finale `GAPS: N`.

- `GAPS: 0` → couverture complète, rien à faire.
- `GAPS: N` → passer à `02-close-gaps` avec la liste.

### Step 4 — Écarter les faux positifs

Avant de traiter un gap, vérifier que ce n'est pas :
- une **variante** (`x--modifier`) dont la base est déjà couverte — le script
  normalise, mais recouper si doute ;
- un composant du **cache périmé** — relancer après `wp_clean_themes_cache()`.

## Output

Format plain-text, jamais de tableau markdown :

```
✅ builder-coverage — préfixe «mau-», 52 pages auditées
   Couverts   : 85
   Non couverts : 3
     - mau-contact-card        5 page(s)   ex: 180,181,159
     - mau-hero-stats          1 page(s)   ex: 141
     - mau-team-grid           1 page(s)   ex: 180
   → GAPS: 3 — lancer 02-close-gaps
```

Si `GAPS: 0` :

```
✅ builder-coverage — GAPS: 0, couverture complète
```
