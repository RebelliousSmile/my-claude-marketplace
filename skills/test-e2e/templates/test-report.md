# E2E Test Report Template

```markdown
# E2E Test Report

**Date**: {{date}}
**Framework**: {{framework}}
**Command**: `{{command}}`

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tests | {{total}} |
| Passed | {{passed}} |
| Failed | {{failed}} |
| Skipped | {{skipped}} |
| Duration | {{duration}} |

**Status**: {{#if allPassed}}✅ ALL PASSED{{else}}❌ FAILURES DETECTED{{/if}}

---

## Failed Tests

{{#each failures}}
### {{number}}. {{testName}}

**File**: `{{file}}:{{line}}`
**Duration**: {{duration}}

**Error**:
```
{{errorMessage}}
```

{{#if screenshot}}
**Screenshot**: `{{screenshot}}`
{{/if}}

**Probable Cause**: {{probableCause}}

**Suggested Fix**:
{{suggestedFix}}

---
{{/each}}

## Passed Tests

{{#each passed}}
- ✅ {{name}} ({{duration}})
{{/each}}

---

## Recommendations

{{#each recommendations}}
- {{this}}
{{/each}}

---

## Next Steps

{{#if hasFailures}}
1. Review failed tests above
2. Check screenshots/videos in test-results/
3. Fix issues and re-run: `{{rerunCommand}}`
{{else}}
Tests passed! Ready for merge/deploy.
{{/if}}
```
