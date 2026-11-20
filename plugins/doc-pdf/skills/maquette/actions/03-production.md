# Production

## Rôle

Brancher une maquette calée à un projet client et produire ses guides.

## Processus

1. Dans le projet : `node <DOC_PDF_PLUGIN_ROOT>/engine/cli.js init --maquette <dossier>` (écrit `documentation.config.json`, refuse d'écraser).
2. Régénérer les ICML (`icml`) ; si un ICML modifié à la main arrête l'export, le montrer, `--force` seulement avec l'accord de l'utilisateur.
3. Générer l'IDML du guide (`idml --guide <id>`).
4. Avec l'accord de l'utilisateur et InDesign fermé : `pdf compose --guide <id>`, puis `pdf update` aux mises à jour suivantes.
5. Lire quelques pages rendues avant de livrer.

## Sortie

`.indd` et PDF sous `output/` du projet. Le projet ne garde que sa configuration ; la maquette reste hors du projet.
