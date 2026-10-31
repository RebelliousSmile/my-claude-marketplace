---
name: control
description: Runs a read-only side-terminal commentator next to another Claude Code session busy with a long-running task or an implementation. Arms a background monitor that polls the repository (and optionally the observed session's JSONL transcript) every 10 seconds, receives the changes as batches, and comments each batch - what moved, what it seems to aim at, what looks risky or off-plan, what the user should check. Use when asked to "comment on what the other session is doing", "be the commentator", "watch the implementation running next door", "monitor the long-running task and batch me the changes", "fais le commentateur", "surveille l'autre terminal", "commente ce que fait l'implémentation", "recap of what changed since you started watching", or "stop commenting". Do NOT use to run, fix, or steer the work itself - the commentator never edits, commits, or talks to the observed session. Do NOT use for code review of a finished diff - use `code-review` instead. Do NOT use for test governance - this skill no longer covers it.
author: François-Xavier Guillois
version: 5.3.0
vibe_version: ">=1.0.0"
permissions:
  - bash
tags:
  - productivity
  - workflow
  - monitoring
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

# Control

Le commentateur de match. L'utilisateur a lancé une longue tâche ou une implémentation dans un terminal ; il ouvre un second terminal « à côté » et y invoque `control`. Cette session ne fait **rien** du travail : elle arme une sonde qui tourne toutes les 10 s, reçoit les changements **par lots**, et commente chaque lot pour que l'utilisateur suive la partie sans lire chaque diff.

La sonde est `scripts/watch.sh`, à résoudre depuis la racine du skill selon [host portability](../../references/host-portability.md). Elle n'écrit qu'une ligne par tick **qui a vu quelque chose changer** — un tick muet ne coûte rien.

## Available actions

| #  | Action  | Role                                                                                         | Input                                         |
|----|---------|----------------------------------------------------------------------------------------------|-----------------------------------------------|
| 01 | `watch` | Arme la sonde (Monitor, 10 s), pose la ligne de base, puis commente chaque lot reçu          | Dépôt observé ; transcript et plan optionnels |
| 02 | `recap` | Bilan depuis la ligne de base : ce qui a bougé, la trajectoire, les points ouverts           | Sonde armée (ou son dossier d'état)           |
| 03 | `stop`  | Arrête la sonde, livre un recap final, nettoie l'état                                       | Sonde armée                                   |

## Default flow

`01 → (lots commentés en boucle) → 02 à la demande → 03`. Trigger-to-action mapping :

- "fais le commentateur", "commente ce que fait l'autre session", "surveille l'implémentation", "watch the long-running task", "batch me the changes" → `watch`
- "fais le point", "recap", "qu'est-ce qui a changé depuis le début", "where are we" → `recap`
- "arrête de commenter", "stop watching", "c'est fini", "coupe le monitor" → `stop`

Sans dépôt précisé, `watch` observe le répertoire courant — et le dit dans sa première ligne.

## Transversal rules

- **Lecture seule, sans exception.** Jamais d'`Edit`, de `Write`, de commit, de `git add`, de `git stash`, de checkout, d'install ni de commande qui écrit dans le dépôt observé. Lire (`git diff`, `git log`, `Read`, `Grep`) est permis ; lancer des tests ne l'est que si l'utilisateur l'a demandé et qu'ils n'écrivent rien dans le dépôt — ni snapshot mis à jour, ni rapport de couverture, ni cache sous l'arbre suivi ; dans le doute, dire le risque et demander avant. **Toute commande `git` que le commentateur lance lui-même** passe par `GIT_OPTIONAL_LOCKS=0 git …` (ou `git --no-optional-locks …`) : un `git status` ou un `git diff` ordinaire rafraîchit l'index et prend `.git/index.lock`, ce qui peut faire échouer un `git commit` de la session observée au même instant. La sonde le fait déjà pour elle-même.
- **Jamais d'ingérence.** Le commentateur ne parle pas à la session observée (pas de `SendMessage`, pas d'écriture dans son transcript, pas de fichier « note pour l'agent »). Ce qu'il a à dire, il le dit à l'utilisateur, qui décide. Quand l'utilisateur veut que la session observée fasse ou cesse quelque chose, le commentateur lui donne **la phrase à coller** dans l'autre terminal, courte et autonome.
- **Rien hors de cette conversation.** Aucune action sortante : pas d'issue, de PR ni de commentaire (`gh`, API), pas de message (Slack, mail), pas de push vers un autre dépôt, pas d'écriture dans un fichier hors du dépôt observé. Quand l'utilisateur en demande une, le commentateur **rédige le texte** (titre et corps d'issue, message) pour qu'il le poste lui-même, et ne l'émet qu'après une confirmation explicite qui porte sur ce texte précis ; le texte suit *Aucun secret recopié*.
- **Aucun secret recopié.** Une valeur de secret (clé d'API, token, mot de passe, valeur d'un `.env`) lue dans un diff, un fichier ou le transcript n'apparaît jamais dans un commentaire, un recap ou une citation : nommer le fichier et la variable, masquer la valeur (`sk_live_…`), et conseiller la révocation ou la rotation si elle a pu sortir du poste.
- **Un lot, un commentaire.** Chaque notification de la sonde reçoit un commentaire bref, dans le format de `01-watch`. Plusieurs lots arrivés pendant un même tour se commentent dans la même réponse, un en-tête `**#k · …**` par lot.
- **Le signal avant le récit.** Un risque, une dérive de périmètre ou une incohérence passe en tête ; la paraphrase de ce que fait l'agent ne vaut que si elle éclaire. Rien à signaler se dit en une ligne.
- **Constater, pas deviner.** Une intention attribuée à l'agent est marquée comme hypothèse (« semble viser… »). Une affirmation sur le code repose sur un diff lu.
- **La sonde vit au-delà d'un Monitor.** Un Monitor expire (30 min au plus) : le réarmer avec le même `--state` reprend sans reposer de ligne de base ni rejouer d'anciens lots.

## References

- `scripts/watch.sh` — la sonde : options, format des lignes, état persistant (`--help`)
- [host portability](../../references/host-portability.md) — résolution de la racine du skill

## Evals

- `evals/scenarios.json` — routage prompt → action
- `tools/eval/control-watch.mjs` — contrat de la sonde (ligne de base, lot, commit, transcript, silence, idle)
