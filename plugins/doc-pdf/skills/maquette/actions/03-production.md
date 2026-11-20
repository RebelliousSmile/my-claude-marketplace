# Production

## Rôle

Brancher une maquette calée à un projet client et produire ses guides.

## Processus

1. Dans le projet : `node <DOC_PDF_PLUGIN_ROOT>/engine/cli.js init --maquette <dossier>` (écrit `documentation.config.json`, refuse d'écraser).
2. Régénérer les ICML (`icml`) ; si un ICML modifié à la main arrête l'export, le montrer, `--force` seulement avec l'accord de l'utilisateur.
3. Générer l'IDML du guide (`idml --guide <id>`).
4. Avec l'accord de l'utilisateur et InDesign fermé : `pdf compose --guide <id>`, puis `pdf update` aux mises à jour suivantes.
5. Lire le constat d'empreintes avant/après imprimé par `pdf compose`/`pdf update` (alerte « Aucun ICML n'a changé » : chercher la cause, ne pas supposer que le correctif a atteint le PDF).
6. Lire quelques pages rendues avant de livrer. Un défaut de mise en page se règle dans `maquette.json` via l'action `calage`, jamais par une retouche du `.indd` (écrasée à la recomposition).

## Sortie

`.indd` et PDF sous `output/` du projet. Le projet ne garde que sa configuration ; la maquette reste hors du projet.
