# Action 02 — install-pivots

Install perf and data pivots to `.claude/rules/07-quality/` for consumption by `web-optimize` and `data-optimize`. Does not install capability rules — those are loaded on demand by `/sc-js:audit`.

## Process

Read the pivot manifeste emitted by `01-scan`. For each perf or data pivot listed:

### Perf pivots — install to `.claude/rules/07-quality/`

| Source (in plugin) | Target (in project) |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/nuxt.md` | `.claude/rules/07-quality/perf-pivots-nuxt.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/vue-spa.md` | `.claude/rules/07-quality/perf-pivots-vue-spa.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/vite.md` | `.claude/rules/07-quality/perf-pivots-vite.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/alpine.md` | `.claude/rules/07-quality/perf-pivots-alpine.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/static.md` | `.claude/rules/07-quality/perf-pivots-static.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/perf/sveltekit.md` | `.claude/rules/07-quality/perf-pivots-sveltekit.md` |

### Data pivots — install to `.claude/rules/07-quality/`

| Source (in plugin) | Target (in project) |
|---|---|
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/prisma.md` | `.claude/rules/07-quality/data-pivots-prisma.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/drizzle.md` | `.claude/rules/07-quality/data-pivots-drizzle.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/typeorm.md` | `.claude/rules/07-quality/data-pivots-typeorm.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/mongoose.md` | `.claude/rules/07-quality/data-pivots-mongoose.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/graphql.md` | `.claude/rules/07-quality/data-pivots-graphql.md` |
| `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/data/trpc.md` | `.claude/rules/07-quality/data-pivots-trpc.md` |

### Install rules

For each pivot in the manifeste:

1. If the target file does not exist → **install**: read source, write to target; create parent directories as needed
2. If the target file exists and content matches source → **skip** (already up-to-date)
3. If the target file exists and content differs → **update**: overwrite silently

### Scope constraint

This action installs ONLY to `.claude/rules/07-quality/`. It never writes to `.claude/rules/capabilities/` or any other path. Capability rules are not installed — they are read from the plugin at audit time.

## Output

```
✅ sc-js sniff — pivots installed

  Perf pivots:
    + .claude/rules/07-quality/perf-pivots-vue-spa.md  (installed)
    + .claude/rules/07-quality/perf-pivots-vite.md     (installed)
    ✓ .claude/rules/07-quality/perf-pivots-nuxt.md     (skipped — not applicable)

  Data pivots:
    ✓ — none detected

  Capability rules: not installed (loaded on demand by /sc-js:audit)

→ /web-optimize and /data-optimize are ready for detected pivots.
→ Run /sc-js:audit to review JS code quality against capability pivots.
→ Run /sc-js:sniff clean to remove orphaned 0.3.0 capability rules (opt-in migration).
```
