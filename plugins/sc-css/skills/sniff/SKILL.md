---
name: sniff
model: sonnet
description: >-
  CSS stack detector. Analyse les fichiers de style présents pour détecter l'architecture
  CSS (BEM, utility-first, CSS Modules, ITCSS), le préprocesseur (PostCSS, Sass/SCSS, Less,
  vanilla), les outils de lint (Stylelint, Biome), l'usage des couches de cascade (cascade
  layers), et le degré d'adoption des custom properties. Émet un pivot manifeste consommé
  par audit, improve, et design-bridge.
---

# sc-css:sniff

Détecteur d'architecture CSS et producteur de pivot manifeste.

## Actions disponibles

| # | Action | Rôle | Input |
|---|--------|------|-------|
| 01 | `scan` | Détecter architecture + stack, émettre pivot manifeste | chemins des fichiers CSS/SCSS du projet |
| 02 | `install-pivots` | Installer les pivots d'amélioration dans `.claude/rules/07-quality/` | pivot manifeste de scan |

## Default flow

Séquentiel : `scan` → `install-pivots` (si installation demandée).

## Modèle conceptuel

- **Architecture** : le style d'organisation des règles (BEM, utility-first, SMACSS, ITCSS, ad-hoc).
- **Stack** : outils en place (préprocesseur, linter, bundler CSS).
- **Maturité** : degré d'adoption de custom properties et cascade layers — indicateurs d'une base modernisable.
- **Pivot manifeste** : document JSON émis en fin de scan, consommé par audit et improve pour charger les patterns pertinents.

## Indicateurs de détection

| Signal | Détection |
|--------|-----------|
| `package.json` → `sass`, `postcss`, `less` | préprocesseur |
| `.stylelintrc*`, `biome.json` | linter CSS |
| Fichiers `*.module.css`, `*.module.scss` | CSS Modules |
| Classes `tw-`, `text-`, `flex`, `grid` systématiques | Tailwind / utility-first |
| Classes `__`, `--` systématiques | BEM |
| `@layer` dans les fichiers | cascade layers adoptés |
| `--` custom properties omniprésentes | design tokens en custom props |
| Aucune des structures ci-dessus | architecture ad-hoc |

## Règles transversales

- Si aucun fichier CSS/SCSS/Less n'est trouvé, arrêter avec un message explicite.
- Ne pas installer de pivot pour un pattern non détecté.
- Signaler les gaps : pattern détecté mais aucun pivot plugin correspondant.
- Rapport en plain-text avec `✅ / ❌` par item — pas de tableaux Markdown.
