---
name: task-definition
description: Generate structured task definition files for the /task command. Use when user needs to create task files, define implementation tasks, or mentions "create task", "define task", "task file".
allowed-tools: Read, Write, Edit, Grep, Glob
argument-hint: [task-title]
---

# Task Definition Generator

Interactive skill to generate structured task definition files.

## Prerequisites

**MANDATORY** - Read project configuration:
```
Read documentation/project-config.md
```

Extract:
- Testing strategy and commands
- Code conventions
- Definition of Done criteria
- Commit conventions

## What This Skill Does

Guides you through creating a structured task definition file that can be executed by the `/task` slash command:

- Complete task specification with acceptance criteria
- Identification of files to modify
- Test requirements and validation steps
- Context for implementation decisions

## Workflow

### Step 1: Gather Task Information

Ask the user (via AskUserQuestion if unclear):

1. **Task Title** (concise, 3-8 words)
2. **Task Type** (Feature / Bugfix / Refactor / Documentation / Test)
3. **Description** (2-3 sentences, problem solved)
4. **Context & Background** (why needed, constraints)
5. **Acceptance Criteria** (3-5 testable criteria)
6. **Files to Modify** (or domain if unknown)
7. **Testing Requirements** (from project-config.md)
8. **Implementation Strategy** (DIRECT < 2h or STEP-BY-STEP > 2h)
9. **Dependencies & Risks**
10. **Additional Notes**

### Step 2: Consult Project Standards

Read project conventions:
- Naming conventions from project-config.md
- Testing strategy (from project-config.md)
- Architecture patterns
- Definition of Done criteria

### Step 3: Analyze Dependencies

```bash
# Search related code
Grep "function_name" src/
Glob "src/**/*.{ts,js,py,php}"
```

Identify:
- Files to modify
- Related functions
- Existing patterns to follow

### Step 4: Generate Task File

Create markdown file with this structure:

```markdown
# [Task Title]

**Type**: [Feature/Bugfix/Refactor]
**Status**: Not Started
**Estimated Complexity**: [DIRECT/STEP-BY-STEP]
**Created**: [YYYY-MM-DD]

---

## Description

[2-3 sentence description]

## Context

[Why this task is needed, business context, constraints]

## Acceptance Criteria

- [ ] Criterion 1 (must be testable)
- [ ] Criterion 2
- [ ] Criterion 3

## Files to Modify

### Primary Files
- `path/to/file1.ext` - [What will be changed]
- `path/to/file2.ext` - [What will be changed]

### Test Files
- `tests/test_feature.ext` - [What tests to add]

## Implementation Strategy

**Approach**: [DIRECT or STEP-BY-STEP]

### Milestone 1: [Name]
- [ ] Task 1
- [ ] Task 2

### Milestone 2: [Name] (if STEP-BY-STEP)
- [ ] Task 3
- [ ] Task 4

## Testing Requirements

### Automated Tests
- [ ] Run: [test command from project-config.md]
- [ ] Coverage: [specific areas to test]

### Manual Testing Checklist
- [ ] Test scenario 1
- [ ] Test scenario 2

## Definition of Done

- [ ] Code implemented and working
- [ ] Tests pass (from project-config.md VALIDATE command)
- [ ] Code reviewed (or self-reviewed with checklist)
- [ ] Documentation updated (if needed)
- [ ] No new warnings or errors

## Dependencies & Risks

### Prerequisites
- [Any blockers or dependencies]

### Risks
- [Risk 1]: [Mitigation]
- [Risk 2]: [Mitigation]

## Notes

[Any additional context or implementation hints]
```

### Step 5: Validate

Before saving, check:
- [ ] Filename is kebab-case (e.g., `add-user-auth.md`)
- [ ] All mandatory sections filled
- [ ] Acceptance criteria are testable (not vague)
- [ ] Files to modify exist (or domains identified)
- [ ] Testing requirements align with project-config.md

### Step 6: Confirm and Save

1. Show user the generated file
2. Ask if adjustments needed
3. Save to: `documentation/tasks/[task-name].md`

## Task Quality Checklist

Before saving, verify:
- [ ] Title is action-oriented (verb + noun)
- [ ] Acceptance criteria are testable
- [ ] Files to modify are identified
- [ ] DoD matches project standards
- [ ] Scope is reasonable (< 2h for DIRECT, otherwise split)

## Best Practices

1. **Be Specific**: Vague criteria lead to unclear implementations
2. **Plan Testing**: Include both automated and manual tests
3. **Consider Complexity**: DIRECT for < 2h, STEP-BY-STEP for > 2h
4. **Identify Risks**: List dependencies and potential blockers

## Collaboration

After task defined, suggest next steps:
- **code-architect**: If architectural decisions needed
- **super-coder**: For implementation
- **test-architect**: For test strategy validation

## Output Location

```
documentation/tasks/[task-name].md
```

**Naming**: lowercase, hyphen-separated (e.g., `add-oauth-login.md`)
