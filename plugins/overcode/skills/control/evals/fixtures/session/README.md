# Fixture `session` — une implémentation observée depuis un second terminal

État figé d'une partie en cours, pour juger `control` en dry-run sans session réelle.

- **Dépôt observé** : `~/work/shop` (Git, branche `feat/coupon`), HEAD de base `a1b2c3d`.
- **Arbre déjà sale à la ligne de base** : `src/legacy/price.ts` modifié par l'utilisateur **avant** le lancement de `watch` (non commité, sans lien avec la tâche).
- **Session observée** : implémente le plan de `plan.md` dans le premier terminal.
- **Session commentatrice** : celle qui exécute `control`, dans le second terminal.
- `transcripts.txt` — les JSONL candidats du dossier projet, avec leur date de modification.
- `batches.log` — les lignes émises par `scripts/watch.sh`, dans l'ordre d'arrivée.
- `diffs.md` — ce que `git diff` / `git show` renverrait pour chaque lot, et les extraits de transcript.
- Dossier d'état : `/tmp/overcode-control-1234567`, `batch` = 7 après le lot #7.
