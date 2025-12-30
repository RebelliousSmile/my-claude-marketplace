---
name: task
description: Execute task with automated workflow and feedback loops
---

# Task Execution Workflow with Feedback Loops

This workflow follows `documentation/memory-bank/core/automated-workflow.md` to ensure maximum quality and efficiency.

---

## SmartLockers Configuration

```yaml
# Decision Strategy
DIRECT_THRESHOLD:
  time: 2 hours
  files: 3 files

# Test Commands (70/20/10)
COMMAND_VALIDATE: "composer phpstan"          # PHPStan level 6
COMMAND_TEST_CONTRACTS: "composer test-contracts"  # Contract tests
COMMAND_TEST_INTEGRATION: "composer test-integration"  # Integration tests
COMMAND_QUALITY: "composer quality"           # All tests

# Dev Server
DEV_SERVER:
  command: "php -S localhost:8001 -t public/"
  port: 8001
  url: "http://localhost:8001"

# Review Agents
PLAN_REVIEW_AGENTS:
  - code-architect      # Architecture, patterns, performance, tech choices

CODE_REVIEW_SKILL: "code-review"  # Skill with SmartLockers checklist

# Commit Convention
COMMIT_FORMAT: "type(scope): description"
COMMIT_TYPES: [feat, fix, docs, refactor, test, chore, client, api]
COMMIT_SCOPES: [clients, apis, providers, services, tests, docs, config, db]
```

---

## Complete Workflow

### STEP 1: Read Task

1. **Read task file** provided as parameter
2. **Extract information**:
   - Task description
   - Files to modify
   - Estimated complexity (time, file count)
   - Acceptance criteria

---

### STEP 2: 🔄 PLANNING LOOP (Feedback Loop #1)

**Objective**: Validate plan BEFORE implementation (saves 45% time)

#### 2.1 Create Detailed Plan

Analyze task and create plan with:
- [ ] Sequential implementation steps
- [ ] Files to create/modify (with exact paths)
- [ ] Functions to implement (with signatures)
- [ ] Tests to write
- [ ] Documentation to update
- [ ] Time estimation per step

**Plan format**:
```markdown
# Plan: [Task Name]

## Context
[Task summary]

## Implementation Steps
1. [Step 1] (15 min)
   - Create/modify: code/clients/lockandchill_functions.php
   - Function: client_lockandchill_cron_process()

2. [Step 2] (20 min)
   - Create: public/cron.php
   - Validation: CLI only, client name sanitization

## Tests
- [ ] PHPStan level 6: 0 errors
- [ ] Contract tests: test_cron_validate_client_name()
- [ ] Integration tests: test_full_cron_flow()

## Documentation
- [ ] Update CLAUDE.md if necessary

## Total Estimation
45 minutes → DIRECT strategy
```

#### 2.2 Review Plan (Agents in Parallel)

**Launch review agents in PARALLEL** (single message):

```
@code-architect: Review architecture plan - correct patterns? optimal performance? appropriate tech choices?
```

**Wait for agent feedback** (30-60 seconds)

#### 2.3 Decision: Plan Approved?

**IF agents approve AND no major adjustments required**:
   → **Go to STEP 3**

**IF agents request adjustments**:
   → **Adjust plan** according to recommendations
   → **Re-review** (back to 2.2)
   → **LOOP** until approval

**Feedback loop gain**: 3h35min saved out of 8h (45% time)

---

### STEP 3: Implementation Strategy

**Analyze time estimation and files**:

```yaml
DIRECT conditions:
  - Estimated time < 2 hours
  - Files to modify < 3
  - Complexity: Low

STEP-BY-STEP conditions:
  - Estimated time > 2 hours
  - Files to modify > 3
  - Complexity: Medium/High
```

**IF DIRECT**:
   → Implement all at once
   → 1 single commit at end
   → Go to STEP 4 (DIRECT mode)

**IF STEP-BY-STEP**:
   → Break into milestones
   → 1 commit per validated milestone
   → Go to STEP 4 (STEP-BY-STEP mode)

---

### STEP 4: 🔄 IMPLEMENTATION LOOP (Feedback Loop #2)

#### DIRECT Mode (< 2h, < 3 files)

**4.1 Implement all code**

- Create/modify files according to plan
- Respect SmartLockers conventions:
  - snake_case functions with prefixes (client_, api_, db_, auth_)
  - Complete PHPDoc
  - Mandatory cache-first pattern
  - try-catch error handling

**4.2 Verify dev server**

```bash
# Check if server already running
ps aux | grep "php -S localhost:8001" | grep -v grep

# If not running → Launch in background
php -S localhost:8001 -t public/ > /dev/null 2>&1 &
echo $! > .dev-server.pid  # Save PID
```

**4.3 Automatic Tests (70/20/10)**

Execute in order:

```bash
# 1. PHPStan (70%) - MANDATORY
composer phpstan

# IF PHPStan errors:
#   → Fix immediately
#   → Re-run composer phpstan
#   → LOOP until 0 errors

# 2. Contract Tests (20%)
composer test-contracts

# IF failures:
#   → Fix code
#   → Re-run tests
#   → LOOP until all pass

# 3. Integration Tests (10%)
composer test-integration

# IF failures:
#   → Fix code
#   → Re-run tests
#   → LOOP until all pass
```

**4.4 Manual User Validation**

```
Implementation completed. Changes:
- [File 1]: [Description]
- [File 2]: [Description]

Tests passing:
✅ PHPStan level 6: 0 errors
✅ Contract tests: X/X passing
✅ Integration tests: X/X passing

Dev server: http://localhost:8001

Can you validate the changes?
- Manual testing: [Instructions]
- Verify expected behavior: [Criteria]
```

**Wait for user validation**

**IF user validates**:
   → Go to STEP 5 (Review)

**IF user requests corrections**:
   → Fix according to feedback
   → Re-run tests (4.3)
   → Re-validate (4.4)
   → **LOOP** until validation

---

#### STEP-BY-STEP Mode (> 2h, > 3 files)

**4.1 Break into Milestones**

Example:
```
Milestone 1: Cron infrastructure (30 min)
  - public/cron.php
  - CLI validation, sanitization

Milestone 2: Client cron_process() functions (45 min)
  - client_lockandchill_cron_process()
  - client_cosyhosting_cron_process()

Milestone 3: Tests (30 min)
  - Contract tests
  - Integration tests

Milestone 4: Documentation (15 min)
  - Update CLAUDE.md
```

**4.2 For EACH Milestone**:

**a) Implement milestone**

**b) Test milestone**:
```bash
composer phpstan
composer test-contracts  # Tests related to milestone
```

**c) User checkpoint**:
```
Milestone [N] completed: [Description]

Changes:
- [File 1]
- [File 2]

Tests:
✅ PHPStan: 0 errors
✅ Contract tests: X/X passing

Can you validate before next milestone?
```

**d) IF user validates**:
   → **Commit milestone** (don't wait for end)
   → Commit format:
   ```
   feat(scope): milestone N - description

   - Change 1
   - Change 2

   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```
   → Move to next milestone

**e) IF user requests corrections**:
   → Fix
   → Re-test
   → Re-checkpoint
   → **LOOP** until validation

**f) Repeat for all milestones**

**When all milestones validated**:
   → Go to STEP 5 (Final review)

---

### STEP 5: 🔄 REVIEW LOOP (Feedback Loop #3)

**Objective**: Structured code review with SmartLockers checklist

#### 5.1 Launch Code Review

**Use code-review skill** (triggers automatically):

```
Code review of changes:
[List modified files]
```

**Skill generates standardized report**:
- Functionality (edge cases, error handling)
- Quality (conventions, prefixes, PHPDoc)
- Security (sanitization, injection, secrets)
- Performance (cache-first, DB optimization)
- Tests (PHPStan, coverage)
- SmartLockers-specific (UUID, multi-tenant, isolation)

#### 5.2 Consult Agents if Needed

**IF complex architectural questions**:
```
@code-architect: [Pattern/architecture/tech choice question]
```

**IF need deep code review**:
```
Use code-review skill (automatic)
```

#### 5.3 Review Decision

**IF review "Approved"**:
   → Go to STEP 6 (Final commit if DIRECT mode)

**IF review "Request changes"**:
   → **Apply corrections** according to report
   → **Re-test** (composer phpstan + tests)
   → **Re-review** (back to 5.1)
   → **LOOP** until "Approved"

**IF review "Comment" (optional suggestions)**:
   → Ask user if apply suggestions
   → IF yes: apply + re-review
   → IF no: go to STEP 6

---

### STEP 6: Finalization

#### 6.1 Stop Dev Server (if launched by workflow)

```bash
# If PID saved
if [ -f .dev-server.pid ]; then
  kill $(cat .dev-server.pid) 2>/dev/null
  rm .dev-server.pid
fi
```

#### 6.2 Final Commit (DIRECT Mode only)

**STEP-BY-STEP Mode**: Commits already done per milestone, skip this step

**DIRECT Mode**: Create final commit

**a) Prepare commit message**:

```bash
# Extract type and scope from task file name
# Example: documentation/tasks/implement-unified-cron-system.md
#   → type: feat
#   → scope: services (or clients, depending on modified files)
#   → description: implement unified cron system

# Format:
feat(scope): description based on task name

- List modifications
- Change 1
- Change 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

**b) Create commit**:

```bash
git add [modified files]
git commit -m "$(cat <<'EOF'
feat(scope): description

- Change 1
- Change 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

#### 6.3 Delete Task File

**Request user confirmation**:
```
Task completely finished:
✅ Implementation validated
✅ Tests passing (PHPStan + Contracts + Integration)
✅ Code review "Approved"
✅ Commit created

May I delete the task file?
```

**IF user confirms**:
```bash
rm [task_file_path]
```

---

## Important Instructions

### TodoWrite Tool

**Use TodoWrite to track all steps**:

```php
// At workflow start
TodoWrite([
  "Read task file",
  "Create detailed plan",
  "Review plan (agents)",
  "Implement code",
  "Tests 70/20/10",
  "Code review",
  "Final commit"
])

// Update status after each step
```

### User Confirmations

**Request confirmation BEFORE**:
- Launching review agents (token cost)
- Applying corrections suggested by review
- Deleting task file
- Committing (if not already authorized)

**DO NOT request confirmation for**:
- Automatic tests (PHPStan, composer test)
- Obvious bug fixes
- Adding missing PHPDoc

### Failures and Recovery

**IF PHPStan fails**:
   → Fix immediately (absolute priority)
   → Re-run until 0 errors
   → NEVER proceed to next step if PHPStan ≠ 0

**IF tests fail**:
   → Analyze failure
   → Fix code
   → Re-run tests
   → Loop until success

**IF dev server doesn't start**:
   → Check PHP fatal errors
   → Fix
   → Re-launch
   → If impossible: continue without dev server, notify user

### Critical Git Rules

**NEVER commit without authorization**:
   - DIRECT mode: Request confirmation before final commit
   - STEP-BY-STEP mode: Request confirmation BEFORE each milestone commit
   - Exception: If user said "commit automatically" at start

**Mandatory commit format**:
   - Conventional Commits (type(scope): description)
   - Always include Claude Code footer
   - Types: feat, fix, docs, refactor, test, chore, client, api
   - Scopes: clients, apis, providers, services, tests, docs, config, db

---

## Complete Execution Example

### Example DIRECT Mode (< 2h)

```
User: /task documentation/tasks/add-cache-ttl-validation.md

Claude: [Reads task file]
Claude: Task complexity: SIMPLE (< 2h)
Claude: [Creates TodoWrite with 3 items]
Claude: [Implements directly without planning]
Claude: [Marks todos complete as work progresses]
Claude: [Runs tests/validation]
Claude: Task completed!
```

### Example PLAN Mode (> 2h)

```
User: /task documentation/tasks/implement-oauth2-beds24.md

Claude: [Reads task file]
Claude: Task complexity: COMPLEX (> 2h estimated)
Claude: Entering PLAN mode for user validation...
Claude: [Uses EnterPlanMode tool]
Claude: [Explores codebase, reads related files]
Claude: [Writes plan to documentation/tasks/plans/oauth2-beds24-plan.md]
Claude: [Uses ExitPlanMode when plan is ready]
User: [Reviews plan, approves or requests changes]
Claude: [Implements approved plan]
Claude: [Runs tests/validation]
Claude: Task completed!
```

---

## Error Handling

- **Task file not found**: Ask user to provide correct path
- **Ambiguous requirements**: Use AskUserQuestion to clarify
- **Missing dependencies**: Document in plan, ask user before proceeding
- **Test failures**: Fix issues before marking task complete

---

## Notes

- Always consult memory-bank for project conventions before implementation
- Use parallel agent launches when independent work is possible
- Prefer editing existing files over creating new ones
- Follow project's Definition of Done for all tasks