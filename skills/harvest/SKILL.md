---
name: harvest
description: Global maintenance skill — reconciles tracker items with processed plans, harvests non-obvious decisions into memory/rules, purges ephemeral task files, reviews all remaining files methodically
model: opus
---

# Harvest — Maintenance globale des plans et tracker

## Objectif

Nettoyer `aidd_docs/tasks/` qui grossit, fermer les tracker items orphelins, réconcilier la mémoire et les règles accumulées par `/learn`, puis traiter méthodiquement tous les fichiers restants.

## Ordre de traitement

1. Plans terminés et fichiers éphémères en premier (phases 2–5)
2. Fichiers restants ensuite, par type (phase 6)

## Règles

- Ne jamais fermer un tracker item sans montrer le commentaire de clôture à l'utilisateur
- Ne jamais supprimer de fichiers sans confirmation explicite
- Utiliser uniquement le CLI détecté en Phase 1 pour les opérations tracker (jamais les MCP)
- Commandes shell adaptées à l'OS détecté en Phase 1

## Configuration (valeurs par défaut, overridables via argument)

| Paramètre | Défaut | Description |
|---|---|---|
| `plan_warn_days` | 14 | Ancienneté à partir de laquelle un plan actif est signalé |
| `plan_stale_days` | 60 | Ancienneté à partir de laquelle un plan actif est proposé à la suppression |
| `audit_stale_days` | 90 | Ancienneté à partir de laquelle un audit est signalé |
| `rule_elevation_threshold` | 3 | Nombre minimum de décisions sur un même sujet pour proposer élévation en règle |

Si l'utilisateur passe un argument (ex. `/harvest plan_stale_days=30`), utiliser la valeur fournie.

---

## Phase 1 — Inventaire complet

Détecter l'OS depuis le contexte de session **une seule fois** et le mémoriser pour toutes les phases suivantes.

Détecter le type de tracker **une seule fois** et le mémoriser :

| Priorité | Tracker | Détection |
|---|---|---|
| 1 | **GitHub** | `gh repo view` retourne sans erreur |
| 2 | **GitLab** | `glab repo view` retourne sans erreur |
| 3 | **Local** | User stories présentes dans `aidd_docs/tasks/` (type 5 ci-dessous) |
| 4 | **Aucun** | Aucune des détections ci-dessus |

Lister tous les fichiers `.md` dans `aidd_docs/tasks/` :

```bash
# macOS / Linux
find aidd_docs/tasks -type f -name "*.md" | sort

# Windows (PowerShell)
Get-ChildItem -Recurse -Filter "*.md" aidd_docs/tasks | Sort-Object Name | Select-Object -ExpandProperty FullName
```

Classifier chaque fichier (priorité décroissante sur l'extension composée, puis sur le répertoire et le nom) :

| Priorité | Type | Détection | Action |
|---|---|---|---|
| 1 | **Plan terminé** | `*.processed.md` | Harvest → purge si éligible |
| 2 | **Review** | `*.review.md` | Purge si éligible |
| 3 | **Journey** | `*.journey.md` | Purge si éligible |
| 4 | **Audit** | `aidd_docs/tasks/audits/**` (répertoire) | Revue par âge |
| 5 | **User story** | frontmatter `type: user-story`, ou `# User Story` / `## Acceptance Criteria` dans le contenu, ou préfixe `story-` | Purge si tracker item fermé ou `status: done` |
| 6 | **Checklist / phase** | `*checklist*`, `*phase-[0-9]*` dans le nom | Purge si tracker item fermé |
| 7 | **Sous-plan** | `-part-[0-9]` ou `-master` dans le nom **ET** un fichier `-master.md` ou `-master.processed.md` de même préfixe existe | Purge si plan master `.processed.md` existe |
| 8 | **Plan actif** | `.md` sans aucun suffixe ci-dessus (y compris `-part-N` ou `-master` sans master détectable — repli) | Revue : actif ou abandonné ? |

Afficher le résumé par type : N processed, N reviews, N journeys, N audits, N user stories, N checklists, N sous-plans, N plans actifs.

---

## Phase 2 — Réconciliation tracker

Le comportement de cette phase dépend du tracker détecté en Phase 1.

### Tracker : GitHub

Vérifier le nombre total d'items :

```bash
# macOS / Linux
gh issue list --state all --json number | jq 'length'

# Windows (PowerShell)
gh issue list --state all --json number | ConvertFrom-Json | Measure-Object | Select-Object -ExpandProperty Count
```

Si total ≤ 200 : requête unique :

```bash
gh issue list --state all --limit 200 --json number,state,title,url
```

Si total > 200 : deux requêtes séparées, concaténer les résultats :

```bash
gh issue list --state open   --limit 500 --json number,state,title,url
gh issue list --state closed --limit 500 --json number,state,title,url
```

### Tracker : GitLab

```bash
glab issue list --all --output json
```

Si pagination nécessaire, utiliser `--page` et `--per-page 100`.

### Tracker : Local (user stories uniquement)

Lire chaque user story. Un item est considéré **fermé** si son frontmatter contient `status: done` ou `status: closed`. Pas de requête réseau.

### Tracker : Aucun

Tous les `.processed.md` sont traités comme groupe C — la Phase 3 est skippée.

---

### Extraction du tracker item associé

Pour chaque `.processed.md`, extraire l'identifiant tracker dans cet ordre :
1. Frontmatter `issue_number:` ou `tracker_id:`
2. Nom de fichier : préfixe `issue-42`, segment `#42-`, ou `story-slug`
3. Contenu : `Fixes #42`, `Closes #42`, `**Issue:** #42`, `**Story:**`
4. Segment entièrement numérique isolé (`-42-` uniquement si non précédé d'une date `YYYY_MM_DD`)

Construire la table d'association : pour chaque `.review.md`, `.journey.md`, user story, checklist et sous-plan, trouver le `.processed.md` ou plan de même nom de base et hériter de son groupe.

### Groupes

- **A — Tracker item ouvert avec plan terminé** → fermer en Phase 3, puis purger en Phase 5
- **B — Tracker item fermé** → purger directement en Phase 5
- **C — Aucun tracker item détecté** → purger directement en Phase 5 (Phase 3 skippée — tâche interne ou directe)

---

## Phase 3 — Clôture des tracker items (groupe A)

**Si groupe A est vide → passer directement à Phase 4.**

Pour chaque item du groupe A, lire le template :

```
aidd_docs/templates/custom/close-issue.md
```

Remplir les variables dans cet ordre :
- `{Branch}` : depuis le plan (`**Branch name**`)
- `{PR}` / `{MR}` : chercher une PR/MR associée à la branche — si aucun résultat, mettre `none`
- `{Done}` : ligne de résumé depuis `## Summary` ou `## Objectif` du plan
- `{Changelog}` : scope et type inférés depuis le plan
- `{Plan}` : chemin relatif du `.processed.md`
- `{Notes}` : résumé du `.review.md` associé s'il existe, sinon omettre la section

Écrire le commentaire dans un fichier temporaire :

```bash
# macOS / Linux : /tmp/harvest-close-<n>.md
# Windows       : $env:TEMP\harvest-close-<n>.md
```

Montrer à l'utilisateur et **attendre confirmation** avant de poster.

**GitHub :**
```bash
# macOS / Linux
gh issue comment <n> --body-file /tmp/harvest-close-<n>.md && gh issue close <n>

# Windows
gh issue comment <n> --body-file "$env:TEMP\harvest-close-<n>.md" && gh issue close <n>
```

**GitLab :**
```bash
# macOS / Linux
glab issue note <n> --message "$(cat /tmp/harvest-close-<n>.md)" && glab issue close <n>

# Windows
glab issue note <n> --message (Get-Content "$env:TEMP\harvest-close-<n>.md" -Raw) && glab issue close <n>
```

**Local (user story) :**
Mettre à jour le frontmatter de la user story : `status: done`.

Le `&&` garantit que l'item n'est fermé que si le commentaire a bien été posté.

---

## Phase 4 — Réconciliation mémoire (jardinage)

`/learn` s'est exécuté à chaque `end_plan` — les décisions ont déjà été extraites. Mais `/learn` accumule session par session sans réconcilier l'ensemble. Cette phase fait ce que `/learn` ne fait pas : détecter les redondances, contradictions et patterns non codifiés accumulés dans la mémoire.

### Sources à scanner

- `aidd_docs/internal/decisions/` — décisions individuelles
- `aidd_docs/memory/` — mémoire projet
- `.claude/rules/custom/` — règles codifiées

### A — Cartographie (scan incrémental)

Déterminer la date du dernier harvest en lisant le fichier le plus récent dans `aidd_docs/harvests/` :

```bash
# macOS / Linux
ls -t aidd_docs/harvests/*.md | head -1

# Windows (PowerShell)
Get-ChildItem aidd_docs/harvests\*.md | Sort-Object LastWriteTime -Descending | Select-Object -First 1 -ExpandProperty FullName
```

Lister les fichiers dans les trois sources **modifiés depuis cette date** (si aucun harvest précédent : scanner tout) :

```bash
# macOS / Linux — remplacer <date> par YYYY-MM-DD
find aidd_docs/internal/decisions aidd_docs/memory .claude/rules/custom \
  -type f -name "*.md" -newer aidd_docs/harvests/<dernier-rapport>.md | sort

# Windows (PowerShell)
$lastHarvest = Get-ChildItem aidd_docs\harvests\*.md | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Get-ChildItem -Recurse -Filter "*.md" aidd_docs\internal\decisions, aidd_docs\memory, .claude\rules\custom |
  Where-Object { $_.LastWriteTime -gt $lastHarvest.LastWriteTime } | Sort-Object Name | Select-Object -ExpandProperty FullName
```

**Si aucun fichier retourné → Phase 4 terminée, noter "rien de nouveau depuis le dernier harvest", passer à Phase 5.**

Lire chaque fichier retourné. Construire une carte des sujets couverts (lib/technologie, domaine fonctionnel) avec pour chaque fichier : sujet principal, règle ou décision clé.

### B — Détection

Pour chaque sujet, chercher :

| Problème | Définition | Action |
|---|---|---|
| **Doublon** | Même décision décrite dans 2+ fichiers | Fusionner dans le fichier le plus approprié |
| **Contradiction** | Deux fichiers prescrivent des comportements opposés | Garder le plus récent ou spécifique, annoter le choix |
| **Pattern récurrent** | Même type de contrainte dans ≥ `rule_elevation_threshold` décisions, absent des rules | Élever en règle `.claude/rules/custom/` |
| **Décision obsolète** | Référence une lib, fonction ou pattern qui n'existe plus | Signaler à l'utilisateur |

### C — Consolidation

Appliquer les actions de B. Pour chaque modification :
- **Fusionner** : le fichier cible est le plus récent (date de modification) ; si même date, le plus complet (nombre de lignes). Montrer à l'utilisateur les deux fichiers et le contenu fusionné proposé → **confirmation distincte** : "Fusionner et supprimer la source ?" Réécrire la cible, supprimer la source uniquement après accord.
- **Élever en règle** : créer `.claude/rules/custom/<n>-<sujet>.md`. Montrer à l'utilisateur la règle créée et la liste des fichiers sources → **confirmation distincte** : "La règle couvre-t-elle entièrement ces fichiers ? Supprimer les sources ?"

Toute autre suppression de fichier mémoire → **confirmation utilisateur** avant d'agir.

### D — Rapport de réconciliation

Lister : N doublons fusionnés, N contradictions résolues, N patterns élevés en règles, N décisions obsolètes signalées.

---

## Phase 5 — Purge des fichiers éphémères

`/learn` ayant déjà tourné à `end_plan`, les `.processed.md` peuvent être purgés dès que le tracker item est confirmé fermé — pas besoin de marqueur supplémentaire.

Critères d'éligibilité :

| Type | Condition de purge |
|---|---|
| `.processed.md` groupe A | Tracker item fermé en Phase 3 |
| `.processed.md` groupe B | Tracker item déjà fermé |
| `.processed.md` groupe C | Aucun tracker item — purger directement |
| `.review.md` | `.processed.md` de même base (tout groupe) — ou orphelin sans `.processed.md` **ni plan actif** de même base |
| `.journey.md` | `.processed.md` de même base (tout groupe) — ou orphelin sans `.processed.md` **ni plan actif** de même base |
| Audits | **Jamais purgés ici** — traités en Phase 6 |
| Autres types | **Jamais purgés ici** — traités en Phase 6 |

Construire la liste des fichiers éligibles. Afficher avec chemin relatif et date de modification. Demander confirmation unique :

> "Supprimer ces N fichiers ? (irréversible)"

```bash
# macOS / Linux
rm <fichier1> <fichier2> ...

# Windows (PowerShell)
Remove-Item -Path "<fichier1>", "<fichier2>", ...
```

---

## Phase 6 — Revue méthodique des fichiers restants

Analyser chaque type ci-dessous et **collecter** toutes les actions proposées sans agir. Présenter le tableau consolidé en fin de phase, puis attendre une confirmation unique avant d'agir.

### 6a — User stories

Pour chaque user story, vérifier le tracker item associé (même extraction que Phase 2) :
- Tracker item **fermé** ou frontmatter `status: done` → collecter : **supprimer**
- Tracker item **ouvert** → collecter : **conserver**, signaler
- **Pas de tracker item** → collecter : **à clarifier** (demander à l'utilisateur)

### 6b — Checklists et phases intermédiaires

Pour chaque checklist/phase file :
- Son plan master (même base sans `-phase-N` ou `-checklist`) est **`.processed.md`** → collecter : **supprimer**
- Plan master **encore actif** → collecter : **conserver**
- **Aucun master trouvé** → collecter : **orphelin — à clarifier**

### 6c — Sous-plans (`-part-N`, `-master`)

Pour chaque master (`-master.md`) :
- Fichier `-master.processed.md` **existe** → collecter : **supprimer** tous les `-part-N` associés
- Pas encore `.processed.md` mais **tracker item associé fermé** (même extraction Phase 2) → collecter : **supprimer** le master ET tous ses `-part-N` (travail terminé, `end_plan` non exécuté)
- Pas encore `.processed.md` et tracker item **ouvert ou absent** → collecter : **conserver**

Pour chaque `-part-N` sans master détectable → repli en Plan actif (Phase 6d).

### 6d — Plans actifs potentiellement abandonnés

Pour chaque plan `.md` sans suffix (ni processed, ni user story, ni checklist, ni sous-plan) :

Calculer l'ancienneté depuis la date dans le nom de fichier (`YYYY_MM_DD`) ou depuis la date de modification.

| Ancienneté | Action collectée |
|---|---|
| < 14 jours | **conserver** — probablement en cours |
| 14–60 jours | **à clarifier** — toujours actif, abandonné, ou à archiver ? |
| > 60 jours | **supprimer** — plan abandonné |

Pour les plans dont le tracker item associé est **fermé** (quelle que soit l'ancienneté) → collecter : **supprimer**. Appliquer les mêmes règles d'extraction que Phase 2 (frontmatter, nom de fichier, contenu) pour trouver l'identifiant tracker.

Pour les plans dont un `.review.md` de même base existe → collecter : **supprimer** le plan et son `.review.md` (travail terminé, `end_plan` non exécuté).

### 6e — Plans actifs sans tracker item ni ancienneté suffisante

Les `.processed.md` groupe C sont purgés en Phase 5 — cette section ne les concerne plus.

Pour les plans actifs (`.md` brut) sans tracker item détecté et dans la tranche 14–60 jours (Phase 6d "à clarifier") : demander si le plan est toujours actif, abandonné, ou s'il faut créer un tracker item pour le tracer.

### 6f — Audits

Pour chaque fichier dans `audits/` :

| Ancienneté | Action collectée |
|---|---|
| < 90 jours | **conserver** — snapshot récent |
| > 90 jours | **à clarifier** — toujours pertinent ou à supprimer ? |

### Confirmation consolidée

Présenter le tableau de toutes les actions collectées :

| Fichier | Type | Action proposée | Raison |
|---|---|---|---|
| `{chemin}` | user story / checklist / sous-plan / plan actif / groupe C / audit | supprimer / conserver / à clarifier | {raison courte} |

Résoudre d'abord les lignes **à clarifier** en posant les questions groupées. Une fois toutes les décisions prises, demander confirmation unique :

> "Appliquer ces N suppressions ? (irréversible)"

---

## Phase 7 — Rapport final

Remplir le template de rapport :

```
aidd_docs/templates/custom/harvest.md
```

Écrire le rapport dans :

```
aidd_docs/harvests/YYYY_MM_DD-harvest.md
```

`aidd_docs/harvests/` est un répertoire de rapports — il n'est jamais scanné par la Phase 1 et ses fichiers ne sont jamais purgés.

Afficher le rapport complet. Si 0 actions effectuées → "Rien à faire — répertoire propre."
