# Règles de redistribution — projets

Structure standard d'un projet et **où va chaque information**. Consommé par `reorganize` (restructuration ponctuelle) et par `distill` (classification continue communication → information).

## Fichiers par type

| Type | Fichiers |
|------|----------|
| Communs (tous types) | `projet.md`, `memory.md`, `backlog.md` |
| `commercial` | + `commercial.md` |
| `open-source` | + `communication.md` |
| `personnel` | + `objectifs.md` |

Fichiers dérivés (non issus des templates) : `snippets.md` (mémos code du projet), `project-notes.md` (export RAG généré).

## Où va quoi — classification de l'information

C'est le contrat de routage de `distill` : chaque information survivante (après réduction `filler`) est classée ici.

| Nature de l'information | Fichier | Section |
|---|---|---|
| **Fonctionnement / technique** du projet (contexte, stack, architecture, décision technique) | `projet.md` | `## Contexte` / `## Stack` / `## Journal` |
| **Gestion de projet** : devis / facture | `commercial.md` | `## Historique devis` / `## Facturation` |
| **Gestion de projet** : compte-rendu de réunion | `commercial.md` (commercial) · `communication.md` (open-source) · `projet.md` (personnel) | `## CR Réunions` / `## Journal` |
| **Gestion de projet** : accès / identifiants | `commercial.md` | `## Accès` (référence `→ BW:` uniquement, jamais le secret) |
| **Tâche à planifier** pour le futur | `backlog.md` | `## En attente` |
| **Décision durable** / à ne pas réexpliquer | `memory.md` | `## Décisions` |
| **Communication publique** (open-source) | `communication.md` | `## Journal` |
| Information **encore actuelle mais non structurelle** | reste un document daté, **ramené au mois courant** (date conservée dans le document) | — |
| Information **obsolète** | **archivée ou supprimée** (dry-run + confirmation) | — |

## Invariants

- **Jamais de secret en clair** dans un `.md` : la section `## Accès` n'utilise que `→ BW: [Description]`.
- **Validation avant écriture** dans un fichier structurel (la classification est une proposition).
- **Date conservée dans le document** même quand il change de répertoire (frontmatter ou en-tête daté) — on perd le répertoire daté, pas la date.
- Une information vit dans **un seul** fichier ; les autres y référencent.
