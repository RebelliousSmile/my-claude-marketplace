# Digest — Matrice d'agrégation

Format uniforme produit par l'action `digest`. Seule la section **Données** varie selon le contenu ; toutes les autres sections sont obligatoires et suivent la même structure.

## Frontmatter standard

```yaml
---
title: <titre descriptif incluant la plage de dates si pertinente>
type: digest
subtype: <tracking | log | inventory | activity | financial | custom>
source: <glob ou description du filtre appliqué>
count: <nb de fichiers sources consolidés>
date_range: <YYYY-MM-DD> / <YYYY-MM-DD>
aggregated_at: <YYYY-MM-DD>
---
```

Champs obligatoires : `title`, `type`, `source`, `count`, `aggregated_at`.
Champs optionnels : `subtype`, `date_range`.

## Section Résumé

2 à 4 phrases de contexte : qui, quoi, sur quelle période, sur quel périmètre. Ne pas répéter les statistiques (elles ont leur propre section). Rédigé dans la langue du contenu source.

## Section Données

Table markdown, une ligne par enregistrement source. Règles de construction :

**Colonnes**
- **Clé temporelle** (date, datetime) → première colonne, séparée en `Date` + `Heure` si les deux sont disponibles
- **Champs de classification** (machine, type, catégorie) → colonnes suivantes
- **Champs d'identité** (id, référence, code) → colonnes suivantes
- **Champs descriptifs** (nom, libellé) → colonnes suivantes, tronqués à 40 caractères si nécessaire
- **Champs stables** (même valeur dans tous les fichiers sources) → exclus de la table, mentionnés en frontmatter ou dans le Résumé

**Tri** : par clé temporelle ASC par défaut ; sinon par premier champ de classification.

**Seuil** : si > 500 lignes, regrouper par unité temporelle supérieure (heure → jour, jour → semaine) et indiquer le count par groupe.

## Section Statistiques

Agrégats calculés depuis la table de données. Toujours présents, même si simples.

Structure type :
```
- **Total** : N entrées · X <classif1> distincts · Y <classif2> distincts
- **Par <classif1>** : <val1> — N · <val2> — N · …
- **<Classif2> récurrents (≥ seuil)** : <val> (N×) · …
- **Période la plus dense** : <période> (N entrées)
```

Adapter les libellés au domaine. Inclure uniquement les agrégats qui ont une valeur analytique réelle.

## Règles générales

- Ne jamais reproduire le contenu verbatim des fichiers sources dans la table : extraire uniquement les champs structurés.
- Si un champ n'est pas extractible de façon fiable depuis un fichier, laisser la cellule vide (ne pas inventer).
- Le fichier digest est autonome : il doit être lisible sans les fichiers sources (qui seront supprimés).
