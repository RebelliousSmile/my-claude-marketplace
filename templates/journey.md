---
name: journey
description: Journey test report template — linked to an issue and an optional plan
---

<!--
AI INSTRUCTIONS ONLY — do not output these comments.
- Replace all {variables} with actual values.
- Leave sections empty rather than writing placeholder text.
- "Summary" and "Conclusion" are the only sections posted to the issue.
-->

# Journey: {title}

- **Issue**: {issue_url}
- **Plan**: {plan_file_path} <!-- relative path to .md plan, or "none" -->
- **Date**: {yyyy-mm-dd}
- **Branch**: `{branch}`

## Steps

| # | Action | Expected | Status | Notes |
|---|--------|----------|--------|-------|
| 1 | {action} | {expected outcome} | ✅/❌ | {error or remark} |

## Failures

<!-- One subsection per failed step. Omit if all passed. -->

### Step {N}: {step name}

```
{full assertion error or relevant output lines}
```

## Summary

- **Steps**: {total} total — {passed} ✅ passed — {failed} ❌ failed
- **Duration**: {duration}s
- **Playwright script**: deleted after run

## Conclusion

{One paragraph: overall result, root cause of failures if any, next action.}
