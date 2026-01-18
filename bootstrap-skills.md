---
name: bootstrap-skills
description: Initialize project with production-ready Agent Skills. Use PROACTIVELY when user asks to "setup skills", "initialize skills", "create base skills", "bootstrap skills", or mentions needing validators, generators, or domain expertise packages.
tools: Read, Write, Glob, Bash
model: inherit
---

# Bootstrap Skills

Initialize a project with a complete set of **production-ready, agnostic Agent Skills**.

## Quick Start

When invoked, this skill will:
1. Check if `.claude/skills/` exists
2. List skills to be created
3. Ask for confirmation
4. Create all skills in `.claude/skills/[name]/SKILL.md`

## Available Skills

| Skill | Purpose | Tools | Auto-Trigger |
|-------|---------|-------|--------------|
| `ux-standards-validator` | Validate UI/UX against ergonomics, brand, a11y | Read, Grep, Glob | "UI", "UX", "accessibility", "WCAG" |
| `seo-validator` | Validate SEO implementation (meta, schema, performance) | Read, Grep, Glob | "SEO", "meta tags", "search optimization" |
| `memory-bank-validator` | Validate memory bank consistency | Read, Glob, Bash | "memory", "context", "documentation health" |
| `task-definition` | Generate structured task files for /task command | Read, Write, Glob | "create task", "define task", "task file" |
| `claude-code-optimizer` | Audit and optimize Claude Code configuration | Read, Grep, Glob, Bash, WebFetch | "optimize", "audit", "claude code setup" |

---

## Skill Definitions

### 1. ux-standards-validator

```markdown
---
name: ux-standards-validator
description: Validate UI/UX design against ergonomics standards, brand guidelines, and accessibility rules (WCAG AA/AAA). Use when reviewing interfaces, checking accessibility, validating responsive design, or when user mentions "UI", "UX", "design", "accessibility", "a11y", "responsive", "mobile", "WCAG".
version: 1.0.0
---
# Note: Skills inherit permissions from parent context (no allowed-tools field)

# UX Standards Validator

Validate UI/UX implementations against:
1. **Ergonomics standards** (usability, touch targets, spacing)
2. **Brand guidelines** (colors, typography, visual identity)
3. **Accessibility rules** (WCAG 2.1 AA minimum, AAA preferred)

## Workflow

### Step 1: Discover Project Standards

**BEFORE validating**, read project documentation:

```bash
Read CLAUDE.md
Glob pattern="**/design-system.md"
Glob pattern="**/brand-guidelines.md"
Glob pattern="**/style-guide.md"
```

**Extract**:
- Color palette (primary, secondary, neutral, semantic)
- Typography (font families, sizes, weights)
- Spacing system (base unit, scale)
- Component library

### Step 2: Analyze the UI/UX

#### Pillar 1: Ergonomics (0-100)

- [ ] Touch targets ≥ 48x48px
- [ ] Spacing follows project system
- [ ] Typography readable (min 14px, line-height ≥ 1.5)
- [ ] Responsive design (mobile-first if required)
- [ ] Loading states visible
- [ ] Error messages clear and actionable
- [ ] Form validation inline
- [ ] Navigation intuitive

#### Pillar 2: Brand Guidelines (0-100)

- [ ] Colors match project palette
- [ ] Typography uses project fonts
- [ ] Font sizes follow scale
- [ ] Spacing uses project units
- [ ] Component consistency
- [ ] Dark mode (if required)
- [ ] Visual hierarchy clear

#### Pillar 3: Accessibility WCAG 2.1 (0-100)

- [ ] Semantic HTML (header, nav, main, footer)
- [ ] Heading hierarchy (h1 → h2 → h3, no skips)
- [ ] Alt text for images
- [ ] Form labels properly associated
- [ ] Color contrast ≥ 4.5:1 (text), ≥ 3:1 (large)
- [ ] Keyboard navigation supported
- [ ] Focus indicators visible
- [ ] ARIA labels where needed

### Step 3: Generate Report

```markdown
# UX Standards Validation Report

**File/Component**: [Name]
**Date**: [ISO date]

## Overall Score: [X/100]

| Pillar | Score | Status |
|--------|-------|--------|
| Ergonomics | X/100 | ✅/⚠️/❌ |
| Brand Guidelines | X/100 | ✅/⚠️/❌ |
| Accessibility (AA) | X/100 | ✅/⚠️/❌ |

## 🔴 Critical Issues (Must Fix)
1. **[Issue]** - `file:line`
   - Problem: [description]
   - Fix: [solution]

## 🟡 Important Issues (Should Fix)
1. **[Issue]** - `file:line`

## 🟢 Suggestions (Nice to Have)
1. **[Suggestion]**

## Testing Checklist
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Test at 200% zoom
- [ ] Test on mobile device
```

## Fallback Standards

If project documentation is missing:
- Use WCAG 2.1 AA as minimum
- Use Material Design ergonomics (48px touch targets)
- Use 4.5:1 contrast ratio for text
- Use mobile-first responsive approach

## Severity Classification

**CRITICAL**: Missing alt text, insufficient contrast, keyboard broken, focus removed
**HIGH**: Touch targets < 48px, hardcoded colors, inconsistent spacing
**MEDIUM**: Non-semantic HTML, heading skips, missing ARIA
**LOW**: AAA improvements, minor inconsistencies
```

---

### 2. seo-validator

```markdown
---
name: seo-validator
description: Validate SEO implementation against best practices. Use when checking meta tags, structured data, semantic HTML, performance, mobile-friendliness, or when user mentions "SEO", "search", "Google", "meta tags", "keywords", "ranking".
version: 1.0.0
---
# Note: Skills inherit permissions from parent context (no allowed-tools field)

# SEO Validator

Validate SEO implementation against:
1. **On-Page SEO** (meta tags, headings, content structure)
2. **Technical SEO** (structured data, canonical URLs, performance)
3. **Mobile SEO** (responsive design, mobile-friendliness)
4. **Advanced SEO** (voice search, LLM/AI search optimization)

## Workflow

### Step 1: Discover Project SEO Strategy

```bash
Read CLAUDE.md
Glob pattern="**/seo*.md"
Grep pattern="SEO|meta tags|Open Graph|Schema.org"
```

### Step 2: Analyze Against 4 Pillars

#### Pillar 1: On-Page SEO (30 points)

1. **Title Tag** (8 pts)
   - [ ] Exists and unique
   - [ ] 50-60 characters
   - [ ] Contains primary keyword

2. **Meta Description** (6 pts)
   - [ ] Exists and unique
   - [ ] 150-160 characters
   - [ ] Includes call-to-action

3. **Headings Hierarchy** (6 pts)
   - [ ] Single `<h1>` per page
   - [ ] Logical hierarchy (no skips)
   - [ ] Descriptive and scannable

4. **Content Quality** (5 pts)
   - [ ] Minimum 300 words
   - [ ] Keywords natural (not stuffed)
   - [ ] Internal links present

5. **Images** (5 pts)
   - [ ] All have descriptive `alt` text
   - [ ] Optimized (WebP, lazy loading)
   - [ ] Responsive (`srcset`)

#### Pillar 2: Technical SEO (30 points)

1. **Meta Viewport** (4 pts)
2. **Canonical URL** (6 pts)
3. **Open Graph Tags** (6 pts)
4. **Twitter Cards** (3 pts)
5. **Structured Data (Schema.org)** (8 pts)
6. **Performance Hints** (3 pts)

#### Pillar 3: Mobile SEO (20 points)

1. **Mobile-Friendly Design** (10 pts)
2. **Page Speed** (10 pts)

#### Pillar 4: Advanced SEO (20 points)

1. **Voice Search Optimization** (10 pts)
   - Question-based content
   - Featured snippet optimization
   - FAQPage/HowTo schema

2. **LLM/AI Search Optimization** (10 pts)
   - Clear content structure
   - Direct answers with citations
   - Freshness and entity clarity

### Step 3: Generate Report

```markdown
# SEO Validation Report

**Page**: [Name/URL]
**Date**: [ISO date]

## Overall Score: [X/100]

| Pillar | Score | Status |
|--------|-------|--------|
| On-Page SEO | X/30 | ✅/⚠️/❌ |
| Technical SEO | X/30 | ✅/⚠️/❌ |
| Mobile SEO | X/20 | ✅/⚠️/❌ |
| Advanced SEO | X/20 | ✅/⚠️/❌ |

## 🔴 Critical Issues
[List with fixes]

## Optimized Meta Tags
```html
<title>[Optimized title]</title>
<meta name="description" content="[Optimized]">
```

## Schema Markup Recommendation
```json
{
  "@context": "https://schema.org",
  "@type": "[type]"
}
```
```

## Core Web Vitals Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
```

---

### 3. memory-bank-validator

```markdown
---
name: memory-bank-validator
description: Validate memory bank consistency and integrity. Use when user mentions "memory", "documentation", "context", or asks about context usage, documentation health, or CLAUDE.md validation.
version: 1.0.0
---
# Note: Skills inherit permissions from parent context (no allowed-tools field)

# Memory Bank Validator

Validate Claude Code memory bank for consistency, missing references, and optimization.

## Triggers

Use this skill when user:
- Mentions "memory bank", "documentation", "context usage"
- Asks "what files are loaded?"
- Mentions inconsistencies in documentation
- Requests `/context` or `/memory`

## Workflow

### Step 1: Extract References

```bash
grep -E '^@documentation/' CLAUDE.md
```

### Step 2: Verify Existence

```bash
file="documentation/path/file.md"
[ -f "$file" ] && echo "✅ $file" || echo "❌ MISSING: $file"
```

### Step 3: Detect Duplicates

```bash
grep -E '^@documentation/' CLAUDE.md | sort | uniq -c | grep -v '^ *1 '
```

### Step 4: Estimate Tokens

```bash
wc -w [file] | awk '{print $1 * 1.3}'  # words × 1.3 ≈ tokens
```

## Output Format

```markdown
## 📊 Memory Bank Validation

**Status**: ✅ Healthy / ⚠️ Attention / ❌ Issues Found

### Summary
- References in CLAUDE.md: X
- Valid files: X/X
- Missing files: N
- Duplicates: N

### ❌ Problems Detected

1. ❌ **Missing**: `path/to/file.md`
2. ⚠️ **Duplicate**: `file.md` (2 occurrences)
3. ⚠️ **Size mismatch**: `file.md` (estimated 10k, actual 13.7k)

### 💡 Recommendations

1. Add: `path/to/recommended.md` (Xk tokens)
2. Remove duplicate: Line X in CLAUDE.md

### 🎯 Actions

Would you like me to:
- [ ] Update CLAUDE.md to add missing files?
- [ ] Remove detected duplicates?
- [ ] Run `/check-memory` for more details?
```

## Rules

1. **Read-only by default**: NEVER modify CLAUDE.md without confirmation
2. **No false positives**: Verify actual file existence
3. **Concise**: Report < 20 lines unless issues detected
4. **Actionable**: Always propose concrete actions
```

---

### 4. task-definition

```markdown
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

- ✅ Complete task specification with acceptance criteria
- ✅ Identification of files to modify
- ✅ Test requirements and validation steps
- ✅ Context for implementation decisions

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
```

---

### 5. claude-code-optimizer

```markdown
---
name: claude-code-optimizer
description: Audit and optimize Claude Code configuration. Use PROACTIVELY when users ask about improving their Claude Code setup, auditing .claude/ configuration, creating or optimizing skills/agents/commands/hooks, reviewing CLAUDE.md files, or troubleshooting Claude Code issues.
tools: Read, Grep, Glob, Bash, WebFetch
model: inherit
---

# Claude Code Optimizer Agent

Expert in Claude Code configuration and optimization.

## Core Responsibilities

1. **Audit Configuration** - Review `.claude/` structure, skills, agents, commands, hooks
2. **Optimize Setup** - Identify redundant or conflicting configurations
3. **Consult Documentation** - Fetch latest docs before recommendations
4. **Implement Improvements** - Create or update components

## Workflow

### Step 1: Discovery

```bash
# Directory structure
ls -la .claude/ 2>/dev/null || echo "No .claude/ directory"

# Skills, agents, commands, hooks
find .claude/skills -name "SKILL.md" 2>/dev/null
find .claude/agents -name "*.md" 2>/dev/null
find .claude/commands -name "*.md" 2>/dev/null
ls -la .claude/hooks/ 2>/dev/null

# Project configuration
cat CLAUDE.md 2>/dev/null || echo "No CLAUDE.md"
```

### Step 2: Documentation Research

**ALWAYS consult official docs:**
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/hooks-guide
- https://code.claude.com/docs/en/slash-commands
- https://code.claude.com/docs/en/settings

### Step 3: Analysis Checklists

**Skills:**
- [ ] `SKILL.md` (case-sensitive) in dedicated folder
- [ ] YAML frontmatter starts on line 1
- [ ] `name`: lowercase, hyphens only
- [ ] `description`: includes "Use when..." keywords
- [ ] `allowed-tools`: restricted to minimum necessary

**Agents:**
- [ ] File in `.claude/agents/`
- [ ] `name`: lowercase, hyphens only
- [ ] `description`: action-oriented, "PROACTIVELY" if auto-trigger
- [ ] `tools`: omitted = inherits all, or restricted list
- [ ] `model`: sonnet, opus, haiku, or inherit

**Commands:**
- [ ] File in `.claude/commands/`
- [ ] `description` field for discoverability
- [ ] `$ARGUMENTS` placeholder for user input
- [ ] `allowed-tools` if restriction needed

### Step 4: Generate Report

```markdown
# Claude Code Optimization Report

**Project:** [name] | **Date:** [today]

## Summary
[2-3 sentences]

## Current Setup
| Component | Count | Status |
|-----------|-------|--------|
| Skills | X | ✅/⚠️/❌ |
| Agents | X | ✅/⚠️/❌ |
| Commands | X | ✅/⚠️/❌ |
| Hooks | X | ✅/⚠️/❌ |

## 🔴 Critical Issues
- **[Issue]** in `[file]`: [description] → **Fix:** [solution]

## 🟠 Important
- **[Issue]**: [description] → **Recommendation:** [suggestion]

## 🟡 Minor
- **[Enhancement]**: [suggestion]

## Implementation Plan
1. [ ] [Critical fix]
2. [ ] [Important improvement]
3. [ ] [Enhancement]
```

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| Skill not loading | Blank line before `---` | `---` must be line 1 |
| Invalid YAML | Tabs in frontmatter | Use spaces only |
| Field not recognized | Wrong name | `allowed-tools` not `allowed_tools` |
| Agent not auto-triggering | Vague description | Add "PROACTIVELY" + keywords |
| Tools not working | Typo | Exact names: Read, Write, Edit, Bash, Glob, Grep |

## Optimization Patterns

1. **Redundant components** → Merge or differentiate
2. **Over-permissive tools** → Restrict to minimum
3. **Unclear descriptions** → Add "Use when..." keywords
4. **Bloated prompts** → Split into sub-agents
5. **Wrong model** → haiku (fast), sonnet (balanced), opus (complex)
```

---

## Installation

### Automatic Installation

When this skill is invoked, it will:

1. **Check existing skills:**
   ```bash
   find .claude/skills -name "SKILL.md" 2>/dev/null || echo "No skills"
   ```

2. **Show skills to create:**
   ```
   Skills to install:
   - ux-standards-validator
   - seo-validator
   - memory-bank-validator
   - task-definition
   - claude-code-optimizer
   ```

3. **Ask for confirmation:**
   ```
   Create all 5 skills in .claude/skills/? (y/n)
   Or specify which ones: "seo-validator, task-definition"
   ```

4. **Create directories and files:**
   ```bash
   mkdir -p .claude/skills/ux-standards-validator
   # Write SKILL.md to each directory
   ```

### Manual Installation

1. Create directory: `mkdir -p .claude/skills/[skill-name]`
2. Copy skill definition above into `.claude/skills/[skill-name]/SKILL.md`

### Verification

After installation, ask Claude:
```
What skills are available?
```

Or check the filesystem:
```bash
find .claude/skills -name "SKILL.md"
```

---

## Customization

After installation, customize skills for your project:

1. **Update triggers** in descriptions for your domain
2. **Add project-specific checklists** to validators
3. **Adjust scoring weights** based on priorities
4. **Add references/** folders for detailed documentation

---

## Skill vs Command Decision

**These are Skills (model-invoked) because:**
- Claude should auto-discover based on context
- Complex multi-step workflows
- Domain expertise packages
- Produce structured reports

**Use Commands instead when:**
- User explicitly invokes (`/command`)
- Simple, single-purpose operation
- Frequently-used shortcut

---

**Version:** 1.0.0
**Last Updated:** 2025-01
**Skills Count:** 5
