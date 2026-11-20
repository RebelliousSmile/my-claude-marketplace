# Modèle

## Rôle

Obtenir une maquette valide et son spécimen, avec les ICML et les modèles IDML prêts à être composés. Aucun InDesign ici.

## Entrées

- Le dossier cible de la maquette (hors du projet client, dépôt dédié recommandé). Le demander et le faire confirmer par l'utilisateur avant `maquette init` ; ne jamais en choisir un dans un projet client. Un distant pour ce dépôt n'est créé qu'avec son accord.
- Un nom (`[a-z0-9-]+`, défaut : nom du dossier), une couleur d'axe par défaut, un logo SVG.

## Processus

1. Créer le squelette : `node <DOC_PDF_PLUGIN_ROOT>/engine/cli.js maquette init <dossier> [--nom <nom>]`. La commande refuse un nom invalide et un dossier non vide, avant toute écriture.
2. Remplir `maquette.json` (page, grille, couleurs, axes, polices, textes, pied et mentions) et remplacer `logo.svg`. Garder les noms de styles du squelette.
3. Le spécimen est copié par `maquette init`. Pour une maquette plus ancienne qui n'en a pas : `maquette specimen <dossier>` (refus s'il existe déjà).
4. Vérifier que la maquette se charge : `node <DOC_PDF_PLUGIN_ROOT>/engine/cli.js idml --config <dossier>/specimen/documentation.config.json --gabarits`.
5. Générer les ICML (Pandoc) puis l'IDML du guide du spécimen : `icml`, puis `idml --guide specimen`, avec `--config <dossier>/specimen/documentation.config.json`.

## Sortie

Une maquette valide, un spécimen, `specimen/output/icml` et `specimen/output/idml`. Passer à `calage`.
