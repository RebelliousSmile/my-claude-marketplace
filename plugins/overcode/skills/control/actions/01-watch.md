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
   - lire ce qu'il faut pour juger, pas plus — chaque commande `git` ci-dessous se lance en `GIT_OPTIONAL_LOCKS=0 git …` (règle *Lecture seule*) :
     - fichier suivi (`M`, `D`, `A`…) : `git diff -- <fichier>` (ou `git diff --cached -- <fichier>`) ;
     - renommage ou copie (`R ancien -> nouveau`, `C …`) : `git diff --cached -M --stat -- <ancien> <nouveau>` ; dire « renommé `ancien` → `nouveau` » et ne décrire du contenu que si la similarité est inférieure à 100 % (lire alors `git diff --cached -M -- <ancien> <nouveau>`) — jamais comme un fichier neuf ;
     - fichier non suivi (`??`) : `Read` du fichier — `git diff` n'affiche rien pour lui ;
     - dossier résumé (`<statut> <dossier>/ (n entries)`, au-delà de 10 entrées) ou artefacts de build et fichiers générés (`dist/`, `build/`, `coverage/`, `*.map`, `*.min.js`, `node_modules/`) : **ne pas lire ni lister fichier par fichier** ; dire « n fichiers sous `<dossier>/` », vérifier s'ils devraient être ignorés (`git check-ignore -q <dossier>/<un fichier>` ; une sortie non nulle signale qu'aucune règle `.gitignore` ne les couvre) et le signaler en `⚠` le cas échéant ;
     - commit : `git show --stat <sha>`, **puis** `git status --short` pour nommer ce qui reste modifié hors du commit, en tête les fichiers déjà signalés en `⚠` ;
     - mouvement de HEAD : `branch: a → b` est un **changement de branche** — le confirmer par `git reflog -1` (`checkout: moving from a to b`), puis le dire (« la session est passée de `a` à `b` »), préciser que la sonde suit désormais `b`, et ne pas parler de réécriture ; `retour en arrière … reset ?` est un HEAD reculé sur la même branche — lire `git reflog -2` pour nommer l'opération ; seule la mention `réécriture d'historique ?` (ancien HEAD ni ancêtre ni descendant du nouveau, comme après un `--amend` ou un rebase) justifie le `⚠` de réécriture, après `git reflog -2` pour le confirmer ;
     - transcript (`transcript: +n lines a-b`) : lire ces lignes-là (`sed -n 'a,bp' <jsonl>`) quand le lot n'a aucun effet disque, quand il porte `errors×n` ou `outside×n` — y relever les chemins visés (`file_path`, `cd`, `git worktree add`) et les `tool_result` en `is_error: true` et leur message. Sans cette lecture, dire que le succès ou l'échec des appels est inconnu, ne jamais l'affirmer ;
     - travail hors de l'arbre observé (`outside×n: <chemin>`, ou chemins lus hors de `--root`) : le dire en `⚠` — la sonde est aveugle à ce chemin, ses lots ne montrent plus le travail réel — et proposer, avec l'accord de l'utilisateur, de réarmer `watch` sur la racine de ce chemin (`git -C <chemin> rev-parse --show-toplevel`) ;
   - répondre dans ce format, chaque rubrique omise si vide :

     ```
     **#k · HH:MM:SS** — <une phrase : ce qui vient de bouger>
     ⚠ <risque ou dérive, avec le fichier en cause>
     → <ce que ça semble viser (hypothèse)>
     ? <ce que l'utilisateur devrait vérifier ou trancher>
     ```

   - plusieurs lots dans le même tour : une seule réponse, un bloc par lot dans l'ordre d'arrivée ;
   - signaler en `⚠` en priorité : fichier hors du plan ; tests supprimés, désactivés ou affaiblis ; travail hors de l'arbre observé ; suppression massive ; ajout massif ou artefacts de build non ignorés ; secret ou `.env` touché ; dépendance ajoutée ; migration ou schéma modifié ; réécriture d'historique (mention `réécriture d'historique ?` confirmée par le reflog) ; même fichier réécrit en boucle ; transcript qui accumule des erreurs (`errors×n`) ou des `Bash` répétés sans effet sur disque. Un secret touché se signale sans jamais recopier sa valeur (règle transversale *Aucun secret recopié*).
8. **Ligne `idle`.** Une phrase : depuis combien de temps rien ne bouge, et ce que ça peut vouloir dire (l'agent réfléchit, attend une permission, est bloqué — ou travaille hors de l'arbre observé si un lot récent portait `outside×n`). Ne pas relancer la session observée.

## Outputs

- Un Monitor actif nommé `control — <dépôt>`, et son dossier d'état.
- Un commentaire au format ci-dessus par lot reçu.

## Test

Après l'armement, une modification de fichier dans le dépôt observé produit, en ≤ 2 intervalles, **une** notification `batch #1` qui la nomme, suivie d'un commentaire au format `**#1 · …**` ; aucun fichier du dépôt observé n'a été modifié par le commentateur (`git status` identique hors changements de la session observée).
