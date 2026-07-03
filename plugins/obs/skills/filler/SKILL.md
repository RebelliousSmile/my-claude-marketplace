---
name: filler
description: Manage content files in any directory — inventory, sort, summarize, merge, and clean. Use when the user points to a folder and wants to triage, reorganize, distill, or consolidate its files. Do NOT use for structured Obsidian project lifecycle (use project), email triage (use mail), or Documents/ tree management (use tree).
---

# obs:filler — Gestion de fichiers de contenu

Opère sur n'importe quel répertoire de fichiers de contenu : inventorier ce qui s'y trouve, le classer, produire des résumés, fusionner des fichiers sélectionnés en un seul, ou éliminer les entrées redondantes et obsolètes.

## Philosophie

L'objectif n'est pas l'organisation — c'est la **réduction continue**.

Le contenu a un cycle de vie : ce qui est essentiel aujourd'hui devient superflu demain. `filler` accompagne ce cycle sans chercher à le figer :

1. **Arrivée** — fichiers bruts, hétérogènes, bruités
2. **Tri** — regrouper par entité pour rendre le volume lisible
3. **Digest** — N fichiers homogènes de contenu identifié (notifications, logs) → 1 fichier de données (suppression des sources) ; jamais sur des messages humains, voir `synthesize`
4. **Condense** — 1 fichier verbeux → son essence (suppression du bruit)
5. **Déclin** — l'essence elle-même vieillit et peut être supprimée

Il n'existe pas d'état final "rangé". Chaque passage de `filler` sur un répertoire doit laisser moins de fichiers, moins de mots, et plus de signal. Un fichier qui survit à plusieurs passes a prouvé sa valeur.

## Available actions

| # | Action | Rôle | Entrée |
|---|--------|------|--------|
| 01 | `survey` | Inventorier le répertoire : nb fichiers, types, plage de dates, word count, flags | `<path>` |
| 02 | `sort` | Regrouper par entité/date/type/topic — scheme `entity` produit aussi un triage par répertoire | `<path>` [scheme] |
| 03 | `digest` | Consolidation destructive : N fichiers homogènes de contenu identifié (notifications/logs) → 1 fichier de données, sources supprimées — jamais sur des messages humains | `<path>` `<filter>` |
| 04 | `index` | Créer un fichier d'index/MOC au niveau `<Subcategory>` avec wikilinks groupés | `<path>` [group-by] |
| 05 | `merge` | Concaténer les fichiers sélectionnés en un document consolidé avec TOC | `<path>` [glob\|list] |
| 06 | `clean` | Identifier et supprimer ou archiver les fichiers selon des critères (vide, doublon, vieux, orphelin) | `<path>` [criteria] |
| 07 | `condense` | Distiller un fichier en place : préserver code/data/images, résumer les idées, éliminer le verbiage | `<path>` [filter] [--dry-run] |
| 08 | `synthesize` | N emails/communications → 1 document d'information, sources supprimées — la forme email disparaît | `<path>` `<filter>` [--keep-sources] |

## Default flow

Point d'entrée par défaut : `survey`, sauf si l'utilisateur nomme explicitement une action.

| L'utilisateur dit | Action |
|-------------------|--------|
| "inventorie / liste / qu'est-ce qu'il y a" | `survey` |
| "trie / classe / organise / range / par expéditeur / par entité" | `sort` |
| "consolide / agrège / groupe en un fichier de données" | `digest` |
| "indexe / crée un index / MOC / liste les liens" | `index` |
| "rassemble / fusionne / merge / consolide" | `merge` |
| "nettoie / supprime / archive / purge" | `clean` |
| "condense / distille / résume / allège / réduis" | `condense` |
| "synthétise / regroupe en un document / transforme en note / extrait l'information" | `synthesize` |
| (chemin seul, sans verbe) | `survey` |

Pipeline recommandé pour un nouveau répertoire : `survey → sort entity → digest (groupes homogènes) → synthesize (threads/topics) → condense (fichiers verbeux résiduels) → clean`

## Transversal rules

1. **Résolution de chemin** — Accepter les chemins absolus, relatifs au vault root, ou `~/…`. Résoudre et confirmer avant d'opérer.
2. **Dry run obligatoire** — Pour les actions destructives (`sort`, `clean`), toujours afficher un plan et attendre une confirmation avant de déplacer ou supprimer quoi que ce soit.
3. **Pas d'écrasement silencieux** — Si un fichier cible existe déjà, ajouter un suffixe numérique déterministe plutôt qu'écraser.
4. **Portée limitée** — N'opérer que sur les fichiers directement dans le répertoire donné, sauf si l'utilisateur dit explicitement "récursivement" ou "sous-dossiers inclus".
5. **Langue** — Produire les résumés et en-têtes de digest dans la langue du contenu des fichiers.
6. **Frontmatter aware** — Lire le frontmatter YAML quand il est présent ; utiliser ses champs `date`, `title`, `tags` pour informer le tri et le digest.
7. **Préserver vs consolider** — `merge` et `index` ne touchent jamais les sources. `digest` est l'unique action qui supprime des fichiers sources : c'est son but — remplacer N fichiers homogènes par 1 fichier de données. `index` ne duplique aucun contenu — il contient uniquement des wikilinks et des descriptions courtes.
8. **Répertoire de travail** — Les fichiers produits par la skill (digest, merged, archive) sont placés au niveau `<Subcategory>` du tree `Perso|Pro/<Category>/<Subcategory>/` et préfixés par `_`. Si `path` est un sous-répertoire `YYYY/MM`, remonter de 2 niveaux. Si la structure ne correspond pas au tree, écrire dans `path/` avec préfixe `_`. Créer le répertoire cible si nécessaire.
9. **Minimalisme des artefacts** — Ne jamais produire de fichier de sortie sans que l'utilisateur l'ait explicitement demandé. `survey` est toujours console-only. `clean` supprime par défaut (pas d'archivage automatique). Tout fichier produit est soit un fichier de contenu réel (`digest`, `merge`), soit un fichier de navigation (`index`) — jamais une couche de résumé posée par-dessus des sources inchangées. L'objectif est de ne pas générer de nouveaux fichiers à nettoyer ensuite.
10. **Format de rapport** — Terminer chaque action par un bloc rapport compact : ce qui a été trouvé / déplacé / écrit / supprimé, et les ambiguïtés laissées en suspens.
11. **Intégrité des liens au déplacement** — Ne jamais déplacer, renommer ou supprimer un fichier en laissant un lien cassé. Lors d'un déplacement (`sort`) ou d'une consolidation (`merge`), mettre à jour tout wikilink (`[[…]]`), embed (`![[…]]`) et chemin relatif de pièce jointe (images, PDF, autres assets) qui pointe vers le fichier ou qu'il référence — co-déplacer les assets si nécessaire — et vérifier qu'aucune référence pendante ne subsiste. Une action destructive (`digest`/`synthesize`/`clean`) doit rediriger ou signaler les références vers une source supprimée, jamais les laisser pointer dans le vide.
