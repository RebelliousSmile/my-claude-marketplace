# 03-lint-instances

## Rôle

Linter le contenu **existant** (instances en DB, pages publiées, templates hérités) contre le contrat figé. Puis dérouler la boucle **corriger → propager → re-lint** jusqu'à gate vert. C'est l'outil de réconciliation pour la migration legacy et pour les re-figeages successifs.

## Pourquoi c'est nécessaire

Le lint fichiers (Gate 3, pre-commit) couvre les commits futurs. Il ne couvre pas :
- Le contenu existant en DB (WordPress : block patterns stockés en `wp_posts.post_content`).
- Les pages qui n'ont pas été recommittées depuis l'introduction du gate.
- Les compositions héritées qui contiennent des classes pré-manifeste.

## Approche selon la stack

### WordPress (stack principale)

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

### Autres stacks

Pour les templates HTML/PHP/Twig/Nunjucks non-WP :

```bash
# Linter tous les templates
find src/templates -name '*.html' | xargs -I{} node design/lint/lint-core.mjs {}
```

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
