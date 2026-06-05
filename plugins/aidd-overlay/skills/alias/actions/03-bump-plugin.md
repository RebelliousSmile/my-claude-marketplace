# Action 05 — bump-plugin

Bumps a plugin version in `plugin.json` + `index.json`, commits, and pushes to the marketplace.

## Context required

- Plugin name (e.g. `sc-js`, `aidd-overlay`, `writing`).
- Version or bump type (`major`, `minor`, `patch`). If absent, ask: *"Which plugin and what version bump?"*

## Prompt

### Step 0 — Locate marketplace root

Find automatically:
- a. Read `~/.claude/plugins/known_marketplaces.json` (or `%USERPROFILE%\.claude\plugins\known_marketplaces.json`). Use the `path` of the entry whose `source.source` is `"directory"`.
- b. If absent, search for `index.json` containing a `"plugins"` array in `~/Documents`, `~/Projects`, `~/Projets` (one level deep).
- c. If still not found, ask: *"Where is your marketplace repo?"*

### Step 1 — Resolve version

Read `plugins/<name>/.claude-plugin/plugin.json`. If bump type given, compute new semver (e.g. `0.1.0` + `minor` → `0.2.0`).

### Step 2 — Bump plugin.json

Replace `"version"` in `plugins/<name>/.claude-plugin/plugin.json` with the new version.

### Step 3 — Update index.json

In the marketplace root `index.json`, update `"version"` of the entry whose `"id"` matches the plugin name. If absent, append a new entry from plugin.json.

### Step 4 — Commit

Stage `plugins/<name>/.claude-plugin/plugin.json` and `index.json`. Commit:
```
chore(<name>): bump version <old> → <new>
```

### Step 5 — Push

```bash
git push origin main
```

### Step 6 — Activation

Output to user:
> ```
> /plugin update
> /reload-plugins
> ```

### Step 7 — Report

- Marketplace path
- Plugin: `<name>` `<old>` → `<new>`
- Commit SHA
- Push confirmed
