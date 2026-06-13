# 04 - Local

Generate a `document-rules.md` for rules that are specific to one document (scenario, campaign, supplement) — as opposed to the base game system.

> Les règles locales vivent dans `<projet-root>/.docs/document-rules.md`. Les références au système de jeu pointent vers `<systeme-root>/canon/` (ou `<subsys-root>/canon/`). Tous les chemins sont relatifs à `R`, découvert localement.
> Voir `${CLAUDE_PLUGIN_ROOT}/references/jdr-layout.md` pour la convention complète.

## Inputs

- `project-path` (required) — chemin vers le répertoire du projet d'écriture ; format attendu `R/<AAAA>/<MM>/<projet>/`. Correspond à `<projet-root>`. `R` est découvert en remontant jusqu'à l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/`.
- `source` (optional) — fichier source depuis lequel extraire les règles locales (par défaut `overview.md`)

## Outputs

- `<projet-root>/.docs/document-rules.md`

## Process

### Step 1 — Load context

Découvrir `R` localement : partir de `<project-path>` (ou du CWD), remonter les parents jusqu'au premier dossier contenant l'un des marqueurs `_campagnes/`, `_univers/` ou `_pjs/` ; ce dossier est `R`. Si aucun marqueur n'est trouvé : la cible n'est pas dans un domaine JDR initialisé — le signaler et s'arrêter.

Résoudre les chemins relativement à `R` :
- `<systeme-root>` = `R/_systeme/` (canon/ + mj/)
- `<subsys-root>` = `R/_subsystems/<nom>/`

Localiser les fichiers de règles système par **scan local** de `<systeme-root>/canon/` (= `R/_systeme/canon/`) (et `<subsys-root>/canon/` pour les sous-systèmes pertinents). Ce sont les fichiers à charger pour le cross-referencing en Step 3 ("Interactions avec les Règles Système").

> Le manifeste `R/bank.yml` peut donner des indices (slug univers, liste de fichiers) mais n'est **pas** la source de vérité pour la résolution : toujours scanner le système de fichiers relativement à `R`.

If `R/_systeme/canon/` is empty: warn that local rules won't be able to reference the system rules (lancer `restructure-all` d'abord pour générer le canon).

Si des fichiers de canon système sont trouvés : charger leur contenu maintenant — requis pour le cross-referencing en Step 3.

Read source file (argument or `overview.md`).

### Step 2 — Identify local rules

Extract only rules that are **specific to this document**:
- New mechanics introduced (abilities, items, conditions not in the system rules)
- Variant rules that override or modify system defaults
- Document-specific NPCs with unique capabilities
- Special items with mechanical effects

**Classify each candidate rule using this decision table:**

| Test | → Local (`document-rules.md`) | → System (already in `<systeme-root>/canon/`) |
|------|-------------------------------|---------------------------------------|
| Applies only in this document? | ✓ | ✗ |
| References a named entity specific to this document? | ✓ | ✗ |
| Would change how the base system works if exported to another project? | ✗ | ✓ |
| Could appear verbatim in any other project using the same system? | ✗ | ✓ |

**Examples:**

| Mechanic | Classification | Reason |
|----------|----------------|--------|
| "La Coche de lien de Toravel donne accès à Pelive" | Local | References a document-specific NPC and merveille |
| "Un jet de Sang difficile se coche en astral" | System | General astral stress rule, applies in any Nadir game → belongs in `R/_systeme/canon/` |
| "En acte I, le Seuil force un Contrecoup supplémentaire" | Local | Specific to this campaign's act structure |
| "2d6 + compétence vs difficulté" | System | Core resolution — already in `<systeme-root>/canon/` |

If a candidate is ambiguous: present it to the user with the two options rather than deciding unilaterally.

If a "local" rule is actually a general mechanic: flag it and suggest running `rules-keeper restructure` on the system file instead.

### Step 3 — Generate document-rules.md

```markdown
# Règles Spécifiques : [Document Name]

## Résumé

[Short list of mechanics added by this document]

## Mécaniques

### [Mechanic Name]

**Type :** [ability / item / condition / variant]
**Déclencheur :** [when it applies]
**Effet :** [mechanical effect]
**Durée :** [permanent / temporary / scene / session]

### [Mechanic Name]

...

## Objets Spéciaux

| Nom | Effet | Usages |
|-----|-------|--------|
| [item] | [effect] | [limit] |

## Interactions avec les Règles Système

- [System rule from `<systeme-root>/canon/<fichier>.md`] + [local rule] = [how they combine]

---
**Document :** [project name]
**Règles système :** [reference to `R/_systeme/canon/<fichier>.md` or `R/_subsystems/<nom>/canon/<fichier>.md`]
**Màj :** [date]
```

### Step 4 — Report

```
document-rules.md généré : <projet-root>/.docs/document-rules.md
[N] mécaniques locales documentées
```

> Le manifeste `R/bank.yml` (cache d'arborescence) est maintenu par `obs:tree`, pas par `rules-keeper` : aucune écriture dans `bank.yml` ici.

## Test

After `rules-keeper --local <project>`, verify that `<projet-root>/.docs/document-rules.md` exists, contains at least one mechanic section, and that any system rule reference points to `R/_systeme/canon/<fichier>.md` (not to a flat unprefixed path).
