# Code Review Reference

## Review Checklist

### 1. Functionality

- [ ] Code works as intended
- [ ] All requirements are met
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Return types are consistent

### 2. Code Quality

- [ ] Naming is clear and consistent
- [ ] Functions are focused (single responsibility)
- [ ] No duplicated code (DRY)
- [ ] Code is readable
- [ ] Comments explain "why" not "what"

### 3. Security

- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL injection prevention
- [ ] XSS prevention (if applicable)
- [ ] Authentication/authorization checks
- [ ] Sensitive data handling

### 4. Performance

- [ ] No N+1 queries
- [ ] Appropriate indexing
- [ ] Caching where beneficial
- [ ] No unnecessary loops
- [ ] Resource cleanup (connections, files)

### 5. Testing

- [ ] Tests exist for new code
- [ ] Tests cover edge cases
- [ ] Tests are meaningful (not just coverage)
- [ ] Mocks are appropriate

### 6. Project Patterns

- [ ] Follows project architecture
- [ ] Uses existing utilities
- [ ] Consistent with codebase style
- [ ] Respects project conventions

## Severity Levels

### CRITICAL (Must Fix)

**Definition:** Issues that will cause bugs, security vulnerabilities, or data loss.

**Examples:**
- SQL injection vulnerability
- Exposed credentials
- Broken functionality
- Data corruption risk
- Unhandled exceptions in critical paths

### WARNING (Should Fix)

**Definition:** Issues that may cause problems or make code harder to maintain.

**Examples:**
- Missing error handling
- Code duplication
- Performance issues
- Inconsistent naming
- Missing tests for complex logic

### SUGGESTION (Nice to Have)

**Definition:** Improvements that would make code better but aren't blocking.

**Examples:**
- Minor style improvements
- Additional comments
- Code organization
- Variable renaming
- Test improvements

## Issue Format

```markdown
### [SEVERITY] `file:line` - Title

**Issue:** Description of the problem

**Why:** Why this is a problem

**Fix:** Suggested solution

```code
// Before
problematic code

// After
fixed code
```
```

## Review Decision

### Approve
- No critical issues
- Warnings can be addressed later
- Code is safe to merge

### Request Changes
- Critical issues present
- Must be fixed before merge
- Provide clear action items

### Comment Only
- Feedback for discussion
- No blocking issues
- Questions to clarify

## Common Patterns to Check

### Error Handling

```javascript
// BAD: Silent failure
try { doSomething(); } catch (e) { }

// GOOD: Handle or propagate
try {
  doSomething();
} catch (e) {
  logger.error('Failed to do something', e);
  throw new AppError('Operation failed', e);
}
```

### Null Checks

```javascript
// BAD: Assuming data exists
const name = user.profile.name;

// GOOD: Safe access
const name = user?.profile?.name ?? 'Unknown';
```

### Async/Await

```javascript
// BAD: Unhandled promise
async function getData() {
  fetch('/api/data');  // Fire and forget!
}

// GOOD: Await or handle
async function getData() {
  const response = await fetch('/api/data');
  return response.json();
}
```

### SQL Injection

```javascript
// BAD: String concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`;

// GOOD: Parameterized query
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```
