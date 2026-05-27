# Action 05 — bump-plugin

Fires the pre-crafted prompt for the **bump plugin version → update index.json → commit → push → update local install** workflow.

## Context required

- Plugin name (e.g. `sc-js`, `aidd-overlay`, `writing`).
- New version or bump type (`major`, `minor`, `patch`). If absent, ask before firing: *"Which plugin and what version bump (major / minor / patch)?"*
- Marketplace repo path: auto-detected (see step 0). Only ask if auto-detection fails.

## Prompt

Execute the following workflow verbatim:

0. **Locate the marketplace repo** — do not ask the user; find it automatically:
   a. Check the `known_marketplaces.json` file (usually at `~/.claude/plugins/known_marketplaces.json` or `%USERPROFILE%\.claude\plugins\known_marketplaces.json`) and look for an entry whose `source.source` is `"directory"`. Use its `path` value as the marketplace root.
   b. If no directory-source entry exists, search for a `index.json` file containing a `"plugins"` array within common project directories (`~/Documents`, `~/Projects`, `~/Projets` and their subdirectories, one level deep).
   c. If still not found, ask the user: *"Where is your marketplace repo on this machine?"*

1. **Resolve the new version** — read `plugins/<name>/.claude-plugin/plugin.json` from the marketplace root found in step 0. If the user gave a bump type rather than an explicit version, compute the new semver (e.g. `0.1.0` + `minor` → `0.2.0`).

2. **Bump `plugin.json`** — edit `plugins/<name>/.claude-plugin/plugin.json`: replace the current `"version"` value with the new version. Do not touch any other field.

3. **Update `index.json`** — in the marketplace root `index.json`, find the entry whose `"id"` matches the plugin name and update its `"version"` to match. If the plugin is absent from `index.json`, append a new entry using the name, description, and new version from `plugin.json`.

4. **Commit** — from the marketplace repo root, stage only the two modified files (`plugins/<name>/.claude-plugin/plugin.json` and `index.json`) and commit with:
   ```
   chore(<name>): bump version <old> → <new>
   ```

5. **Push** — run `git push origin main`.

6. **Update local install** — `/plugin update` and `/reload-plugins` are harness commands that cannot be invoked programmatically. After the push, output the following instruction verbatim to the user:

   > Run these two commands to activate the new version:
   > ```
   > /plugin update
   > /reload-plugins
   > ```

7. Report:
   - Marketplace path used
   - Plugin bumped (`name`: `old` → `new`)
   - Commit SHA
   - Push confirmed
