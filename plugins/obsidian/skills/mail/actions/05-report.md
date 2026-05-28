# 05 - Report

Produire le rapport final de traitement de la session mail.

## Inputs

- `all_batch_results` — résultats cumulés de tous les lots exécutés

## Outputs

- Rapport affiché dans le chat

## Process

1. Agréger tous les `batch_result` de la session.

2. Afficher le rapport final :

```
## Rapport — Session mail du YYYY-MM-DD

### Actions effectuées
- Classements : N fichiers déplacés vers leurs branches
- Suppressions : N fichiers archivés et supprimés
- Fusions : N threads fusionnés (N fichiers → N fichiers fusionnés)
- Résumés : N fichiers réduits à leurs données clés
- Intouchés : N fichiers marqués preserve

### Branches créées
- <Niveau1>/<Niveau2>/<Niveau3> (si nouvelles branches créées)

### Fichiers ignorés ou passés
- N lots passés sans exécution

### Archive
Originaux archivés dans : Thunderbird/.archive/YYYY-MM-DD/

### Suggestions mail-config.yaml
Si de nouveaux patterns d'expéditeurs ont été identifiés lors de la session
(ex: expéditeur systématiquement supprimé, domaine systématiquement preserve),
proposer d'ajouter les règles correspondantes dans mail-config.yaml.
```

3. Si des suggestions mail-config.yaml sont pertinentes, présenter les règles à ajouter
   et demander confirmation avant de modifier le fichier.

## Test

- Le rapport affiche les 5 catégories d'actions avec leurs compteurs.
- Les branches créées sont listées.
- Les suggestions mail-config.yaml sont proposées si des patterns répétitifs ont été détectés.
