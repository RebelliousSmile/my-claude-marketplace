# Action 02 — audit-rules

Reports the installation status of each bundled rule file. No files are written or modified.

## Source

The bundled rules live at `<skill_base_dir>/references/rules/` where `<skill_base_dir>` is the
base directory provided at skill invocation time (visible in the `Base directory for this skill:`
line in the system context). Use the Glob or Read tool with this absolute path to enumerate
the bundled files.

## Steps

1. Resolve `<skill_base_dir>` from the invocation context.
2. Determine the current project root.
3. For each file in `<skill_base_dir>/references/rules/`:
   - Check whether `.claude/rules/<filename>` exists in the current project.
   - Status: `[OK]` if present, `[MISSING]` if absent.
3. Print the status table and a summary count.

## Output format

```
Rule audit — .claude/rules/

  [OK]      01-normative-vs-archive.md
  [OK]      01-file-language-and-style.md
  [MISSING] 04-git-main-protection.md
  [OK]      07-dry-refactor.md
  [MISSING] 09-plan-before-implement.md
  [OK]      09-challenge-plan.md
  [OK]      09-double-review-after-implement.md
  [MISSING] 09-harvest-trigger.md

Installed: 5 / 8
Missing:   3 — run `setup install-rules` to add them.
```

## Notes

- Read-only action — never create, modify, or delete files.
- If `.claude/rules/` does not exist, all rules are `[MISSING]`.
- If all rules are present, end with: `All rules installed. No action needed.`
