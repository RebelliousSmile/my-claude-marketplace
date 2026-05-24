---
name: setup
model: sonnet
description: Installs or audits the aidd-overlay workflow rules into the current project .claude/rules/ directory. Use when bootstrapping a project with the AIDD agentic workflow (plan, challenge, implement, review, harvest). Do NOT use for skill configuration or plugin management.
---

# Setup

Distributes the bundled AIDD workflow rules into the current project's `.claude/rules/` directory. Two modes: **install-rules** (create missing rule files, never overwrite) and **audit-rules** (report status, no writes).

## Available actions

| #   | Action          | Role                                                       | Input                  |
| --- | --------------- | ---------------------------------------------------------- | ---------------------- |
| 01  | `install-rules` | Write bundled rules to `.claude/rules/` — skip if present | none (current project) |
| 02  | `audit-rules`   | Report which rules are installed, missing                  | none (current project) |

## Default flow

Trigger-to-action mapping:
- "install rules", "setup rules", "install aidd rules", "add workflow rules", "bootstrap rules" → `install-rules`
- "audit rules", "check rules", "which rules are installed", "rules status" → `audit-rules`

## Transversal rules

- Never overwrite an existing rule file — always skip with `[SKIP]`.
- Always report the result of each file operation.
- Target directory: `.claude/rules/` relative to the current project root.
- Create `.claude/` and `.claude/rules/` if they do not exist.
- Resolve the bundled rules path from `<skill_base_dir>/references/rules/` using the base directory provided at invocation.

## References

- `references/rules/01-normative-vs-archive.md` — bundled rule: normative vs archive content
- `references/rules/01-file-language-and-style.md` — bundled rule: LLM vs human file language (customize paths after install)
- `references/rules/04-git-main-protection.md` — bundled rule: git main branch protection
- `references/rules/07-dry-refactor.md` — bundled rule: refactor before multiplying (rule of three)
- `references/rules/09-plan-before-implement.md` — bundled rule: plan before implement
- `references/rules/09-challenge-plan.md` — bundled rule: challenge plan until 0 deal-breakers
- `references/rules/09-double-review-after-implement.md` — bundled rule: double review after implementation
- `references/rules/09-harvest-trigger.md` — bundled rule: proactive harvest trigger
