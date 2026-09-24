# Codebase Audit: plugins/design — ui

Le plugin n'a pas d'application front. Sa seule surface rendue est la planche de wireframes générée par `adapters/wireframes/wireframes.py`, auditée ici en statique.

- **Date**: 2026_09_24
- **Scope**: `plugins/design/` → gabarit HTML/CSS de `adapters/wireframes/wireframes.py` (aucun `.html`/`.css` suivi hors `fixtures/`)
- **Health**: good
- **Findings**: 0 critical, 0 warning, 3 minor

## Findings

| Sev | Category | Location | Issue | Suggested fix | Effort |
| --- | -------- | -------- | ----- | ------------- | ------ |
| 🟢  | ui | `plugins/design/adapters/wireframes/wireframes.py:158` | `<html lang="fr">` est codé en dur, et `references/wireframe-manifest.schema.json` n'a pas de champ de langue : une planche en anglais est annoncée en français aux lecteurs d'écran (WCAG 3.1.1) | Ajouter un champ `lang` optionnel au manifeste (défaut `fr`), l'échapper puis l'injecter | S |
| 🟢  | ui | `plugins/design/adapters/wireframes/wireframes.py:169` | `.wireframe-frame{…background:#fff}` : la valeur est codée en dur alors que le token `--paper:#fff` est défini ligne 164. Dérive de token dans le gabarit même | `background:var(--paper)` | S |
| 🟢  | ui | `plugins/design/adapters/wireframes/wireframes.py:164` | `--line:#aeb5bf` sur `#fff` donne un contraste de 2.07:1, sous le 3:1 exigé pour les bords de composants non textuels (WCAG 1.4.11). Les cadres et placeholders pointillés (`:171`) sont peu visibles | Assombrir `--line` à environ `#8a929c` (≥ 3:1) | S |

## Top actions

1. Rendre `lang` paramétrable par le manifeste (ligne 1).
2. Aligner le gabarit sur ses propres tokens (`--paper`, et `--line` à ≥ 3:1) (lignes 2-3).
3. Aucun handoff requis : trois correctifs S dans un même fichier.

## Coverage

- **Scanned**: ui, inspection statique du gabarit. Vérifications :
  - `viewport` présent (`:161`) ;
  - hiérarchie `h1` → `h2` → `h3` cohérente (`:137-178`) ;
  - échappement `html.escape` du titre, des libellés et des ids ;
  - contraste du texte `--ink`/`--board-bg` 13.65:1, et du placeholder `#68707a`/`#fff` 5.02:1 (conforme AA).
- **Skipped**: aucune URL fournie, donc pas de passe a11y runtime (inspection statique seulement). États loading/error/empty sans objet (planche statique, aucune donnée asynchrone).
