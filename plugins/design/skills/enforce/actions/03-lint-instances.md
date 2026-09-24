# Lint-instances

Track: fichiers source (lint direct) · Track: contenu stocké (extraire, linter, réécrire).
Les deux sections `## Track: …` sont indépendantes : un projet dont tout le markup est versionné
ne lit jamais la seconde. Seule la boucle corriger→propager→re-lint est partagée.

## Rôle

Linter le contenu **existant** — instances déjà stockées, pages publiées, gabarits hérités,
fichiers composants versionnés — contre le contrat figé. Puis dérouler la boucle **corriger →
propager → re-lint** jusqu'à gate vert. C'est l'outil de réconciliation pour la migration legacy
et pour les re-figeages successifs.

## Pourquoi c'est nécessaire

Le lint fichiers (Gate 3, pre-commit) couvre les commits futurs. Il ne couvre pas :
- Le contenu déjà stocké hors des fichiers source, **ou** les fichiers qui existaient déjà avant
  l'introduction du gate.
- Les pages/fichiers qui n'ont pas été recommittés depuis l'introduction du gate.
- Les compositions héritées qui contiennent des classes/usages pré-manifeste.

## Track: fichiers source

Terrain : tout le markup à linter est dans des fichiers versionnés. Ni extraction, ni réécriture —
seulement lint → corriger → re-lint sur la source.

Les cibles se déduisent des extensions réellement présentes, pas d'une liste supposée :

```bash
# Plusieurs fichiers par invocation : contrat lu une fois, un verdict par fichier
find src -type f \( -name '*.html' -o -name '*.vue' -o -name '*.jsx' -o -name '*.tsx' \) \
  -exec node design/lint/lint-core.mjs --contract design {} +
```

Ce que la boucle corrige dépend de `policies.json § mode` :

| `mode` | Ce que le linter signale sur ces fichiers |
|---|---|
| `bem` | classes de composant hors manifeste, plus les violations `usage` |
| `utility-first` | violations `usage` seules (couleur littérale, namespace de couleur hors contrat) — la règle de vocabulaire BEM ne s'exécute jamais, aucune classe BEM n'existant dans le code |

## Track: contenu stocké

Terrain : une part du markup vit dans un magasin de contenu — base, CMS, API — donc hors du
disque au moment du lint. C'est le type d'enforcement `stored-content`
(`${DESIGN_PLUGIN_ROOT}/references/enforcement-registry.md`). Le linter portable ne peut pas
l'atteindre seul : il faut l'extraire en fichiers d'abord.

L'outillage d'extraction et de réécriture appartient au runtime du magasin, donc au réceptacle
`sc-<langage du runtime>:design-bridge`, qui le documente chez lui. Le cycle, lui, est invariant :

**1. Extraire** l'instance en un fichier de markup, via l'outillage du runtime.

**2. Linter l'extrait :**

```bash
node design/lint/lint-core.mjs <extrait>.html --contract design
```

**3. Corriger à la source** de l'instance — jamais le magasin directement : une édition du
magasin est écrasée à la prochaine génération et n'existe pas dans l'historique.

**4. Réécrire** l'instance depuis sa source corrigée.

**5. Re-linter** l'extrait mis à jour.

Répéter pour chaque instance en violation.

Ce track produit un verdict que le gate ne voit pas de lui-même : les règles `stored-content`
sont rendues au runner par le rapport de pivot du réceptacle
(`${DESIGN_PLUGIN_ROOT}/references/gate-config-schema.md § Rapport de pivot`). Sans instance
extraite, elles s'écrivent `unrealized` — un `pass` y mentirait sur du contenu jamais ouvert.

## La boucle corriger → propager → re-lint

```
lint des instances
    │
    ├── 0 erreur → gate vert ✓
    │
    └── N erreurs
          │
          ├── Corriger à la source de l'instance
          │
          ├── Propager (instance stockée → réécrire ; fichier → redéployer)
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

Les pièges propres à un magasin de contenu — classes que sa plateforme génère par paires, outillage
d'accès obligatoire, normalisation des noms de fichiers extraits — appartiennent au réceptacle qui
le sert et sont documentés chez lui.

Un seul est transverse : une classe générée par la plateforme et non déclarée au manifeste se
tranche **dans le contrat**, en la déclarant ou en l'excluant explicitement, jamais en corrigeant
le linter dérivé — un linter patché à la main cesse de dériver du contrat, et la prochaine
re-dérivation efface le correctif sans rien signaler.

## Sortie attendue

> Lint instances terminé : N fichiers testés, M violations résolues, K exemptions documentées.
> Gate instances : [vert / rouge avec liste des exemptions].
