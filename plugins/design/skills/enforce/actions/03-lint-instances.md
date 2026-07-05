# 03-lint-instances

Track: app-JS-modern (flux file-lint, first-class ci-dessous) · Track: WP-maquette (flux DB-lint `wp post get`).
Un projet app-JS-modern peut lire ce fichier sans jamais rencontrer le flux WP : les deux
sections `## Track: …` sont indépendantes, seule la boucle corriger→propager→re-lint est partagée.

## Rôle

Linter le contenu **existant** (instances en DB, pages publiées, templates hérités, fichiers
composants versionnés) contre le contrat figé. Puis dérouler la boucle **corriger → propager →
re-lint** jusqu'à gate vert. C'est l'outil de réconciliation pour la migration legacy et pour
les re-figeages successifs.

## Pourquoi c'est nécessaire

Le lint fichiers (Gate 3, pre-commit) couvre les commits futurs. Il ne couvre pas :
- Le contenu existant en DB (WordPress : block patterns stockés en `wp_posts.post_content`), **ou**
  les fichiers composants versionnés qui existaient déjà avant l'introduction du gate (app-JS-modern).
- Les pages/fichiers qui n'ont pas été recommittés depuis l'introduction du gate.
- Les compositions héritées qui contiennent des classes/usages pré-manifeste.

## Track: app-JS-modern

Terrain : Vue/React/Tailwind (ou tout langage sans DB de contenu) — les instances à linter sont
des **fichiers composants versionnés**, pas des exports DB. Pas de CLI conteneur, pas de
réimport — seulement lint → corriger → re-lint sur le code source.

### Stack utility-first (Tailwind/Vue/React)

Quand `components.json § mode` est `utility-first` (ou auto-détecté ainsi — `components` vide/absent), les instances à linter ne sont **pas** des wireframes HTML mais les fichiers composants du projet. Les cibles doivent couvrir `**/*.{vue,jsx,tsx,html}`, pas seulement le HTML :

```bash
# Linter tous les composants (mode utility-first) — raw-hex + namespaces de couleur
find src -type f \( -name '*.vue' -o -name '*.jsx' -o -name '*.tsx' -o -name '*.html' \) \
  -exec node design/lint/lint-core.mjs {} \;
```

Dans ce mode, `lint-core.mjs` n'exécute jamais la règle de vocabulaire BEM (aucune classe BEM n'existe dans le code) — la boucle corriger→propager→re-lint porte sur les violations `usage` (couleur hex brute, namespace de couleur hors contrat), pas sur des classes composant inconnues.

### Autres stacks non-WP (BEM)

Pour les templates HTML/PHP/Twig/Nunjucks non-WP en mode `bem` :

```bash
# Linter tous les templates
find src/templates -name '*.html' | xargs -I{} node design/lint/lint-core.mjs {}
```

## Track: WP-maquette

Terrain : WordPress FSE — le contenu vit en DB (`wp_posts.post_content`), le lint fichiers seul
ne le couvre jamais ; ce track exporte, linte, corrige puis réimporte.

Voir `${CLAUDE_PLUGIN_ROOT}/skills/enforce/adapters/wordpress.md` pour les commandes complètes. Résumé :

**1. Exporter le contenu HTML des pages concernées :**

```bash
# Via le CLI du conteneur (règle absolue — jamais wp-cli local)
pnpm dlx @wordpress/env run cli wp post get <ID> --field=post_content --format=json > /tmp/post-<ID>.html
```

**2. Linter l'export :**

```bash
node design/lint/lint-core.mjs /tmp/post-<ID>.html
```

**3. Corriger** : modifier le contenu (Gutenberg ou script PHP) pour n'utiliser que les classes du manifeste.

**4. Propager** : si le contenu est un block pattern (stocké dans la bibliothèque), mettre à jour la source et réimporter.

**5. Re-lint** : vérifier que l'export mis à jour est propre.

Répéter pour chaque page/post en violation.

## La boucle corriger → propager → re-lint

```
lint DB/instances
    │
    ├── 0 erreur → gate vert ✓
    │
    └── N erreurs
          │
          ├── Corriger le contenu source (Gutenberg / template / script)
          │
          ├── Propager (block pattern → réimporter ; template → redéployer)
          │
          └── Re-lint → recommencer
```

La boucle est déclarée terminée quand **tous les fichiers HTML testés sortent en exit 0**.

## Gestion des cas non réconciliables

Certains contenus legacy peuvent utiliser des classes non reprises dans le nouveau manifeste, et la correction immédiate n'est pas réaliste (pages publiées, contenu client). Dans ce cas :

1. Documenter la violation dans `design-system.md § Open questions` : `[héritage — classe X non réconciliée, date, raison]`.
2. Créer un ticket de dette technique.
3. Le gate pre-commit (nouveaux commits) reste armé ; seul le contenu existant non modifié est exempté temporairement.

## Pièges à éviter

Voir `${CLAUDE_PLUGIN_ROOT}/references/wordpress-pitfalls.md` pour les pièges spécifiques à WordPress (classes appariées `has-background` / `has-text-color`, `wp eval-file` deprecated, NFC/NFD sur Windows).

## Sortie attendue

> Lint instances terminé : N fichiers testés, M violations résolues, K exemptions documentées.
> Gate instances : [vert / rouge avec liste des exemptions].
