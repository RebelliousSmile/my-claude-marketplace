# Claude Code Configuration - Cabinet-Partage.fr

This directory contains the complete Claude Code configuration for the cabinet-partage.fr project.

## 📁 Directory Structure

```
.claude/                         # 🔧 Configuration (Templates/How to work)
├── agents/                      # Sub-agents for specialized tasks
│   ├── claude-code-optimizer.md  # Meta-agent for Claude Code optimization
│   ├── code-architect.md         # Architecture decisions
│   ├── documentation-architect.md # Documentation management
│   ├── super-coder.md            # Code generation
│   ├── test-architect.md         # Testing strategies
│   ├── ux-designer.md            # UI/UX design
│   ├── web-optimizer.md          # SEO and accessibility
│   └── README.md
├── commands/                    # Custom slash commands
│   ├── fix-phpstan.md
│   ├── review-and-fix.md
│   ├── review.md
│   ├── task.md
│   ├── update-docs.md
│   └── README.md
├── skills/                      # Reusable capabilities
│   ├── code-review/
│   │   └── SKILL.md
│   ├── task-definition/
│   │   └── SKILL.md
│   ├── documentation-sync/
│   │   └── SKILL.md
│   └── README.md
├── settings.json               # Claude Code settings
├── settings.local.json         # Local overrides (not in git)
└── README.md                   # This file
```

## 🎯 Quick Start

### For Development

1. **Start Claude Code** - Configuration is automatically available
2. **Read CLAUDE.md** - Project instructions in root directory
3. **Try commands:**
   ```
   /task            # Execute complete task with tests and commit
   /review-and-fix  # Automated code review and critical fixes
   /update-docs     # Update documentation after code changes
   ```

## 🔧 Components Overview

### 1. Skills (`.claude/skills/`)

**Reusable capabilities for the main conversation**

| Skill | Trigger | Purpose |
|-------|---------|---------|
| **code-review** | "review this code" | Structured code review |
| **task-definition** | "create a task for..." | Task definition with DoD |
| **documentation-sync** | After code changes | Keep docs up to date |

### 2. Sub-Agents (`.claude/agents/`)

**Specialized AI assistants for complex tasks**

| Agent | Expertise | Usage |
|-------|-----------|-------|
| **claude-code-optimizer** | Claude Code config | Audit and optimize setup |
| **code-architect** | Architecture | Technical decisions |
| **super-coder** | Code generation | Complex implementations |
| **test-architect** | Testing | Test strategy and coverage |
| **ux-designer** | UI/UX | Interface design |
| **web-optimizer** | SEO/Accessibility | Web optimization |
| **documentation-architect** | Documentation | Doc maintenance |

### 3. Slash Commands (`.claude/commands/`)

**Quick custom workflows**

| Command | Purpose |
|---------|---------|
| **/task** | Complete task execution (Code + Tests + Commit) |
| **/review-and-fix** | Automated code review + critical fixes |
| **/update-docs** | Documentation maintenance |
| **/review** | Code review |
| **/fix-phpstan** | Fix PHPStan errors |

## 🚀 Project Stack

- **Frontend:** PHP + Tailwind CSS
- **Backend:** PHP 8.x
- **Database:** MySQL
- **Emails:** Resend API
- **QR Codes:** endroid/qr-code
- **PDF:** TCPDF
- **Calendar:** ICS Parser

## 📚 Project Standards

### Architecture
- ✅ PHP 8.x compatible
- ✅ Tailwind CSS for styling
- ✅ Composer for dependencies
- ✅ pnpm for Node packages

### Code Quality
- ✅ PHPStan for static analysis
- ✅ PHPDoc comments on functions
- ✅ Input validation
- ✅ Database schema validation

## 🔄 Customization

### Adding New Skills

1. Create directory: `mkdir .claude/skills/my-skill/`
2. Create `SKILL.md` with YAML frontmatter
3. Restart Claude Code

### Adding New Commands

1. Create file: `.claude/commands/my-command.md`
2. Add command content
3. Use with `/my-command`

## 📞 Support

- **Claude Code Issues:** https://github.com/anthropics/claude-code/issues
- **Project:** cabinet-partage.fr

---

**Project:** Cabinet-Partage.fr
**Version:** 1.0
