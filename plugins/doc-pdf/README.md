# doc-pdf

Moteur interprojets de documentation PDF, charte Scriptami unique. La documentation reste en Markdown dans le dépôt de chaque client ; le moteur, lui, vit ici.

## Ce qu'il fait

1. **Markdown → ICML** (Pandoc) avec le jeu de styles fermé de la charte, manifeste d'empreintes (`output/icml/.manifest.json`) : un ICML corrigé à la main arrête la régénération sauf `--force`.
2. **Modèle IDML** de la charte (gabarits, pages d'exemple).
3. **Mise à jour d'un `.indd` existant** : copie de sauvegarde, liens rafraîchis, pages ajoutées ou retirées, export PDF.

## Prérequis

- Node.js, Pandoc dans le PATH (`icml`, `pdf`).
- Adobe InDesign et un PowerShell lancé en administrateur (`pdf` uniquement, document fermé).

## Utilisation

```sh
node <racine du plugin>/engine/cli.js init            # écrit documentation.config.json
node <racine du plugin>/engine/cli.js merge --check
node <racine du plugin>/engine/cli.js icml [--force]
node <racine du plugin>/engine/cli.js idml --gabarits --guide <id>
node <racine du plugin>/engine/cli.js pdf update --guide <id>
```

Toutes les commandes acceptent `--config <chemin>` ; sinon la configuration est cherchée en remontant depuis le dossier courant.

## Tests

```sh
cd engine && pnpm install --ignore-workspace && node node_modules/jest/bin/jest.js
```

Voir `references/runbook-export-indesign.md` pour la mise en page dans InDesign.
