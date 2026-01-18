---
name: task-definition
description: Generate structured task definition files for the /task command. Use when user needs to create task files, define implementation tasks, or mentions "create task", "define task", "task file".
version: 1.0.0
---
# Note: Skills inherit permissions from parent context (no allowed-tools field)

# Task Definition Generator

Interactive skill to generate structured task definition files.

## What This Skill Does

Guides you through creating a structured task definition file that can be executed by the `/task` slash command:

- Complete task specification with acceptance criteria
- Identification of files to modify
- Test requirements and validation steps
- Context for implementation decisions

## Workflow

### Step 1: Gather Task Information

Ask the user:

1. **Task Title** (concise, 3-8 words)
2. **Task Type** (Feature / Bugfix / Refactor / Documentation / Test)
3. **Description** (2-3 sentences, problem solved)
4. **Context & Background** (why needed, constraints)
5. **Acceptance Criteria** (3-5 testable criteria)
6. **Files to Modify** (or domain if unknown)
7. **Testing Requirements** (unit tests, manual testing)
8. **Implementation Strategy** (DIRECT < 2h or STEP-BY-STEP > 2h)
9. **Dependencies & Risks**
10. **Additional Notes**

### Step 2: Generate Task File

Create markdown file with structure:

```markdown
# [Task Title]

**Type**: [Feature/Bugfix/Refactor]
**Status**: Not Started
**Estimated Complexity**: [DIRECT/STEP-BY-STEP]
**Created**: [YYYY-MM-DD]

---

## Description

[2-3 sentence description]

## Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Files to Modify

### Primary Files
- `path/to/file1.ext` - [What will be changed]

### Test Files
- `tests/TestFile.ext` - [What tests to add]

## Implementation Strategy

**Approach**: [DIRECT or STEP-BY-STEP]

### Milestone 1: [Name]
- [ ] Task 1
- [ ] Task 2

## Testing Requirements

### Automated Tests
- [ ] Test command to run

### Manual Testing Checklist
- [ ] Test scenario 1
- [ ] Test scenario 2

## Dependencies & Risks

### Prerequisites
- [Any blockers]

### Risks
- [Risk 1 and mitigation]
```

### Step 3: Validate

Before saving, check:
- [ ] Filename is kebab-case
- [ ] All mandatory sections filled
- [ ] Acceptance criteria are testable
- [ ] Files to modify exist (or domains identified)
- [ ] Testing requirements are clear

### Step 4: Confirm and Save

Show user the generated file and ask if adjustments needed.

## Best Practices

1. **Be Specific**: Vague criteria lead to unclear implementations
2. **Plan Testing**: Include both automated and manual tests
3. **Consider Complexity**: DIRECT for < 2h, STEP-BY-STEP for > 2h
4. **Identify Risks**: List dependencies and potential blockers
