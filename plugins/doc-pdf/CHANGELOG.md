# Changelog

## 0.2.0

- Commande `pdf compose` : compose tous les chapitres d'un guide dans le modèle IDML (ouverture, corps chaîné, en-têtes, pages blanches pour garder chaque ouverture à droite), crée les liens ICML qu'`update` rafraîchira ensuite. Un `.indd` existant n'est remplacé qu'avec `--remplacer` (copie de sauvegarde). Script InDesign non vérifié : colonne marginale et renvois laissés vides.
- Constat des fichiers après `pdf update` et `pdf compose` : empreintes avant/après des ICML, de l'IDML, du `.indd` et du PDF, avec une alerte quand aucun ICML n'a changé. Sert à prouver qu'un correctif a atteint les sorties avant de l'annoncer livré (et non à supposer que le cache ou une ancienne copie n'est pas en cause).

## 0.1.0

- Première version. Moteur issu du projet cerascan (`scripts/guides/`, branche `feat/export-icml-guides`) : Markdown vers ICML (Pandoc), modèle IDML de la charte Scriptami, manifeste d'empreintes des ICML, mise à jour d'un `.indd` existant et export PDF par InDesign.
- Configuration par projet : `documentation.config.json` (guides, `document`, `pdfPreset`).
- Point d'entrée `engine/cli.js` : `init`, `merge`, `icml`, `idml`, `pdf`.
- La mise à jour d'un `.indd` (commande `pdf update`) n'a pas encore été vérifiée dans InDesign : le COM exige un PowerShell administrateur.
