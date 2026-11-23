# Captures d'écran des guides

Les guides citent des images (`![texte](images/nom.png)`). Le moteur ne les prend pas : il inventorie les images citées, contrôle qu'elles existent et lance l'outil de capture du projet.

## Commandes

```
node <DOC_PDF_PLUGIN_ROOT>/engine/cli.js captures list  [--guide <id>] [--config <chemin>]
node <DOC_PDF_PLUGIN_ROOT>/engine/cli.js captures check [--guide <id>] [--config <chemin>]
node <DOC_PDF_PLUGIN_ROOT>/engine/cli.js captures run   [--guide <id>] [--config <chemin>]
```

- `list` : par guide, nombre d'images citées et manquantes, état de chacune (date de modification ou `MANQUANTE`), fichiers Markdown qui les citent, images du dossier `images` que rien ne cite.
- `check` : comme `list` mais n'affiche que les manquantes ; code de sortie 1 si l'une manque. Sert de garde avant `icml` ou `pdf`.
- `run` : lance `captures.command`, puis classe les images citées en réécrites (modifiées depuis le lancement), inchangées et manquantes ; code 1 si la commande échoue ou si une image citée manque toujours.

Une image est citée par `![texte](chemin)` dans un `.md` du guide (version fusionnée exclue, blocs de code exclus, adresses distantes ignorées), chemin relatif au fichier qui la cite.

## Configuration du projet

Champ facultatif de `documentation.config.json` :

```json
"captures": {
  "command": "pnpm run guides:captures",
  "cwd": "../..",
  "env": { "TEST_DB_THROWAWAY": "1", "PORT": "3033" }
}
```

- `command` : lancée par le shell. Obligatoire.
- `cwd` : relatif au fichier de configuration (défaut : son dossier).
- `env` : s'ajoute à l'environnement courant, valeurs textuelles. C'est ici que se règle la cible jetable exigée par les gardes du projet.

Le moteur ajoute `DOC_PDF_SOURCE_DIR` (dossier des guides, absolu) et, avec `--guide`, `DOC_PDF_GUIDE` (identifiant du guide visé).

## Conventions pour la commande du projet

- Écrire chaque PNG sous le nom exact que le guide cite, dans `<guide>/images/`.
- Travailler sur une base ou un environnement jetable ; un garde-fou refuse toute autre cible.
- Utiliser des données fictives, jamais un secret ni une donnée client à l'image.
- Restaurer en fin de capture tout état modifié pour la prise de vue.
- Honorer `DOC_PDF_GUIDE` si l'outil sait ne capturer qu'un guide ; sinon tout capturer.
- Sortir en code non nul au premier échec : `run` ne contrôle les images qu'après un succès.
