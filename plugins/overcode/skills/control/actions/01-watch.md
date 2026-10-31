# Watch

Arme la sonde à côté de la session qui travaille, puis commente chaque lot qu'elle remonte.

## Inputs

- **Dépôt observé** — chemin ; défaut : répertoire courant.
- **Transcript** (optionnel) — le JSONL de la session observée, pour voir ses appels d'outils et pas seulement leurs effets sur disque. Sous Claude Code : `~/.claude/projects/<chemin-du-projet-avec-tirets>/<session>.jsonl`.
- **Plan** (optionnel) — fichier de plan, de tâche ou description du chantier en cours, pour juger la dérive.
- **Intervalle** — 10 s par défaut ; ne le changer que sur demande.

## Process

1. **Résoudre la sonde.** `scripts/watch.sh` depuis la racine de ce skill. Vérifier `git -C <dépôt> rev-parse` : hors Git, la sonde fonctionne en mode dégradé (taille et date des fichiers, sans commits) — le dire.
2. **Trouver le transcript, sans deviner.** Lister les JSONL du dossier projet triés par date de modification. Le plus récent est souvent **celui de cette session-ci** : l'exclure, puis proposer le suivant. S'il reste plusieurs candidats actifs, demander lequel. Sans transcript, continuer : la sonde suit le disque seul.
3. **Lire le plan** s'il est fourni, et en retenir le périmètre attendu (fichiers, modules, étapes).
4. **Poser la ligne de base.** `watch.sh --root <dépôt> --state <dir> [--transcript <jsonl>] --reset --once`. Le dossier d'état par défaut dérive du chemin du dépôt ; le noter pour `recap` et `stop`.
5. **Armer le Monitor** :
   - `command` : `watch.sh --root <dépôt> --state <dir> --interval 10 [--transcript <jsonl>]`
   - `description` : `control — <nom du dépôt>` (le nom paraît dans chaque notification)
   - `timeout_ms` : le maximum (1 800 000). À l'expiration, réarmer **avec le même `--state`** et sans `--reset`, sauf si l'utilisateur a dit `stop`.
6. **Annoncer** en trois lignes : ce qui est observé, ce qui ne l'est pas (transcript absent, hors Git…), comment arrêter.
7. **Commenter chaque lot.** Pour une ligne `batch #k` :
   - lire ce qu'il faut pour juger : `git diff -- <fichier>` (ou `git diff --cached`), `git show --stat <sha>` pour un commit ; pas plus que nécessaire ;
   - répondre dans ce format, chaque rubrique omise si vide :

     ```
     **#k · HH:MM:SS** — <une phrase : ce qui vient de bouger>
     ⚠ <risque ou dérive, avec le fichier en cause>
     → <ce que ça semble viser (hypothèse)>
     ? <ce que l'utilisateur devrait vérifier ou trancher>
     ```

   - signaler en `⚠` en priorité : fichier hors du plan ; tests supprimés, désactivés ou affaiblis ; suppression massive ; secret ou `.env` touché ; dépendance ajoutée ; migration ou schéma modifié ; réécriture d'historique (`HEAD … → …`) ; même fichier réécrit en boucle ; transcript qui accumule des erreurs ou des `Bash` répétés sans effet sur disque.
8. **Ligne `idle`.** Une phrase : depuis combien de temps rien ne bouge, et ce que ça peut vouloir dire (l'agent réfléchit, attend une permission, est bloqué). Ne pas relancer la session observée.

## Outputs

- Un Monitor actif nommé `control — <dépôt>`, et son dossier d'état.
- Un commentaire au format ci-dessus par lot reçu.

## Test

Après l'armement, une modification de fichier dans le dépôt observé produit, en ≤ 2 intervalles, **une** notification `batch #1` qui la nomme, suivie d'un commentaire au format `**#1 · …**` ; aucun fichier du dépôt observé n'a été modifié par le commentateur (`git status` identique hors changements de la session observée).
