# Action 01 — scan

Detect the PHP stack in the current project and audit `.claude/rules/` to determine which rules are missing or outdated.

## Process

### Step 1 — Read project manifests

Check for the following files (in order of priority):

1. `composer.json` — parse `require` and `require-dev` sections
2. `artisan` — presence alone means Laravel
3. `bin/console` — presence alone means Symfony
4. `wp-config.php` — presence means WordPress
5. `wp-content/` directory — presence means WordPress

If none of these exist, abort:
```
❌ sc-php sniff — no PHP project detected
   Expected: composer.json, artisan, bin/console, or wp-config.php
   Aborting.
```

### Step 2 — Classify stack

Evaluate the following signals to determine which frameworks and ORMs are active. A project can have multiple stacks (e.g. Laravel + HTMX).

| Signal | Stack |
|---|---|
| `laravel/framework` in composer.json requires | Laravel |
| `artisan` file present | Laravel |
| `symfony/http-kernel` or `symfony/framework-bundle` in composer.json | Symfony |
| `bin/console` present | Symfony |
| `roots/sage` or `wp-config.php` or `wp-content/` | WordPress |
| `htmx` in any composer requires, or `hx-` attributes found in template files (*.blade.php, *.twig, *.html.twig) | HTMX hybrid |
| `illuminate/database` or `laravel/framework` in composer.json | Eloquent ORM |
| `doctrine/orm` or `doctrine/dbal` in composer.json | Doctrine ORM |

To detect HTMX from templates: search for `hx-get`, `hx-post`, `hx-swap`, or `hx-target` in `.blade.php`, `.twig`, `.html` files within the project. Limit search to 200 files.

### Step 3 — Audit installed rules

For each detected stack, determine the required rule file and its status:

| Stack detected | Rule file | Required? |
|---|---|---|
| Laravel | `.claude/rules/07-quality/perf-pivots-laravel.md` | ✅ |
| Symfony | `.claude/rules/07-quality/perf-pivots-symfony.md` | ✅ |
| WordPress | `.claude/rules/07-quality/perf-pivots-wordpress.md` | ✅ |
| HTMX | `.claude/rules/07-quality/perf-pivots-htmx.md` | ✅ |
| Eloquent ORM | `.claude/rules/07-quality/data-pivots-eloquent.md` | ✅ |
| Doctrine ORM | `.claude/rules/07-quality/data-pivots-doctrine.md` | ✅ |

For each required rule file, check its status:
- File does not exist → mark **MISSING**
- File exists and content matches the plugin's corresponding `references/` file → mark **UP-TO-DATE**
- File exists but content differs from the plugin's corresponding `references/` file → mark **OUTDATED**

To compare content: read the installed file and the plugin reference file, then check for any textual difference (ignore trailing whitespace). If they differ, mark as OUTDATED.

## Output

Emit a structured manifest for `02-sync`:

```
📊 sc-php sniff — scan results

Stack detected:
  ✅ Laravel (from: laravel/framework ^11.0)
  ✅ Eloquent ORM (from: illuminate/database)
  ❌ Symfony — not detected
  ❌ WordPress — not detected
  ❌ HTMX — not detected
  ❌ Doctrine ORM — not detected

Rule audit (required for detected stack):
  MISSING   .claude/rules/07-quality/perf-pivots-laravel.md
  OUTDATED  .claude/rules/07-quality/data-pivots-eloquent.md

→ sync will install 1 file, update 1 file.
```

Then proceed to action `02-sync`.
