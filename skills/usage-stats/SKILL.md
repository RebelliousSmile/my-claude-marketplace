---
name: usage-stats
description: Display skill/command and agent usage statistics from tracking logs.
allowed-tools: Bash, Read
argument-hint: [days]
---

# Usage Statistics

Display usage statistics for skills, commands, and agents.

## Usage

```
/usage-stats [days]
```

- `days` (optional): Number of days to analyze (default: 30)

## What It Shows

1. **Skills/Commands**: Most used skills ranked by frequency
2. **Agents**: Most invoked agents (Task tool) ranked by frequency
3. **By date**: Daily usage counts (combined)
4. **Total invocations**: Overall counts

## Example Output

```
=== Usage Statistics (last 30 days) ===

## Skills/Commands:
  15 code-review
   8 task
   5 documentation-sync

## Agents:
  12 code-reviewer
   8 super-coder
   5 debugger
   3 Explore

## By date:
   8 2026-01-21
   6 2026-01-20
   4 2026-01-19

## Totals:
  Skills: 31
  Agents: 28
  Combined: 59
```

## Log Location

Data stored in:
- `.claude/logs/skill-usage.log` (skills/commands)
- `.claude/logs/agent-usage.log` (agents)

## Implementation

Execute the stats script:

```bash
.claude/hooks/show-usage-stats.sh $ARGUMENTS
```

## Prerequisites

Tracking hooks must be configured in `settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Skill", "hooks": [{"type": "command", "command": "bash .claude/hooks/track-skill-usage.sh"}] },
      { "matcher": "Task", "hooks": [{"type": "command", "command": "bash .claude/hooks/track-agent-usage.sh"}] }
    ]
  }
}
```
