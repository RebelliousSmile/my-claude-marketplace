# Action 05 — bump-plugin

Fires the pre-crafted prompt for the **bump plugin version → update index.json → commit → push** workflow.

## Context required

- Plugin name (e.g. `sc-js`, `aidd-overlay`, `writing`).
- New version or bump type (`major`, `minor`, `patch`). If absent, ask before firing: *"Which plugin and what version bump (major / minor / patch)?"*
- Marketplace repo path on disk. If absent, ask before firing: *"Where is the marketplace repo?"*

## Prompt

Execute the following workflow verbatim:

1. **Resolve the new version** — read `plugins/<name>/.claude-plugin/plugin.json` from the marketplace repo. If the user gave a bump type rather than an explicit version, compute the new semver (e.g. `0.1.0` + `minor` → `0.2.0`).

2. **Bump `plugin.json`** — edit `plugins/<name>/.claude-plugin/plugin.json`: replace the current `"version"` value with the new version. Do not touch any other field.

3. **Update `index.json`** — in the marketplace root `index.json`, find the entry whose `"id"` matches the plugin name and update its `"version"` to match. If the plugin is absent from `index.json`, append a new entry using the name, description, and new version from `plugin.json`.

4. **Commit** — from the marketplace repo root, stage only the two modified files (`plugins/<name>/.claude-plugin/plugin.json` and `index.json`) and commit with:
   ```
   chore(<name>): bump version <old> → <new>
   ```

5. **Push** — run `git push origin main`.

6. Report:
   - Plugin bumped (`name`: `old` → `new`)
   - Commit SHA
   - Push confirmed
