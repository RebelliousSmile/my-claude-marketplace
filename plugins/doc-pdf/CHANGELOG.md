# Changelog

## 0.1.0

- Première version. Moteur issu du projet cerascan (`scripts/guides/`, branche `feat/export-icml-guides`) : Markdown vers ICML (Pandoc), modèle IDML de la charte Scriptami, manifeste d'empreintes des ICML, mise à jour d'un `.indd` existant et export PDF par InDesign.
- Configuration par projet : `documentation.config.json` (guides, `document`, `pdfPreset`).
- Point d'entrée `engine/cli.js` : `init`, `merge`, `icml`, `idml`, `pdf`.
- La mise à jour d'un `.indd` (commande `pdf update`) n'a pas encore été vérifiée dans InDesign : le COM exige un PowerShell administrateur.
