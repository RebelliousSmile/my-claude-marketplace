# Host portability

Resolve `SC_PWSH_PLUGIN_ROOT` from the loaded `<root>/skills/<skill>/SKILL.md` as `Path(SKILL_FILE).resolve().parent.parent.parent`. Set that task-local variable before using plugin-root paths. `PLUGIN_ROOT` and `CLAUDE_PLUGIN_ROOT` are optional hints only.

Use `$sc-pwsh:<skill>` on Codex and `/sc-pwsh:<skill>` on Claude Code. Persist general project instructions in `AGENTS.md` on Codex and `.claude/rules/` on Claude Code. Quality pivot files may remain under `.claude/rules/07-quality/` as a cross-host interchange because consuming skills read them explicitly; Codex does not auto-load that directory.
