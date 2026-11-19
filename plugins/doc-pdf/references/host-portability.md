# Host portability

Resolve `DOC_PDF_PLUGIN_ROOT` from the loaded `<root>/skills/<skill>/SKILL.md` as `Path(SKILL_FILE).resolve().parent.parent.parent`. Set that task-local variable before using plugin-root paths. `PLUGIN_ROOT` and `CLAUDE_PLUGIN_ROOT` are optional hints only.

The engine entry point is `<DOC_PDF_PLUGIN_ROOT>/engine/cli.js`; run it with `node`. Never copy the engine into a client project: the plugin cache is versioned and read-only, so scripts of the client project cannot point into it.

Use `$doc-pdf:<skill>` on Codex and `/doc-pdf:<skill>` on Claude Code. Persist general project instructions in `AGENTS.md` on Codex and `.claude/rules/` on Claude Code.
