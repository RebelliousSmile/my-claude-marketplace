# 02 - Restructure All

Restructure all rules sources of the game domain `R`.

> **Position dans le pipeline** : restructure les sources de référence de règles (`<systeme-root>/sources/<source>/rules.md`, et les sous-systèmes `<subsys-root>/sources/<source>/rules.md`). Les outputs atterrissent dans `<systeme-root>/canon/` (ou `<subsys-root>/canon/`).
> Voir `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` pour la convention complète.

## Régénérer le canon depuis le PDF

Le canon de système dérive d'un PDF commercial. Si `<systeme-root>/canon/` est absent/vide (jamais généré, ou volontairement non versionné), il se reconstruit depuis le PDF :

1. **Détecter l'absence** — si `<systeme-root>/canon/` est absent/vide **et** qu'aucun bundle n'existe sous `<systeme-root>/sources/`, il n'y a rien à restructurer : il faut d'abord (ré)extraire les sources.
2. **Ré-extraire les sources** — fournir le PDF de règles commercial et lancer `extract-pdf` pour reconstituer `<systeme-root>/sources/<source>/rules.md` (+ terminology, etc.). `rules-keeper` n'écrit **jamais** dans `canon/` sans source.
3. **Restructurer** — relancer cette action (`restructure-all`) : Step 1 détecte les nouveaux bundles sous `<systeme-root>/sources/` et les ventile vers `<systeme-root>/canon/`.
4. **Vérifier les consommateurs** — `solo-mc`, `pc`, `rpg` et `writing:write` redeviennent opérationnels une fois `<systeme-root>/canon/` régénéré. Les règles maison `<systeme-root>/mj/` et le lore `<univers-root>/canon/` ne sont pas concernés : rien à régénérer de ce côté.

> Sans le PDF source, le canon **ne peut pas** être régénéré : ce contenu dérive de matériel commercial.

## Inputs

*(no argument — scans `<systeme-root>/sources/` and subsystems locally, relative to `R`)*

## Process

### Step 1 — Locate rules sources

Découvrir `R` localement : partir du CWD (ou de l'argument), remonter les parents jusqu'au premier dossier contenant le marqueur `_savoir/` ; ce dossier est `R`. Si aucun marqueur n'est trouvé, la cible n'est pas dans un domaine JDR initialisé — le signaler et s'arrêter.

Scanner localement les sources de règles brutes (produites par `extract-pdf`), relativement à `R` :
- `<systeme-root>/sources/<source>/rules.md` — sources du système de jeu
- `<subsys-root>/sources/<source>/rules.md` — sources de chaque sous-système sous `R/_savoir/subsystems/<nom>/`

> Le manifeste `R/bank.yml` (cache d'arborescence maintenu par `obsidian:tree`) n'est **pas** utilisé pour localiser les fichiers : la résolution est un scan de système de fichiers relatif à `R`.

List files found. If none: stop and report (voir « Régénérer le canon depuis le PDF » si `canon/` et `sources/` sont vides).

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

After `rules-keeper --all`, verify that every rules source found under `<systeme-root>/sources/` (and the subsystems' `sources/`) either has a corresponding `.original.md` backup (already done) or was processed in this run and now contains all 6 sections.
