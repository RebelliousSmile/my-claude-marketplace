# Documentation Sync Reference

## Modes

| Mode | Command | Description |
|------|---------|-------------|
| sync | `/documentation-sync` | Sync code → docs |
| clean | `/documentation-sync clean` | Cleanup old files |
| quick-ref | `/documentation-sync quick-ref <name>` | Create quick guide |
| check | `/documentation-sync check` | Verify integrity |
| optimize | `/documentation-sync optimize` | Audit tokens |

## Documentation Structure (Recommended)

```
documentation/
├── memory-bank/     # Core docs (always loaded)
│   ├── core/        # Essential (~20k tokens max)
│   └── guides/      # Contextual guides
├── notebooks/       # Deep technical docs
├── guides/          # User guides
├── diagrams/        # Architecture visuals
├── tasks/           # Task definitions
├── reviews/         # Code reviews
├── reports/         # Generated reports
└── wireframes/      # UI mockups
```

## Token Estimation

| Content Type | Tokens per KB |
|--------------|---------------|
| Markdown | ~250 |
| Code (JS/TS/Python) | ~300 |
| JSON | ~350 |
| Plain text | ~200 |

**Quick estimate:** `words × 1.3 ≈ tokens`

## File Categories

### Core (Always Loaded)
- Essential conventions
- Architecture overview
- Quick references
- **Target:** < 50k tokens total

### Contextual (Loaded on Demand)
- Detailed specifications
- API documentation
- Database schemas
- **Loaded via:** Skills, explicit request

### Temporary (Cleanup Candidates)
- Reviews > 30 days
- Completed tasks
- Backup files

## Sync Workflow

### 1. Detect Changes

```bash
git diff HEAD~1 --name-status
```

### 2. Map Code → Docs

| Code Pattern | Documentation |
|--------------|---------------|
| `src/**/*.ts` | `docs/api/` |
| `lib/**/*.py` | `docs/reference/` |
| `schema/*.sql` | `docs/database/` |
| `routes/*` | `docs/api/endpoints.md` |

### 3. Generate Updates

- Extract function signatures
- Update API docs
- Sync schema changes

### 4. Validate

- Check links
- Verify examples
- Test code snippets

## Cleanup Rules

### Auto-Cleanup Candidates

```
documentation/reviews/*     → > 30 days
documentation/tasks/*       → completed + > 30 days
*.backup-*                  → > 7 days
*-temp-*, *-draft-*         → > 7 days
```

### Never Auto-Delete

- ADRs (Architecture Decision Records)
- READMEs
- Core documentation
- Files referenced in CLAUDE.md

## Safety Rules

1. **NEVER** delete without user confirmation
2. **ALWAYS** offer archive before delete
3. **ALWAYS** backup CLAUDE.md before modification
4. **NEVER** modify CLAUDE.md automatically
5. **ALWAYS** calculate token impact

## Check Mode Validations

- [ ] All @references exist
- [ ] No broken internal links
- [ ] No duplicate files
- [ ] Token estimates accurate
- [ ] Orphaned files identified

## Optimize Mode Analysis

1. **Token usage** - Current vs recommended
2. **Redundancy** - Duplicate content
3. **Consolidation** - Files to merge
4. **Hierarchy** - Core vs contextual placement
