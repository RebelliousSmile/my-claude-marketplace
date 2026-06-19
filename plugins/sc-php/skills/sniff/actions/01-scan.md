# Action 01 — scan

> **OUTPUT FORMAT — enforced before any processing:**
> The output of this action MUST use the exact plain-text format defined in the [Output](#output) section below.
> **Markdown tables are strictly forbidden.** Use `✅ / ❌` lines with indentation, exactly as shown in the template.

Detect project capabilities, map them to PHP knowledge pivots, and emit a pivot manifeste for use by `02-install-pivots` and `/sc-php:audit`.

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

### Step 4b — Detect testing harness

Check the project root for:
- A `bruno/` directory (presence alone is sufficient)
- Any `*.bru` files at the project root level (limit search to 100 files)

If either signal is found, enable the `testing/bruno.md` capability pivot.

### Step 5 — Map capabilities to knowledge pivots

#### 5a — Capability pivots (loaded at audit time by `/sc-php:audit`, NOT installed to disk)

| Capability | Condition | Pivot path (via `${CLAUDE_PLUGIN_ROOT}`) |
|---|---|---|
| PHP SOLID violations | always (every PHP project) | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/php/solid.md` |
| Bruno test conventions | `bruno/` folder or `*.bru` files detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/testing/bruno.md` |
| WordPress SSR block authoring | WordPress detected (Step 2) | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/wordpress/ssr.md` |

After listing capability pivots, append the `/sc-php:audit` readiness line:
- → `/sc-php:audit` : PRÊT (capability pivots: list the active ones)

#### 5b — Perf pivots (install targets, consumed by `/web-optimize`)

| Condition | Source | Target |
|---|---|---|
| Laravel detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/laravel.md` | `.claude/rules/07-quality/perf-pivots-laravel.md` |
| Symfony detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/symfony.md` | `.claude/rules/07-quality/perf-pivots-symfony.md` |
| WordPress detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/wordpress.md` | `.claude/rules/07-quality/perf-pivots-wordpress.md` |
| HTMX detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/htmx.md` | `.claude/rules/07-quality/perf-pivots-htmx.md` |

After listing perf pivots, append the `/web-optimize` readiness line:
- If ≥ 1 perf pivot applicable → `/web-optimize` : PRÊT (will be installed by 02-install-pivots)
- If no perf pivot applicable → `/web-optimize` : NOT APPLICABLE (no framework detected)

#### 5c — Data pivots (install targets, consumed by `/data-optimize`)

| Condition | Source | Target |
|---|---|---|
| Eloquent detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/eloquent.md` | `.claude/rules/07-quality/data-pivots-eloquent.md` |
| Doctrine detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/doctrine.md` | `.claude/rules/07-quality/data-pivots-doctrine.md` |

After listing data pivots, append the `/data-optimize` readiness line:
- If ≥ 1 data pivot applicable → `/data-optimize` : PRÊT (will be installed by 02-install-pivots)
- If no data pivot applicable → `/data-optimize` : NOT APPLICABLE (no ORM detected)

### Step 6 — Status each perf/data pivot

For each perf and data pivot that is applicable (condition met), determine status:
- File does not exist → **MISSING**
- File exists, content matches plugin reference → **UP-TO-DATE**
- File exists, content differs from plugin reference → **OUTDATED**
- Condition not met → **NOT-APPLICABLE** (do not install, do not audit)

Capability pivots (from Step 5a) are never statused — they are not installed to disk.

### Step 7 — Detect gaps

A **gap** is a capability that is detected but for which the plugin has no matching pivot.

Check: are there packages in `composer.json` representing a capability not covered by any entry in Step 5?

Examples of gaps to report:
- `livewire/livewire` detected — no Livewire capability pivot in plugin
- `inertiajs/inertia-laravel` detected — no Inertia.js capability pivot in plugin
- `spatie/laravel-permission` detected — no authorization capability pivot in plugin

List all gaps explicitly in the output.

## Output

> **FORMAT CONSTRAINTS — do not deviate:**
> - Use EXACTLY the plain-text format shown below. Do NOT use markdown tables.
> - All sections are mandatory: Framework, Data layer, Frontend bridge, Testing harness, Pivot manifeste, Gaps.
> - List every detection (✅ detected / ❌ not detected) for every framework, ORM, and frontend bridge — even when not detected.
> - Each subsection of Pivot manifeste MUST end with a `→ /skill-name :` readiness line (see template).

Emit a structured pivot manifeste:

```
📊 sc-php sniff — capability scan

Framework:
  ❌ Laravel — not detected
  ❌ Symfony — not detected
  ❌ WordPress — not detected

Data layer:
  ❌ Eloquent ORM — not detected
  ❌ Doctrine ORM — not detected

Frontend bridge:
  ❌ HTMX — not detected

Testing harness:
  ✅ Bruno (bruno/ directory detected)

Pivot manifeste:
  Capability pivots (loaded at audit time, not installed):
    ✅ php/solid.md     (always — every PHP project)
    ✅ testing/bruno.md (bruno/ detected)
  → /sc-php:audit : PRÊT

  Perf pivots → .claude/rules/07-quality/:
    — aucun (pas de framework détecté)
  → /web-optimize : NOT APPLICABLE

  Data pivots → .claude/rules/07-quality/:
    — aucun (pas d'ORM détecté)
  → /data-optimize : NOT APPLICABLE

Gaps (no plugin pivot):
  livewire/livewire — no Livewire capability pivot in plugin

→ Proceed to 02-install-pivots.
```

**Example — Laravel + Eloquent:**
```
Pivot manifeste:
  Capability pivots (loaded at audit time, not installed):
    ✅ php/solid.md (always — every PHP project)
  → /sc-php:audit : PRÊT

  Perf pivots → .claude/rules/07-quality/:
    perf/laravel.md → perf-pivots-laravel.md   MISSING
  → /web-optimize : PRÊT (will be installed)

  Data pivots → .claude/rules/07-quality/:
    data/eloquent.md → data-pivots-eloquent.md MISSING
  → /data-optimize : PRÊT (will be installed)
```

**Example — WordPress:**
```
Pivot manifeste:
  Capability pivots (loaded at audit time, not installed):
    ✅ php/solid.md     (always — every PHP project)
    ✅ wordpress/ssr.md (WordPress detected)
  → /sc-php:audit : PRÊT

  Perf pivots → .claude/rules/07-quality/:
    perf/wordpress.md → perf-pivots-wordpress.md MISSING
  → /web-optimize : PRÊT (will be installed)

  Data pivots → .claude/rules/07-quality/:
    — aucun (pas d'ORM détecté)
  → /data-optimize : NOT APPLICABLE
```

Then proceed to action `02-install-pivots`.
