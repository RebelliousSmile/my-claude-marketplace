# Audit

Orchestrate a PHP code quality review: detect applicable pivots, load them from the plugin, and delegate analysis to `aidd-dev:04-audit`.

## Transversal rules

- Invoke `01-scan` only — never `02-install-pivots`. Audit is read-only.
- Never install any file to `.claude/rules/` or any project path.
- All knowledge is read from `${SC_PHP_PLUGIN_ROOT}/skills/sniff/references/capabilities/` at runtime.

## Process

### Step 1 — Detect stack (invoke 01-scan only)

Run sniff `01-scan` on the project to detect the stack and obtain the pivot manifeste.

**Important**: invoke `01-scan` only — do not invoke `02-install-pivots`. Audit never triggers side effects.

Output: pivot manifeste listing applicable capability reference paths (e.g. `php/solid.md`, `data/eloquent.md`, `testing/bruno.md`, etc.)

If `composer.json` / `artisan` / `bin/console` / `wp-config.php` are all absent, abort with:
```
❌ sc-php audit — no PHP project detected. Run from the project root.
```

### Step 2 — Load capability pivots

For each capability pivot path in the manifeste, read the corresponding reference file:

```
${SC_PHP_PLUGIN_ROOT}/skills/sniff/references/capabilities/<pivot-path>
```

Example: for `data/eloquent.md` → read `${SC_PHP_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/eloquent.md`

Collect all loaded pivot contents into an acceptance criteria document. Structure it as:

```
PHP Code Quality Criteria — sc-php 0.4.0

## PHP SOLID violations
<content of php/solid.md>

## Bruno test conventions   (only if testing/bruno.md was in the manifeste)
<content of testing/bruno.md>

## WordPress SSR block authoring   (only if wordpress/ssr.md was in the manifeste)
<content of wordpress/ssr.md>

## WordPress FSE pattern authoring   (only if wordpress/fse-patterns.md was in the manifeste)
<content of wordpress/fse-patterns.md>

## PrestaShop custom code   (only if prestashop/platform.md was in the manifeste)
<content of prestashop/platform.md>

[...additional capability pivots from manifeste...]
```

### Step 3 — Identify review targets

From the `01-scan` output, identify PHP source directories:
- Laravel: `app/Http/Controllers/`, `app/Models/`, `app/Services/`, `app/Repositories/`
- Symfony: `src/Controller/`, `src/Entity/`, `src/Service/`, `src/Repository/`
- WordPress: `wp-content/themes/`, `wp-content/plugins/`
- PrestaShop: project modules (`modules/<prefix>_*/`), `override/`, the child theme — never core, stock theme or marketplace modules
- Generic: check `composer.json` `autoload.psr-4` for custom source roots
- Always exclude: `vendor/`

These form the `review_target` for the AIDD audit.

### Step 4 — Delegate to aidd-dev:04-audit

Resolve `aidd-dev:04-audit` from the host's available-skills catalogue and read its complete
`SKILL.md`. Invoke its `code-quality` pillar with:

- the PHP review targets identified in Step 3 as the audit scope;
- the capability pivots loaded in Step 2 as supplementary, stack-specific lenses;
- an instruction that every loaded pivot be accounted for either by a concrete finding, a
  "reviewed — no finding" coverage note, or an "unscannable" coverage note with its reason.

Preserve the AIDD audit's own report schema and artifact path. Do not spawn the retired
Do not introduce a retired reviewer agent type or impose a second scoring rubric on the delegated report.

If the package, canonical skill, or `code-quality` pillar is unavailable, stop the delegation,
name the missing capability, and return no substitute generic audit.

### Step 5 — Present results

Read the resulting `code-quality.md` artifact. Return its path and a compact delegation receipt
that maps every loaded pivot to `finding`, `reviewed — no finding`, or `unscannable`. Do not
copy the report into a competing local report format.

## Output format

```text
🔍 sc-php audit — PHP code quality

Pivots loaded: <n>
Review scope: app/Http/Controllers/, app/Models/, app/Services/
Delegated to: aidd-dev:04-audit / code-quality
Artifact: <aidd_docs/tasks/.../code-quality.md>

Pivot receipt:
  <pivot-path>  <finding | reviewed — no finding | unscannable>
```
