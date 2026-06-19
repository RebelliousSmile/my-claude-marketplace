# Action 01 — realize-tokens

## Rôle

Générer `design/css/tokens.css` depuis `design/tokens.json` — un fichier de custom properties CSS organisées en `@layer design.tokens`.

## Procédure

1. Lire `design/tokens.json`.
2. Traverser l'arbre de tokens (format W3C DTCG : `$value` + `$type`).
3. Résoudre les références alias (`{token.path}` → valeur finale).
4. Pour chaque token feuille, dériver le nom CSS :
   - `color.brand.primary` → `--color-brand-primary`
   - `font.size.sm` → `--font-size-sm`
   - `space.4` → `--space-4`
5. Grouper par catégorie dans le fichier produit (commentaires de section : `/* color.brand */`, `/* font.size */`, etc.).
6. Écrire dans `@layer design.tokens { :root { ... } }`.
7. Si `design/css/tokens.css` existe déjà, comparer et signaler les tokens ajoutés/supprimés/modifiés avant d'écrire.

## Gestion des types DTCG

| `$type` | Valeur CSS produite |
|---------|---------------------|
| `color` | valeur hex/rgb/hsl telle quelle |
| `dimension` | valeur avec unité (`px`, `rem`) telle quelle |
| `fontFamily` | valeur entre guillemets si contient un espace |
| `fontWeight` | valeur numérique |
| `lineHeight` | valeur numérique ou dimension |
| `shadow` | valeur shadow CSS (`offset-x offset-y blur spread color`) |
| `duration` | valeur en `ms` |
| `cubicBezier` | `cubic-bezier(x1, y1, x2, y2)` |

## Output

```
✅ design/css/tokens.css — 87 custom properties générées
   Groupes : color (42), font (18), space (16), radius (6), shadow (5)
   Nouveau : --color-semantic-error (#dc2626) — non présent dans la version précédente
```
