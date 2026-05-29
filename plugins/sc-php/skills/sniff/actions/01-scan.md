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

#### 5a — Capability pivots (loaded at audit time, NOT installed to disk)

For each capability, evaluate the detection condition and record the applicable pivot path (under `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/`). These paths are **never installed** — they are loaded on demand by `/sc-php:audit`.

| Capability | Condition | Pivot path (via `${CLAUDE_PLUGIN_ROOT}`) |
|---|---|---|
| PHP SOLID violations | always (every PHP project) | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/php/solid.md` |
| Bruno test conventions | `bruno/` folder or `*.bru` files detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/testing/bruno.md` |

#### 5b — Perf pivots (install targets, consumed by `web-optimize`)

These pivots are installed to `.claude/rules/07-quality/` by `02-install-pivots`. Unlike capability pivots, they ARE written to disk.

| Condition | Source | Target |
|---|---|---|
| Laravel detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/laravel.md` | `.claude/rules/07-quality/perf-pivots-laravel.md` |
| Symfony detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/symfony.md` | `.claude/rules/07-quality/perf-pivots-symfony.md` |
| WordPress detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/wordpress.md` | `.claude/rules/07-quality/perf-pivots-wordpress.md` |
| HTMX detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/htmx.md` | `.claude/rules/07-quality/perf-pivots-htmx.md` |

#### 5c — Data pivots (install targets, consumed by `data-optimize`)

| Condition | Source | Target |
|---|---|---|
| Eloquent detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/eloquent.md` | `.claude/rules/07-quality/data-pivots-eloquent.md` |
| Doctrine detected | `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/doctrine.md` | `.claude/rules/07-quality/data-pivots-doctrine.md` |

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

### Step 8 — Build Skills support summary

**This step is mandatory. Do not skip it.**

For each downstream skill, determine readiness based on the results of Steps 5–7:

| Skill | Ready if… | Not applicable if… |
|---|---|---|
| `/web-optimize` | ≥ 1 perf pivot is MISSING or UP-TO-DATE | no perf pivot applicable |
| `/data-optimize` | ≥ 1 data pivot is MISSING or UP-TO-DATE | no data pivot applicable |
| `/sc-php:audit` | always ready (capability pivots always loaded) | — |

For each skill, emit one line:
- `✅ /skill-name — reason` (ready or will be ready after install)
- `— /skill-name — NOT APPLICABLE — reason` (no applicable pivot)

This summary MUST appear in the output as the `Skills support:` section, immediately before `Gaps`.

## Output

> **FORMAT CONSTRAINTS — do not deviate:**
> - Use EXACTLY the plain-text format shown below. Do NOT use markdown tables.
> - All sections are mandatory: Framework, Data layer, Frontend bridge, Testing harness, Pivot manifeste, Perf pivots, Data pivots, **Skills support**, Gaps.
> - List every detection (✅ detected / ❌ not detected) for every framework, ORM, and frontend bridge — even when not detected.
> - The **Skills support** section must always appear and must reflect the current pivot status.

Emit a structured pivot manifeste:

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

Testing harness:
  ✅ Bruno (bruno/ directory detected)

Pivot manifeste — capability pivots (loaded at audit time, not installed):
  (load via ${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<path>)
  php/solid.md                        (always — every PHP project)
  testing/bruno.md                    (bruno/ detected)

Perf pivots (→ 02-install-pivots will write to .claude/rules/07-quality/):
  perf/laravel.md  → perf-pivots-laravel.md   MISSING
  perf/symfony.md  → perf-pivots-symfony.md   NOT-APPLICABLE (Symfony not detected)
  perf/wordpress.md → perf-pivots-wordpress.md NOT-APPLICABLE (WordPress not detected)
  perf/htmx.md    → perf-pivots-htmx.md      NOT-APPLICABLE (HTMX not detected)

Data pivots (→ 02-install-pivots will write to .claude/rules/07-quality/):
  data/eloquent.md → data-pivots-eloquent.md  MISSING
  data/doctrine.md → data-pivots-doctrine.md  NOT-APPLICABLE (Doctrine not detected)

Skills support:
  /web-optimize  ✅ (perf-pivots-laravel.md — MISSING, will be installed)
  /data-optimize ✅ (data-pivots-eloquent.md — MISSING, will be installed)
  /sc-php:audit  ✅ (capability pivots: php/solid.md, testing/bruno.md)

Gaps (no plugin pivot):
  livewire/livewire — no Livewire capability pivot in plugin

→ Proceed to 02-install-pivots.
```

Then proceed to action `02-install-pivots`.
