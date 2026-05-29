# 02 - Restructure All

Restructure all rules files in the project's rules-files directory.

> **Position dans le pipeline** : restructure les sources de référence de règles (`<systeme-root>/sources/<source>/rules.md`) ou les fichiers de règles listés dans `bank.yml`. Les outputs atterrissent dans `<systeme-root>/canon/` (ou `<subsys-root>/canon/`).
> Voir `@setup/references/vault-layout.md` pour la convention complète.

## Inputs

*(no argument — reads rules-files paths from bank.yml)*

## Process

### Step 1 — Locate rules files

Locate `bank.yml` by searching in order: current working directory → parent directories up to project root. Use the first `bank.yml` found.

Read `bank.yml`. Extract all paths under `rules-files` (including nested keys — collect all string values that are `.md` paths). Also check `<systeme-root>/sources/` for unprocessed source bundles produced by `extract-pdf`.
List files found. If none: stop and report.

### Step 2 — Filter

Skip files that already have a `.original.md` backup (already optimized in a previous run).
Show the list:

```
Fichiers à restructurer :
  [ ] <file1>.md
  [ ] <file2>.md
Déjà optimisés (ignorés) :
  [✓] <file3>.md (backup existe)

Continuer ? [Y/n]
```

### Step 3 — Restructure each file

For each file in the list: run the full process from `@01-restructure.md`.
After each file: report status.

### Step 4 — Summary

```
Restructuration terminée.

| Fichier | Statut | Sections | Templates créés |
|---------|--------|----------|-----------------|
| file1   | ✓      | 6/6      | 4               |
| file2   | ✓      | 6/6      | 4               |

Total : [N] fichiers traités, [M] ignorés.
```

## Test

After `rules-keeper --all`, verify that every file listed under `rules-files` in bank.yml either has a corresponding `.original.md` backup (already done) or was processed in this run and now contains all 6 sections.
