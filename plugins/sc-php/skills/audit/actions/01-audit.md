# Action 01 — audit

Orchestrate a PHP code quality review: detect applicable pivots, load them from the plugin, and delegate analysis to `aidd-dev:reviewer`.

## Transversal rules

- Invoke `01-scan` only — never `02-install-pivots`. Audit is read-only.
- Never install any file to `.claude/rules/` or any project path.
- All knowledge is read from `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/` at runtime.

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
${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<pivot-path>
```

Example: for `data/eloquent.md` → read `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/eloquent.md`

Collect all loaded pivot contents into an acceptance criteria document. Structure it as:

```
PHP Code Quality Criteria — sc-php 0.4.0

## PHP SOLID violations
<content of php/solid.md>

## Bruno test conventions   (only if testing/bruno.md was in the manifeste)
<content of testing/bruno.md>

[...additional capability pivots from manifeste...]
```

### Step 3 — Identify review targets

From the `01-scan` output, identify PHP source directories:
- Laravel: `app/Http/Controllers/`, `app/Models/`, `app/Services/`, `app/Repositories/`
- Symfony: `src/Controller/`, `src/Entity/`, `src/Service/`, `src/Repository/`
- WordPress: `wp-content/themes/`, `wp-content/plugins/`
- Generic: check `composer.json` `autoload.psr-4` for custom source roots
- Always exclude: `vendor/`

These form the `review_target` for the reviewer agent.

### Step 4 — Delegate to aidd-dev:reviewer

Spawn an Agent with `subagent_type: aidd-dev:reviewer`, passing in the prompt:

- `review_target`: the PHP source files/directories identified in Step 3 — the reviewer will read and analyze them
- `agreed_plan`: the aggregated PHP criteria document built in Step 2 (PHP capability pivots as the standard to verify against)

The reviewer returns a structured report with:
- items reviewed
- findings (violations of pivot best practices)
- completion score
- quality score

### Step 5 — Present results

Display the reviewer's report to the user. If `completion_score < 100`, note which criteria were not fully verified and suggest a follow-up targeted review.

## Output format

```
🔍 sc-php audit — PHP code quality review

Stack detected: Laravel + Eloquent ORM (+ Bruno testing)

Pivots loaded (2):
  php/solid.md
  testing/bruno.md

Review scope: app/Http/Controllers/, app/Models/, app/Services/

→ Delegating to aidd-dev:reviewer...

[reviewer report here]
```
