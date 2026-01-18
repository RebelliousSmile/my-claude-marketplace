---
name: optimize-memory
description: Audit and optimize the memory bank (invoke documentation-architect agent)
allowed-tools: Read, Glob, Grep, Task
---

# Optimize Memory Bank

Invoke the `documentation-architect` agent to audit and optimize the memory bank.

## What This Command Does

The agent will:
1. Analyze current memory bank usage (tokens, files loaded)
2. Detect redundant, obsolete, or temporary files
3. Propose consolidation and cleanup strategies
4. Calculate estimated token savings
5. Suggest improvements to CLAUDE.md structure

## When to Use

- Memory bank usage > 70%
- After completing major tasks/reviews
- You notice slow Claude responses
- You want to clean up generated documentation

## Safety

The agent will propose changes but will NEVER modify CLAUDE.md without your explicit confirmation.

## Complementary Commands

- `/update-docs` : Sync code -> documentation (after code changes)
- `/clean-docs` : Clean temporary files (archiving/deletion)
- `/check-memory` : Quick health check (read-only)
