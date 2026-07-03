# 03 — Digest

Consolidation destructive : extraire les données structurées de N fichiers homogènes en un seul fichier de contenu, puis supprimer les sources. Le fichier produit est un fichier de données réel (tableau, liste structurée), pas un résumé par-dessus les originaux.

Utiliser quand un groupe de fichiers sont des instances répétitives du même événement, de type identifié et toujours structuré de la même façon (notifications système, alertes automatiques, entrées de log), et que la valeur est entièrement capturée par des champs structurés (date, statut, montant, ID…).

**Ne pas utiliser sur des messages rédigés par un humain** : même si les fichiers sont structurellement homogènes (même frontmatter, même forme), le corps d'un message humain est un texte libre porteur de sens, non réductible à des colonnes. Utiliser `synthesize` à la place — voir la garde à l'étape 3 du Process.

## Inputs
- `path` (required) — répertoire source
- `filter` (required) — critère pour identifier le groupe homogène : glob (ex. `rapport-hebdo-*.md`), valeur de champ frontmatter (ex. `type:notification`), pattern de nom de fichier, ou description libre (ex. "les fichiers de taille ~400 octets avec un sujet identique")
- `output` (optional) — nom du fichier de sortie. Défaut : nom descriptif inféré du groupe et de la plage de dates. Le niveau de sortie dépend de la nature du contenu : si le groupe est temporel et localisé dans un bucket YYYY/MM, rester dans ce bucket ; si le groupe est transversal, remonter à `<Subcategory>`.
- `schema` (optional) — colonnes à extraire si non inférables automatiquement

## Outputs
- 1 fichier de contenu structuré (tableau markdown) au niveau `<Subcategory>`
- Suppression des fichiers sources après confirmation

## Process
1. Résoudre le niveau `<Subcategory>` depuis `path` (règle T8 de SKILL.md).
2. Identifier les fichiers correspondant à `filter`.
3. Inférer le schéma de données depuis un échantillon (3-5 fichiers) : quels champs sont stables, quels champs varient, quelles données sont dans le frontmatter vs le corps. **Garde** : si un champ variable est un texte libre rédigé par un humain et porteur de l'information (pas une valeur classable dans une colonne), le groupe n'est pas un candidat `digest` — arrêter, expliquer pourquoi, et proposer `synthesize` à la place, même si les fichiers sont structurellement homogènes.
4. Afficher le schéma inféré et attendre validation avant d'aller plus loin.
5. Extraire les données de tous les fichiers ; trier par date ASC.
6. Construire le fichier de sortie :
   - Frontmatter : `title`, `type: tracking`, `source`, `count`, `date_range`
   - Corps : tableau markdown avec une ligne par fichier source
7. Afficher un aperçu (5 premières lignes + total) et le chemin de sortie prévu.
8. Demander confirmation finale : "Écrire `<chemin>` et supprimer les `N` fichiers sources ?"
9. Exécuter uniquement après confirmation : écrire le fichier, supprimer les sources. Rediriger ou signaler toute référence `[[…]]` entrante vers une source supprimée — jamais la laisser pendante (règle 11 de SKILL.md).
10. Rapport : nb lignes extraites, nb fichiers supprimés, chemin du fichier produit.

## Test
Le fichier de sortie existe dans `<Subcategory>/`, contient un tableau avec autant de lignes que de fichiers sources traités, et aucun fichier source correspondant au filtre ne subsiste dans `path`.
