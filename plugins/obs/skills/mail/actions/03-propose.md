# 03 - Propose

Group decisions into thematic batches, present them to the user, and wait for batch-by-batch validation.

## Inputs

- `decisions` — list of decisions from `02-analyze`
- `batch_index` (internal) — index of the current batch (starts at 0, incremented at each call)

## Outputs

- `validated_batch` — validated batch ready for `04-execute`
- `remaining_decisions` — decisions not yet processed

## Process

1. **Group the decisions into thematic batches**:
   - A batch = a coherent group of similar actions. Examples of natural groupings:
     - "Suppression — 12 emails Klaviyo/spam"
     - "Fusion — 3 threads Patreon (Miska's Cyberpunk Maps)"
     - "Classement — 5 emails en racine"
     - "Résumé — 8 newsletters BNP"
   - Batches can contain a **global rule** if a single action applies to all emails from a sender or a branch (e.g. "supprimer tous les mails de klaviyo.com"). State the rule explicitly.
   - Target batch size: 5 to 20 files. Adapt according to thematic coherence.

2. **Present the current batch** with this format:

   ```
   ## Lot N/Total — <Titre du lot>

   Action : <action>
   Fichiers concernés (N) :
   - <nom_fichier>
     From: <from> | Date: <YYYY-MM-DD> | Sujet: <subject tronqué à 60 chars>
     → <branche cible si classify, sinon action>
   - ...

   [Si règle globale] Règle appliquée : <description de la règle>

   Valider ce lot ? (oui / non / modifier / passer)
   ```

3. **Wait for the user's response**:
   - `oui` → return `validated_batch` for `04-execute`, then come back to `03-propose` with the next batch
   - `non` → abandon this batch, move to the next
   - `modifier` → ask for the modifications, reformulate the batch, re-present
   - `passer` → skip to the next batch without executing

4. **Repeat** until all batches are exhausted.

5. When all batches have been processed → trigger `05-report`.

## Test

- Each batch clearly displays: action, file list, destination if applicable.
- Each file displays from, date and subject (truncated to 60 chars).
- The user can reject or modify a batch without blocking the following ones.
- No batch is executed without explicit confirmation.
