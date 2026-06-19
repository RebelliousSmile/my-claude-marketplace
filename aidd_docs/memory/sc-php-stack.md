# sc-php — état du plugin

| Champ | Valeur |
|---|---|
| Version courante | 0.5.2 |
| Dernière release | 2026-06-19 |

## Skills disponibles

sniff, audit, improve, legacy, teach, design-bridge

## Capability pivots (chargés à l'audit)

`php/solid.md` (toujours), `testing/bruno.md` (si Bruno), `wordpress/ssr.md` (v0.5.2+, si WordPress détecté — authoring de blocs SSR : attributs additifs, `wp_kses_post`, compteurs serveur, `blocks/` vs `build/`, nav SSR vs show/hide JS)

## Pivots perf

WordPress, Laravel, Symfony, HTMX hybrid

## Pivots data

Eloquent, Doctrine

## Réceptacles pivot design

`design-bridge` (v0.5.0+) — réceptacle pour `design:enforce` + `design:diffuse` :
- `01-realize-lint` → génère `design/lint/check-classes.php` (checker PHP avec placeholders `__VALID_BASES__`/`__VALID_CLASSES__` + theme.json coherence)
- `02-render` → block pattern WP FSE (commentaires Gutenberg + classes design + theme.json palette)
