# Usage Statistics Report Template

```markdown
=== Usage Statistics (last {{DAYS}} days) ===

## Skills/Commands:
{{#each skills}}
  {{count}} {{name}}
{{/each}}

## Agents:
{{#each agents}}
  {{count}} {{name}}
{{/each}}

## By date (combined):
{{#each dates}}
  {{count}} {{date}}
{{/each}}

## Totals:
  Skills:   {{totalSkills}}
  Agents:   {{totalAgents}}
  Combined: {{totalCombined}}
```

## Example Output

```
=== Usage Statistics (last 30 days) ===

## Skills/Commands:
  15 code-review
   8 task-definition
   5 documentation-sync
   3 api-integration-assistant

## Agents:
  12 code-reviewer
   8 super-coder
   5 debugger
   3 Explore
   2 test-architect

## By date (combined):
   8 2026-01-21
   6 2026-01-20
   4 2026-01-19
   3 2026-01-18

## Totals:
  Skills:   31
  Agents:   30
  Combined: 61
```
