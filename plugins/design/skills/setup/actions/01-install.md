# 01 - install

Write all design rule files to the current project's `.claude/rules/08-design/`.

## Inputs

- `project_root` (required) — absolute path to the project root (default: current working directory)

## Process

1. **Ensure target directory** `.claude/rules/08-design/` exists (create it and any parent).
2. **Copy each reference verbatim** from `${CLAUDE_PLUGIN_ROOT}/skills/setup/references/` to `.claude/rules/08-design/`, preserving the filename and the `paths:` frontmatter exactly:
   - `1-mobile-first.md`
   - `2-responsive-enrichment.md`
   - `3-mobile-only-ux.md`
   - `4-design-tokens.md`
   - `5-components-variants.md`
   - `6-accessibility.md`
3. **Do not modify content** — these are plugin-owned rules. If a file already exists, overwrite it.
4. **Check for tokens**: look for `design/tokens.json`. If absent, note it.
5. **Report**: list each written path. If tokens are absent, tell the user to run `/design:from-reference` (a reference exists) or `/design:from-brief` (designing from a need/user story) before producing wireframes or components.

## Test

All six files exist under `.claude/rules/08-design/`, each retains its `paths:` frontmatter, and the report lists every written path.
