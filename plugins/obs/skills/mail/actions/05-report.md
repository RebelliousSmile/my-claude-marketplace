# 05 - Report

Produce the final processing report and add it to the cumulative log.

## Inputs

- `all_batch_results` — accumulated results of all executed batches
- `analyze_summary` — anomalies detected by `02-analyze` (duplicates, epoch, phishing)
- `prelim_report` — preliminary report from `01-scan`

## Outputs

- Report displayed in the chat
- Entry prepended at the top of `mail-sessions.log.md`

## Process

1. Aggregate all the `batch_result` of the session.

2. Display the final report:

```
## Rapport — Session mail du YYYY-MM-DD

### Actions effectuées
- Classements : N fichiers déplacés vers leurs branches
- Suppressions : N fichiers archivés et supprimés
  dont doublons : N
- Fusions : N threads fusionnés (N fichiers → N fichiers fusionnés)
- Résumés : N fichiers réduits à leurs données clés
- Intouchés : N fichiers (preserve — non marqués processed)
- Phishing détecté : N fichiers déplacés vers Publicités/Spam/Phishing/

### Branches créées
- <Niveau1>/<Niveau2>/<Niveau3>
- (aucune si rien)

### Fichiers ignorés ou passés
- N lots passés sans exécution

### Anomalies signalées
- Fichiers avec date epoch (1970-01-01) : N — à vérifier manuellement
- Fichiers ATrier/ traités : N

### Archive
Originaux archivés dans : Thunderbird/.archive/YYYY-MM-DD/
```

3. **Write the entry into `mail-sessions.log.md`** (append mode — prepend at the top):
   - Create the file if absent
   - Add the following entry at the start of the file (before existing entries):

```markdown
## Session YYYY-MM-DD HH:MM — <périmètre>

- Classify : N · Delete : N · Merge : N · Summarize : N · Intact : N · Phishing : N
- Doublons supprimés : N
- Fichiers epoch signalés : N
- Branches créées : <liste ou "aucune">

---
```

4. If any mail-config.yaml suggestions are relevant (repetitive patterns identified), present the rules to add and ask for confirmation before modifying the file.

## Test

- The report displays the 6 action categories with their counters.
- `mail-sessions.log.md` contains the new entry at the top.
- The previous entries in `mail-sessions.log.md` are preserved.
- The mail-config.yaml suggestions are proposed if patterns are detected.
