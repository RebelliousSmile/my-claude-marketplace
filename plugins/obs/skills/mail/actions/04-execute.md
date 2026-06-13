# 04 - Execute

Appliquer un lot validé : classify, delete, merge, summarize, intact ou flag-phishing.

## Inputs

- `validated_batch` — lot de décisions validé par l'utilisateur depuis `03-propose`

## Outputs

- `batch_result` — résumé des fichiers traités, erreurs éventuelles

## Process

### Modèle sous-agent

Les opérations fichiers utilisent un sous-agent (`model: haiku`).

### Avant toute action irréversible (delete, merge, summarize, flag-phishing)

Copier l'original dans `.archive/YYYY-MM-DD/` (chemin relatif préservé) avant toute modification.
`YYYY-MM-DD` = date du jour.
Créer le dossier d'archive si absent.

### Action : classify

1. Déterminer la branche cible (niveau 3) définie lors de `02-analyze`.
2. Créer le dossier destination si absent (y compris les niveaux intermédiaires).
3. Déplacer le fichier vers la branche cible (conserver le nom de fichier).
4. Ajouter `processed: true` dans le frontmatter du fichier à son emplacement final.
5. Confirmer le déplacement dans `batch_result`.

### Action : delete

1. Archiver l'original dans `.archive/YYYY-MM-DD/<chemin-relatif>`.
2. Marquer `processed: true` dans l'archive (pas dans le fichier source qui sera supprimé).
3. Supprimer le fichier de son emplacement courant.
4. Confirmer dans `batch_result`.

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
     processed: true
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
   - Frontmatter complet conservé (from/to/date/subject/tags) + ajouter `processed: true`
   - Corps remplacé par les données clés au format liste Markdown
4. Confirmer dans `batch_result`.

### Action : intact

Ne rien modifier. Ne pas ajouter `processed: true` (le fichier reste dans le périmètre des sessions suivantes).
Marquer le fichier comme traité dans `batch_result`.

### Insertion de `processed: true` — cas sans frontmatter YAML

Certains fichiers n'ont pas de bloc `--- ... ---` en en-tête (format `Tagged: #email`, titre Markdown, etc.).
Dans ce cas, **créer un frontmatter minimal** en début de fichier :

```markdown
---
processed: true
---

<contenu original inchangé>
```

S'applique à toutes les actions sauf `intact` et `delete`.

### Action : flag-phishing

1. Archiver l'original dans `.archive/YYYY-MM-DD/<chemin-relatif>`.
2. Créer `Publicités/Spam/Phishing/` si absent.
3. Déplacer le fichier vers `Publicités/Spam/Phishing/`.
4. Ajouter dans le frontmatter du fichier déplacé : `processed: true` + `flagged: phishing`.
5. Confirmer dans `batch_result`.

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
- Tous les fichiers traités (sauf `intact`) ont `processed: true` dans leur frontmatter final.
- Les fichiers `flag-phishing` sont dans `Publicités/Spam/Phishing/` avec `flagged: phishing`.
- Les dossiers créés par `classify` n'existaient pas avant l'exécution du lot.
- Le fichier fusionné par `merge` est au bon format (frontmatter réduit + liste).
