# `R/bank.yml` — manifeste (cache) des ressources globales du domaine

Catalogue des **ressources globales / durables** disponibles dans un domaine `R` (niveau `subcategory`). Posé **à la racine de `R`** (`R/bank.yml`), il liste ce qui vit dans `R` (typiquement sous `R/_univers/`, `R/_systeme/`, etc.) et que plusieurs projets peuvent réutiliser.

> **C'est un cache, maintenu par `obs:tree`.** Comme `_tree/cache.json`, `R/bank.yml` est **dérivé du scan de `R/_univers/`, `R/_systeme/`, etc.** et **régénérable** — `tree` le (re)génère. Raison : l'arborescence globale (dont `R`) est la responsabilité de `tree`.

## Emplacement et périmètre

- **Au niveau `R`** (domaine) : `R/bank.yml`. **Jamais dans le projet** (`<projet>/` n'a pas de `bank.yml`).
- Chemins **locaux à `R`** (jamais absolus/globaux).

## Format

```yaml
# R/bank.yml — ressources globales disponibles dans ce domaine.
# profile: déclare le profil de layout (ex. jdr), lu par obs:research pour la détection de profil.
domain: <slug>           # ex. zombiology

resources:
  - id: factions          # slug stable
    kind: lore            # lore | rules | reference | data | style
    path: _univers/<univers>/canon/factions.md   # local à R
    summary: "Les factions majeures de l'univers et leurs rapports de force."
    tags: [univers, canon]            # optionnel

  - id: systeme-core
    kind: rules
    path: _systeme/canon/core.md
    summary: "Règles de résolution de base du système de jeu."
```

- **`summary`** est l'élément clé : il permet à l'humain de **juger la pertinence** d'une ressource pour un projet donné, sans tout ouvrir.
- **`kind`** catégorise la ressource (lore/règles/données/style).

## Cycle de vie

- **Maintenu par** `obs:tree` : `tree index` scanne `R/_univers/`, `R/_systeme/`, etc. et (re)génère `R/bank.yml` — entrées `id`/`kind`/`path` déduites du scan, `summary` au mieux depuis le titre/premières lignes de chaque fichier. **Régénérable** : c'est un cache dérivé des répertoires durables de `R`, pas une source de vérité.
- **Fusion non destructive au re-scan** : un `summary` curé (édité à la main, ou enrichi plus tard par `research`) est **préservé** ; `tree` ajoute les nouvelles ressources et signale celles disparues, sans écraser les descriptions curées.
- **Consommé par** `obs:research` : la clé `profile:` déclare le profil de layout (ex. `jdr`), lue pour la détection de profil.
