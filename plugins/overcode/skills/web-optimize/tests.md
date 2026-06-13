# web-optimize — smoke tests

> Run these before trusting `web-optimize` on a new stack or after editing `SKILL.md` / `framework-mapping.md`.
> Purpose: verify the **detection step** produces the expected stack label and points to the right checklist source.

## How to use

For each case below:
1. `cd` into a project matching the description (or a minimal fixture).
2. Run the Quick Start detection commands from `SKILL.md`.
3. Compare the detected stack + chosen checklist against the **Expected** column.
4. If mismatch → fix `SKILL.md` Step 1 detection logic OR `framework-mapping.md` pivots.

## Test matrix

| # | Project shape (files present)                                         | Expected stack             | Expected checklist source                                                                  |
|---|------------------------------------------------------------------------|----------------------------|---------------------------------------------------------------------------------------------|
| 1 | `package.json` with `"nuxt": "^3.x"`, `nuxt.config.ts`                 | `nuxt3`                    | `aidd_docs/templates/dev/perf_checklist_nuxt.md` (existing template)                        |
| 2 | `package.json` with `"vue": "^3.x"` + `vite.config.ts`, **no** `nuxt`  | `vue-spa`                  | Generate `perf_checklist_vue-spa.md` (propose to user)                                      |
| 3 | `manage.py` + `requirements.txt` with `Django==`                       | `django`                   | Generate `perf_checklist_django.md`                                                         |
| 4 | `manage.py` + `<script src=".../alpinejs">` in templates               | `django+alpine` (hybrid)   | Load Django pivots **+** section `## Django + Alpine.js (hybride classique)`                |
| 5 | `composer.json` with `"laravel/framework"` + `artisan`                 | `php-laravel`              | Generate `perf_checklist_php-laravel.md`                                                    |
| 6 | `composer.json` with `"symfony/framework-bundle"` + `bin/console`      | `php-symfony`              | Generate `perf_checklist_php-symfony.md`                                                    |
| 7 | `wp-config.php` present                                                | `wordpress`                | Use section `## PHP vanilla / WordPress / autres`                                           |
| 8 | `astro.config.mjs` + `package.json` with `"astro"`                     | `astro`                    | Generate `perf_checklist_astro.md` (use Static section pivots)                              |
| 9 | `package.json` Laravel + `<script ... alpinejs>` in `*.blade.php`      | `php+alpine` (hybrid)      | Load Laravel pivots **+** Alpine pivots from `## Django + Alpine.js (hybride classique)`    |
|10 | None of the above (e.g. Go + htmx)                                     | `other` (fallback)         | Trigger fallback flow — ask user 3 infos, build from 10 generic sections                    |

## Failure modes to catch

- **False Nuxt match**: Vue SPA project misidentified as Nuxt because `nuxt` appears in a transitive dep — detection must grep the **direct** deps section, not all of `package.json`
- **Missed hybrid**: Django + Alpine project audited as pure Django (Alpine pivots skipped) — Step 1.4 must trigger BOTH-layer load
- **Silent fallback**: skill picks `perf_checklist_nuxt.md` for a non-Nuxt stack instead of stopping to propose generation
- **DEC dependency leak**: skill writes to `aidd_docs/internal/decisions/` on a project where that folder doesn't exist (must be conditional per Rule 7)

## When to update

- After adding a new pivot in `framework-mapping.md` → add a row here covering the new stack
- After fixing a detection bug → add the failing project shape as a regression case
