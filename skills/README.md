# methodocc - Claude Code Skills

This directory contains project-specific skills for Claude Code that help with development workflows.

## Available Skills (11)

### Code Quality

#### code-review
**Trigger:** "review code", "check code", "code quality", "PR review"

Performs structured code review covering:
- Functionality validation
- Code quality (conventions, readability)
- Security audit
- Performance check
- Testing verification

**Output:** Markdown review report with findings and recommendations

---

### Task Management

#### task-definition
**Trigger:** "create task", "define task", "task file"

Creates comprehensive task definitions with:
- Acceptance criteria
- Technical requirements (files, APIs, dependencies)
- Implementation notes
- Definition of Done (70/20/10 testing strategy)
- Priority and effort estimation

**Output:** Structured task document ready for implementation

---

### Documentation

#### documentation-sync
**Trigger:** "sync docs", "update documentation", "docs outdated"

Synchronizes code and documentation:
- Detects drift between code and docs
- Updates outdated documentation
- Creates missing documentation
- Optimizes token usage

---

### Testing

#### test-e2e
**Trigger:** "e2e test", "end-to-end", "integration test"

Runs and analyzes E2E tests with:
- Detailed error reporting
- Screenshot/trace analysis
- Failure categorization
- Retry recommendations

---

### API Development

#### api-integration-assistant
**Trigger:** "integrate API", "add API", "new API integration", "connect to API"

Guides API integration following project patterns:
- Endpoint mapping
- Authentication setup
- Error handling patterns
- Response transformations

---

### UI/UX

#### ux-standards-validator
**Trigger:** "UI", "UX", "design", "accessibility", "a11y", "responsive", "WCAG"

Validates UI/UX against standards:
- Ergonomics standards
- Brand guidelines
- Accessibility rules (WCAG AA/AAA)
- Mobile-friendliness

---

#### wireframes-builder
**Trigger:** "wireframe", "mockup", "prototype", "UI sketch"

Generates HTML wireframes for prototyping:
- Semantic, accessible HTML
- Output in `documentation/wireframes/`
- Responsive layouts

---

#### seo-validator
**Trigger:** "SEO", "search", "Google", "meta tags", "keywords"

Validates SEO implementation:
- Meta tags validation
- Structured data check
- Semantic HTML analysis
- Performance metrics
- Mobile-friendliness

---

### Maintenance

#### claude-audit
**Trigger:** "audit .claude", "check configuration", "validate claude config", "maintenance claude"

Audits and maintains .claude/ configuration:
- Validates frontmatter syntax (skills, agents, commands)
- Checks cross-references and coherence
- Syncs with official Claude Code documentation
- Auto-fixes safe issues with confirmation

**Modes:** `audit` (default), `validate`, `sync`, `fix`

---

### Utilities

#### billing-report
**Trigger:** "billing", "invoice", "time tracking", "work summary"

Generates billing reports from git commits:
- Time estimation per category
- Work summary grouped by type
- Invoice-ready format

---

#### usage-stats
**Trigger:** "usage stats", "skill usage", "agent usage"

Displays skill/command and agent usage statistics:
- Tracking logs analysis
- Usage patterns
- Most used components

---

## How to Use Skills

### Automatic Discovery

Simply mention what you need - Claude Code automatically discovers and invokes the appropriate skill:

```
"Review this code"          → code-review skill
"Create a task for..."      → task-definition skill
"Check accessibility"       → ux-standards-validator skill
"Generate wireframe for..." → wireframes-builder skill
```

### Manual Invocation

You can also explicitly invoke a skill using slash commands:

```
/code-review
/task-definition
/billing-report
```

---

## Skill Structure

Each skill is in its own directory with a `SKILL.md` file:

```
.claude/skills/
├── README.md                      # This file
├── api-integration-assistant/
│   └── SKILL.md
├── billing-report/
│   └── SKILL.md
├── claude-audit/
│   └── SKILL.md
├── code-review/
│   └── SKILL.md
├── documentation-sync/
│   └── SKILL.md
├── seo-validator/
│   └── SKILL.md
├── task-definition/
│   └── SKILL.md
├── test-e2e/
│   └── SKILL.md
├── usage-stats/
│   └── SKILL.md
├── ux-standards-validator/
│   └── SKILL.md
└── wireframes-builder/
    └── SKILL.md
```

---

## Creating New Skills

To create a new skill:

1. Create directory: `.claude/skills/my-skill-name/`
2. Create file: `SKILL.md` with YAML frontmatter:

```yaml
---
name: my-skill-name
description: What it does and when to use it (max 1024 chars)
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# My Skill Title

Instructions for Claude...
```

3. Skills are automatically discovered on next Claude Code session

---

## Related Documentation

- **Methodology:** `.claude/methodology.md`
- **Agents:** `.claude/agents/`
- **Commands:** `.claude/commands/`
- **Project Config:** `documentation/project-config.md`
