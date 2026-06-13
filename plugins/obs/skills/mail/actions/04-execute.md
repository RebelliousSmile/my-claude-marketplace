# 04 - Execute

Apply a validated batch: classify, delete, merge, summarize, intact or flag-phishing.

## Inputs

- `validated_batch` — batch of decisions validated by the user from `03-propose`

## Outputs

- `batch_result` — summary of processed files, possible errors

## Process

### Sub-agent model

File operations use a sub-agent (`model: haiku`).

### Before any irreversible action (delete, merge, summarize, flag-phishing)

Copy the original into `.archive/YYYY-MM-DD/` (relative path preserved) before any modification.
`YYYY-MM-DD` = today's date.
Create the archive folder if absent.

### Action: classify

1. Determine the target branch (level 3) defined during `02-analyze`.
2. Create the destination folder if absent (including intermediate levels).
3. Move the file to the target branch (keep the file name).
4. Add `processed: true` in the frontmatter of the file at its final location.
5. Confirm the move in `batch_result`.

### Action: delete

1. Archive the original in `.archive/YYYY-MM-DD/<chemin-relatif>`.
2. Mark `processed: true` in the archive (not in the source file which will be deleted).
3. Delete the file from its current location.
4. Confirm in `batch_result`.

### Action: merge

Group all files of the same `merge_group` into a single merged file.

1. Archive all the originals in `.archive/YYYY-MM-DD/`.
2. Create the merged file:
   - Name: `email_<date_start>_<exp>_<sujet-normalisé>_thread.md`
   - Frontmatter:
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
   - Body: chronological list of the messages:
     ```
     - YYYY-MM-DD — Titre ou sujet spécifique — https://lien-si-présent
     ```
3. Place the merged file in the branch of the first original.
4. Delete the originals from their current locations.
5. Confirm in `batch_result`.

### Action: summarize

1. Archive the original in `.archive/YYYY-MM-DD/<chemin-relatif>`.
2. Identify the type according to the taxonomy (from the `02-analyze` decision):
   - `transactionnel` → keep: montant · référence · date · statut
   - `newsletter` → keep: date · titre · liens d'update
   - `notification` → keep: service · date · action requise si présente
   - `promotionnel` → keep: offre · date d'expiration si présente
3. Rewrite the file:
   - Full frontmatter kept (from/to/date/subject/tags) + add `processed: true`
   - Body replaced by the key data in Markdown list format
4. Confirm in `batch_result`.

### Action: intact

Modify nothing. Do not add `processed: true` (the file stays in the scope of subsequent sessions).
Mark the file as processed in `batch_result`.

### Inserting `processed: true` — case without YAML frontmatter

Some files have no `--- ... ---` block at the header (format `Tagged: #email`, Markdown title, etc.).
In that case, **create a minimal frontmatter** at the start of the file:

```markdown
---
processed: true
---

<contenu original inchangé>
```

Applies to all actions except `intact` and `delete`.

### Action: flag-phishing

1. Archive the original in `.archive/YYYY-MM-DD/<chemin-relatif>`.
2. Create `Publicités/Spam/Phishing/` if absent.
3. Move the file to `Publicités/Spam/Phishing/`.
4. Add to the frontmatter of the moved file: `processed: true` + `flagged: phishing`.
5. Confirm in `batch_result`.

## Intermediate report

After each batch, display:
```
Lot N exécuté :
- ✓ N fichiers traités
- ✗ N erreurs (si applicable)
```

## Test

- Each processed file has its result in `batch_result`.
- Every deleted or modified file has its original in `.archive/YYYY-MM-DD/`.
- All processed files (except `intact`) have `processed: true` in their final frontmatter.
- The `flag-phishing` files are in `Publicités/Spam/Phishing/` with `flagged: phishing`.
- The folders created by `classify` did not exist before the batch execution.
- The file merged by `merge` is in the right format (reduced frontmatter + list).
