# sc-php — état du plugin

| Champ | Valeur |
|---|---|
| Version courante | 0.16.0 |
| Dernière release | 2026-11-02 |

## Skills disponibles

sniff, audit, improve, legacy, teach, log-analysis, bruno, setup, design-bridge, builder-coverage, cd

## Capability pivots (chargés à l'audit)

`php/solid.md` (toujours), `testing/bruno.md` (si Bruno), `wordpress/ssr.md` (v0.5.2+, si WordPress détecté — authoring de blocs SSR : attributs additifs, `wp_kses_post`, compteurs serveur, `blocks/` vs `build/`, nav SSR vs show/hide JS), `prestashop/platform.md` (v0.16.0+, si PrestaShop détecté — code maison : modules, overrides, thème enfant)

## Pivot `tools/testing.md` (v0.10.0+)

Fournisseur du champ `testing` de `overcode:control` — 10 sections, anglais. Voir [pivots-testing.md](pivots-testing.md) pour la règle transversale. Deux faits propres à PHP à ne pas réapprendre : **l'unité de mesure est le composant, pas le dépôt** (une commande lancée à la racine d'un projet multi-modules rend zéro test), et **la couverture sans driver Xdebug/PCOV sort 0 sans écrire de fichier** — un consommateur qui lit le code de retour croit avoir réussi.

## Pivots perf

WordPress, Laravel, Symfony, HTMX hybrid

## Pivots data

Eloquent, Doctrine

## Réceptacles pivot design

`design-bridge` (v0.5.0+) — réceptacle pour `design:enforce` + `design:diffuse` :
- `01-realize-lint` → génère `design/lint/check-classes.php` (checker PHP avec placeholders `__VALID_BASES__`/`__VALID_CLASSES__` + theme.json coherence)
- `02-render` → block pattern WP FSE (commentaires Gutenberg + classes design + theme.json palette)

## PrestaShop (v0.16.0+)

Pas de skill `ci` séparée : Docker local et script de déploiement PrestaShop vivent dans `cd` (`references/prestashop.md` + `prestashop-templates.md`), parce que le contrat SC-CD impose un seul propriétaire de façade. Deux faits à ne pas réapprendre : le `bin/console` de PrestaShop n'en fait **pas** un projet Symfony pour `sniff`, et un dépôt PrestaShop en liste blanche ne versionne pas le core — la détection passe alors par l'image Compose ou les modules du projet. Source terrain : boutique `personal-shop` (PrestaShop 9.2, Alwaysdata), 2026-11-02.
