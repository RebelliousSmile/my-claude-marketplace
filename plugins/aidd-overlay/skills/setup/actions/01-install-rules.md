# Action 01 — install-rules

Writes the bundled aidd-overlay workflow rules to `.claude/rules/` in the current project.

## Source

The bundled rules live at `<skill_base_dir>/references/rules/` where `<skill_base_dir>` is the
base directory provided at skill invocation time (visible in the `Base directory for this skill:`
line in the system context). Use the Read tool with the absolute path
`<skill_base_dir>/references/rules/<filename>` to retrieve each file's content before writing.

## Steps

1. Resolve `<skill_base_dir>` from the invocation context.
2. Determine the current project root (directory containing `.git`, or current working directory).
3. Create `.claude/` and `.claude/rules/` if they do not exist.
4. List all `.md` files in `<skill_base_dir>/references/rules/`.
5. For each rule file:
   - If `.claude/rules/<filename>` already exists → log `[SKIP] <filename> — already present`, do not overwrite.
   - If absent → write the file to `.claude/rules/<filename>`, log `[INSTALLED] <filename>`.
6. Print a summary block.

## Output format

```
Installing aidd-overlay rules → .claude/rules/

  [INSTALLED] 01-normative-vs-archive.md
  [INSTALLED] 01-file-language-and-style.md
  [INSTALLED] 04-git-main-protection.md
  [INSTALLED] 07-dry-refactor.md
  [INSTALLED] 09-plan-before-implement.md
  [INSTALLED] 09-challenge-plan.md
  [INSTALLED] 09-double-review-after-implement.md
  [INSTALLED] 09-harvest-trigger.md

Rules installed: 8
Rules skipped:   0
Target: .claude/rules/
```

## Notes

- If `.claude/rules/` already contains all bundled files, report 0 installed / N skipped and exit cleanly.
- Do not install partial content — write each file atomically.
- After installation, remind the user that rules take effect on the next Claude Code session start.
