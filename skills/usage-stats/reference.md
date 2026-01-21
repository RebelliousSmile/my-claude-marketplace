# Usage Stats Reference

## Log Format

### Skill Usage Log (`.claude/logs/skill-usage.log`)

```
YYYY-MM-DD HH:MM:SS | skill: skill-name | args: arguments
```

Example:
```
2026-01-21 14:30:45 | skill: code-review | args: src/
2026-01-21 15:12:03 | skill: documentation-sync | args: check
```

### Agent Usage Log (`.claude/logs/agent-usage.log`)

```
YYYY-MM-DD HH:MM:SS | agent: agent-type | desc: description
```

Example:
```
2026-01-21 14:35:22 | agent: code-reviewer | desc: Review PR changes
2026-01-21 16:00:15 | agent: super-coder | desc: Implement feature
```

## Hooks Configuration

Required in `settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Skill",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/track-skill-usage.sh"
          }
        ]
      },
      {
        "matcher": "Task",
        "hooks": [
          {
            "type": "command",
            "command": "bash .claude/hooks/track-agent-usage.sh"
          }
        ]
      }
    ]
  }
}
```

## Statistics Calculation

### By Skill/Agent
- Count occurrences of each skill/agent name
- Sort by frequency (descending)

### By Date
- Extract date from timestamp
- Count entries per day
- Sort by date (descending)

### Totals
- Sum all skill entries
- Sum all agent entries
- Combined total

## Filtering

### By Time Period
- Default: last 30 days
- Custom: specify number of days as argument
- Filter by comparing log date >= cutoff date

### Cross-Platform Date Calculation

**macOS:**
```bash
CUTOFF_DATE=$(date -v-${DAYS}d '+%Y-%m-%d')
```

**Linux/Git Bash:**
```bash
CUTOFF_DATE=$(date -d "$DAYS days ago" '+%Y-%m-%d')
```
