---
name: api-integration-assistant
description: |
  Guide API integration following project patterns. Triggers: "integrate API",
  "add API", "new API integration", "connect to API", "API setup", "create API".
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
argument-hint: "[api_name]"
---

# API Integration Assistant

Guide users through integrating external APIs following project-specific resilience patterns.

## Prerequisites

**MANDATORY** - Read project configuration first:
```
Read documentation/project-config.md
```

Extract from project-config.md:
- Stack (language, framework)
- File patterns and naming conventions
- Testing requirements
- Code quality tools

## Workflow

### Step 0: Gather Information

Ask user the questionnaire:

```markdown
**Phase 1/3: Basic Info**
1. API name (for file naming)
2. Module/service using this API
3. Official documentation URL

**Phase 2/3: Authentication**
4. Auth type: API Key, Bearer Token, OAuth2, Basic Auth, Custom?
5. Auth headers format
6. Token expiration and refresh mechanism?

**Phase 3/3: Endpoints**
7. Base URL
8. Main endpoints to integrate
9. Rate limits and cache TTL
```

### Step 1: Validate API Name

Based on project naming conventions from project-config.md:
- Normalize name (lowercase, valid identifier)
- Check if API file already exists
- Determine target directory

### Step 2: Generate API Module

Create API module following project patterns:

**Key functions to generate:**
- Authentication handler
- GET operations (with caching if applicable)
- POST/PUT/DELETE operations
- Error handling wrapper

**Adapt to project stack:**
- PHP: `api_{name}_*.php` with functions
- TypeScript: `{name}Api.ts` with class/functions
- Python: `{name}_api.py` with class/functions
- Go: `{name}_client.go` with struct methods

### Step 3: Configuration

Generate configuration template based on project patterns:
- Environment variables
- Config file entries
- Secrets management

### Step 4: Testing

Generate tests following project testing strategy from project-config.md:
- Contract/unit tests for API functions
- Mock responses for testing
- Integration test template

### Step 5: Documentation

Create API documentation:
- Endpoint reference
- Authentication setup
- Usage examples
- Error codes

### Step 6: Validation

Run project validation commands from project-config.md:
```
Execute VALIDATE command from project-config.md
```

### Step 7: Summary

Display summary with:
- Files created
- Configuration needed
- Next steps

## Common Patterns

### Resilient API Calls
```
1. Check cache first (for GET operations)
2. Call API with timeout
3. Handle errors gracefully
4. Cache successful responses
5. Return consistent response format
```

### Response Format (recommended)
```json
{
  "status": "success|error|degraded",
  "source": "api|cache",
  "data": {},
  "error": null
}
```

## Supporting Files

| File | Purpose |
|------|---------|
| `templates/api-module.md` | Generic API module template |
| `templates/api-test.md` | Test template |
| `examples/oauth2-flow.md` | OAuth2 implementation example |

## Adaptation Notes

This skill adapts to any project stack by reading `project-config.md`. Ensure this file contains:
- Language and framework
- File naming conventions
- Testing framework
- Code quality commands
