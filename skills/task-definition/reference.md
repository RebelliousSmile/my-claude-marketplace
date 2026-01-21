# Task Definition Reference

## Task Types

| Type | Description | Typical Complexity |
|------|-------------|-------------------|
| Feature | New functionality | STEP-BY-STEP |
| Bugfix | Fix existing issue | DIRECT |
| Refactor | Improve code structure | Varies |
| Documentation | Update docs | DIRECT |
| Test | Add/fix tests | DIRECT |

## Complexity Strategies

### DIRECT

**When to use:**
- Estimated time < 2 hours
- Files to modify ≤ 5
- Low risk
- Clear requirements

**Workflow:**
```
Implement all → Validate → Review → Commit
```

### STEP-BY-STEP

**When to use:**
- Estimated time > 2 hours
- Files to modify > 5
- Medium/high risk
- Complex requirements

**Workflow:**
```
For each milestone:
    Implement → Validate → Checkpoint → Commit
Final review → Final commit
```

## Acceptance Criteria Quality

### Good Criteria

- **Testable:** Can be verified objectively
- **Specific:** Clear expected outcome
- **Measurable:** Quantifiable when possible

**Examples:**
```
✅ "Function returns array with keys: status, data, error"
✅ "Page loads in under 2 seconds"
✅ "Error message displays when email is invalid"
```

### Bad Criteria

- **Vague:** Open to interpretation
- **Subjective:** No clear pass/fail
- **Unmeasurable:** Cannot be tested

**Examples:**
```
❌ "Code works correctly"
❌ "UI looks good"
❌ "Performance is acceptable"
```

## Definition of Done Template

### Code
- [ ] Implementation complete
- [ ] Follows project conventions
- [ ] No new warnings/errors
- [ ] Self-documented (clear naming)

### Testing
- [ ] Unit tests pass
- [ ] New tests for new code
- [ ] Edge cases covered

### Documentation
- [ ] Code comments where needed
- [ ] API docs updated (if applicable)
- [ ] README updated (if applicable)

### Review
- [ ] Self-review completed
- [ ] Peer review (if required)
- [ ] No critical issues

## Risk Assessment

### Low Risk
- Isolated changes
- Well-tested area
- Clear rollback path

### Medium Risk
- Multiple files affected
- Integrations involved
- Partial test coverage

### High Risk
- System-wide changes
- Database migrations
- External dependencies
- No test coverage

## File Naming

```
documentation/tasks/[kebab-case-name].md

Examples:
- add-user-authentication.md
- fix-cart-calculation.md
- refactor-api-layer.md
```

## Milestone Structure

```markdown
### Milestone 1: [Name] (~Xh)
- [ ] Sub-task 1
- [ ] Sub-task 2
- [ ] Validation: [how to verify]

### Milestone 2: [Name] (~Xh)
- [ ] Sub-task 3
- [ ] Sub-task 4
- [ ] Validation: [how to verify]
```

## Dependencies

### Prerequisites
Things that must exist/complete before starting:
- External services
- Other tasks
- Data/configs

### Blockers
Things that may prevent completion:
- Missing access
- Unclear requirements
- Technical constraints
