# Action 01 — scan

Detect project capabilities, map them to plugin rules, audit `.claude/rules/` to determine what is missing or outdated.

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

### Step 2 — Classify framework

| Signal | Framework |
|---|---|
| `laravel/framework` in composer.json, or `artisan` present | Laravel |
| `symfony/http-kernel` or `symfony/framework-bundle` in composer.json, or `bin/console` present | Symfony |
| `roots/sage`, `wp-config.php`, or `wp-content/` present | WordPress |

A project may match multiple (e.g. Laravel + HTMX).

### Step 3 — Classify data layer

| Signal | Data layer |
|---|---|
| `illuminate/database` or `laravel/framework` in composer.json | Eloquent ORM |
| `doctrine/orm` or `doctrine/dbal` in composer.json | Doctrine ORM |

### Step 4 — Detect frontend bridge

| Signal | Capability |
|---|---|
| `htmx` in any composer requires, or `hx-get`/`hx-post`/`hx-swap`/`hx-target` found in template files (*.blade.php, *.twig, *.html) | HTMX hybrid |

To detect HTMX from templates: search for `hx-get`, `hx-post`, `hx-swap`, or `hx-target` in template files within the project. Limit search to 200 files.

### Step 5 — Map capabilities to rules

<!-- Canonical mapping — referenced by setup/01-install.md and sniff/02-sync.md -->

(Canonical mapping — see below for the full reference→target table with detection conditions.)

For each capability, evaluate the detection condition and determine the rule to install.

#### Perf pivots (consumed by `web-optimize`)

| Capability | Condition | Reference → Target |
|---|---|---|
| Laravel perf | Laravel detected | `references/07-perf-pivots-laravel.md` → `.claude/rules/07-quality/perf-pivots-laravel.md` |
| Symfony perf | Symfony detected | `references/07-perf-pivots-symfony.md` → `.claude/rules/07-quality/perf-pivots-symfony.md` |
| WordPress perf | WordPress detected | `references/07-perf-pivots-wordpress.md` → `.claude/rules/07-quality/perf-pivots-wordpress.md` |
| HTMX perf | HTMX detected | `references/07-perf-pivots-htmx.md` → `.claude/rules/07-quality/perf-pivots-htmx.md` |

#### Data pivots (consumed by `data-optimize`)

| Capability | Condition | Reference → Target |
|---|---|---|
| Eloquent ORM | Eloquent detected | `references/08-data-pivots-eloquent.md` → `.claude/rules/07-quality/data-pivots-eloquent.md` |
| Doctrine ORM | Doctrine detected | `references/08-data-pivots-doctrine.md` → `.claude/rules/07-quality/data-pivots-doctrine.md` |

### Step 6 — Status each rule

For each required rule, determine status:
- File does not exist → **MISSING**
- File exists, content matches plugin reference → **UP-TO-DATE**
- File exists, content differs from plugin reference → **OUTDATED**
- Condition not met → **NOT-APPLICABLE** (do not install, do not audit)

### Step 7 — Detect gaps

A **gap** is a capability that is detected but for which the plugin has no matching rule or skill.

Check: are there packages in `composer.json` representing a capability not covered by any entry in Step 5?

Examples of gaps to report:
- `livewire/livewire` detected — no Livewire rule in plugin
- `inertiajs/inertia-laravel` detected — no Inertia.js rule in plugin
- `spatie/laravel-permission` detected — no authorization rule in plugin

List all gaps explicitly in the output.

## Output

Emit a structured manifest for `02-sync`:

```
📊 sc-php sniff — capability scan

Framework:
  ✅ Laravel (laravel/framework ^11.0)
  ❌ Symfony — not detected
  ❌ WordPress — not detected

Data layer:
  ✅ Eloquent ORM (illuminate/database)
  ❌ Doctrine ORM — not detected

Frontend bridge:
  ❌ HTMX — not detected

Capabilities → rules:
  Perf (Laravel)   ✅ perf-pivots-laravel.md
  Perf (Symfony)   — N/A (not detected)
  Perf (WordPress) — N/A (not detected)
  Perf (HTMX)      — N/A (not detected)
  Data (Eloquent)  ✅ data-pivots-eloquent.md
  Data (Doctrine)  — N/A (not detected)

Skills support:
  /web-optimize  ✅ (perf-pivots-laravel.md ready)
  /data-optimize ✅ (data-pivots-eloquent.md ready)

Gaps (no plugin rule):
  livewire/livewire — no Livewire rule in plugin

Rule audit:
  MISSING        .claude/rules/07-quality/perf-pivots-laravel.md
  OUTDATED       .claude/rules/07-quality/data-pivots-eloquent.md
  NOT-APPLICABLE perf-pivots-symfony.md (Symfony not detected)
  NOT-APPLICABLE perf-pivots-wordpress.md (WordPress not detected)
  NOT-APPLICABLE perf-pivots-htmx.md (HTMX not detected)
  NOT-APPLICABLE data-pivots-doctrine.md (Doctrine not detected)

→ sync will install 1 file, update 1 file.
```

Then proceed to action `02-sync`.
