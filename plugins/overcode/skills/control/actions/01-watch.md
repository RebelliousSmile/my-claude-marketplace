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
4. **Poser la ligne de base.** `watch.sh --root <dépôt> --state <dir> [--transcript <jsonl>] --reset --once`. Le dossier d'état par défaut dérive du chemin du dépôt ; le noter pour `recap` et `stop`. Écrire `0` dans `<dir>/commented`.
5. **Armer le Monitor** — trois paramètres, tous obligatoires ; ne jamais armer sans `timeout_ms`, dont le défaut (5 min) multiplie les réarmements :
   - `timeout_ms` : **1 800 000** (le maximum).
   - `command` : `watch.sh --root <dépôt> --state <dir> --interval 10 [--transcript <jsonl>]`
   - `description` : `control — <nom du dépôt>` (le nom paraît dans chaque notification)

   **À l'expiration**, sauf si l'utilisateur a dit `stop` : d'abord rattraper le journal (§ 7, étape *Trou*) — une expiration peut cacher des lots jamais notifiés —, puis réarmer **avec le même `--state`** et sans `--reset`.
6. **Annoncer** en trois lignes : ce qui est observé, ce qui ne l'est pas (transcript absent, hors Git…), comment arrêter.
7. **Commenter chaque lot.** Pour une ligne `batch #k` :
   - **Trou.** Lire `c` dans `<dir>/commented`, puis le remplacer, pour chaque lot suivant du même tour, par le dernier `k` déjà traité dans ce tour (`commented` n'est écrit qu'en fin de réponse : deux lots notifiés ensemble ne font pas un trou). Si `k > c + 1`, à l'expiration du Monitor ou au `stop`, des lignes ont pu être émises sans notification : lire dans `<dir>/emitted.log` tout ce qui suit la ligne `batch #c` (la ligne `baseline` si `c` = 0), jusqu'à `#k-1`, ou jusqu'à la fin du journal à l'expiration et au `stop` ; lignes `idle` comprises, sauf celles déjà commentées en direct, et le commenter **avant** le lot `#k`, dans un bloc unique :

     ```
     **Rattrapage #a–#b · HH:MM–HH:MM** — <n> lots non notifiés, relus dans le journal
     <jusqu'à 5 lots : une ligne par lot ; au-delà : fichiers touchés, commits, total errors×n>
     <chaque ligne idle du journal : une ligne, selon § 8>
     ⚠ <chaque risque de la liste ci-dessous, nommé avec son lot et son fichier — jamais fondu dans le résumé>
     ```

     Jamais de trou passé sous silence. Les plages `transcript: a-b` du journal se lisent selon les règles ci-dessous. Un `git diff` lu au rattrapage montre l'état **actuel** du fichier, plus celui du lot : le dire quand un fichier a bougé depuis (commit, lot suivant) ;
   - lire ce qu'il faut pour juger, pas plus :
     - fichier suivi (`M`, `D`, `A`…) : `git diff -- <fichier>` (ou `git diff --cached -- <fichier>`) ;
     - fichier non suivi (`??`) : `Read` du fichier — `git diff` n'affiche rien pour lui ;
     - commit : `git show --stat <sha>`, **puis** `git status --short` pour nommer ce qui reste modifié hors du commit, en tête les fichiers déjà signalés en `⚠` ;
     - transcript (`transcript: +n lines a-b`) : lire ces lignes-là (`sed -n 'a,bp' <jsonl>`) quand le lot n'a aucun effet disque, ou quand il porte `errors×n` — y relever les `tool_result` en `is_error: true` et leur message. Sans cette lecture, dire que le succès ou l'échec des appels est inconnu, ne jamais l'affirmer ;
   - répondre dans ce format, chaque rubrique omise si vide :

     ```
     **#k · HH:MM:SS** — <une phrase : ce qui vient de bouger>
     ⚠ <risque ou dérive, avec le fichier en cause>
     → <ce que ça semble viser (hypothèse)>
     ? <ce que l'utilisateur devrait vérifier ou trancher>
     ```

   - plusieurs lots dans le même tour : une seule réponse, un bloc par lot dans l'ordre d'arrivée ;
   - signaler en `⚠` en priorité : fichier hors du plan ; tests supprimés, désactivés ou affaiblis ; suppression massive ; secret ou `.env` touché ; dépendance ajoutée ; migration ou schéma modifié ; réécriture d'historique (`HEAD … → …`) ; même fichier réécrit en boucle ; transcript qui accumule des erreurs (`errors×n`) ou des `Bash` répétés sans effet sur disque. Un secret touché se signale sans jamais recopier sa valeur (règle transversale *Aucun secret recopié*) ;
   - **Marquer.** Une fois la réponse rédigée, écrire le plus grand `k` commenté dans `<dir>/commented` (`echo <k> > <dir>/commented`). `commented` est le seul fichier qu'écrit le commentateur (ici et au § 4), dans son propre dossier d'état, jamais dans le dépôt observé.
8. **Ligne `idle`.** Une phrase : depuis combien de temps rien ne bouge, et ce que ça peut vouloir dire (l'agent réfléchit, attend une permission, est bloqué). Ne pas relancer la session observée.

## Outputs

- Un Monitor actif nommé `control — <dépôt>`, et son dossier d'état.
- Un commentaire au format ci-dessus par lot reçu, et un bloc de rattrapage pour tout lot émis sans notification.
- `<dir>/commented` à jour du dernier lot commenté.

## Test

Après l'armement, une modification de fichier dans le dépôt observé produit, en ≤ 2 intervalles, **une** notification `batch #1` qui la nomme, suivie d'un commentaire au format `**#1 · …**` ; aucun fichier du dépôt observé n'a été modifié par le commentateur (`git status` identique hors changements de la session observée).
