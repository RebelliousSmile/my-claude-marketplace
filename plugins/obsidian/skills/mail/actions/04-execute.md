# 04 - Execute

Appliquer un lot validé : classify, delete, merge, summarize ou intact.

## Inputs

- `validated_batch` — lot de décisions validé par l'utilisateur depuis `03-propose`

## Outputs

- `batch_result` — résumé des fichiers traités, erreurs éventuelles

## Process

### Avant toute action irréversible (delete, merge, summarize)

Copier l'original dans `.archive/YYYY-MM-DD/` (chemin relatif préservé) avant toute modification.
`YYYY-MM-DD` = date du jour.
Créer le dossier d'archive si absent.

### Action : classify

1. Déterminer la branche cible (niveau 3) définie lors de `02-analyze`.
2. Créer le dossier destination si absent (y compris les niveaux intermédiaires).
3. Déplacer le fichier vers la branche cible (conserver le nom de fichier).
4. Confirmer le déplacement dans `batch_result`.

### Action : delete

1. Archiver l'original dans `.archive/YYYY-MM-DD/<chemin-relatif>`.
2. Supprimer le fichier de son emplacement courant.
3. Confirmer dans `batch_result`.

### Action : merge

Regrouper tous les fichiers du même `merge_group` en un seul fichier fusionné.

1. Archiver tous les originaux dans `.archive/YYYY-MM-DD/`.
2. Créer le fichier fusionné :
   - Nom : `email_<date_start>_<exp>_<sujet-normalisé>_thread.md`
   - Frontmatter :
     ```yaml
     from: <from commun>
     to: <to commun>
     date_start: <date du plus ancien>
     date_end: <date du plus récent>
     subject: <subject normalisé>
     thread_count: <N>
     attachments: <union des attachments>
     ```
   - Corps : liste chronologique des messages :
     ```
     - YYYY-MM-DD — Titre ou sujet spécifique — https://lien-si-présent
     ```
3. Placer le fichier fusionné dans la branche du premier original.
4. Supprimer les originaux de leurs emplacements courants.
5. Confirmer dans `batch_result`.

### Action : summarize

1. Archiver l'original dans `.archive/YYYY-MM-DD/<chemin-relatif>`.
2. Identifier le type selon la taxonomie (depuis la décision `02-analyze`) :
   - `transactionnel` → conserver : montant · référence · date · statut
   - `newsletter` → conserver : date · titre · liens d'update
   - `notification` → conserver : service · date · action requise si présente
   - `promotionnel` → conserver : offre · date d'expiration si présente
3. Réécrire le fichier :
   - Frontmatter complet conservé (from/to/date/subject/tags)
   - Corps remplacé par les données clés au format liste Markdown
4. Confirmer dans `batch_result`.

### Action : intact

Ne rien modifier. Marquer le fichier comme traité dans `batch_result`.

## Rapport intermédiaire

Après chaque lot, afficher :
```
Lot N exécuté :
- ✓ N fichiers traités
- ✗ N erreurs (si applicable)
```

## Test

- Chaque fichier traité a son résultat dans `batch_result`.
- Tout fichier supprimé ou modifié a son original dans `.archive/YYYY-MM-DD/`.
- Les dossiers créés par `classify` n'existaient pas avant l'exécution du lot.
- Le fichier fusionné par `merge` est au bon format (frontmatter réduit + liste).
