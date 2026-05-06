---
name: project_memory
description: Template for synthesized project memory and decisions export with size metrics.
---

# Project Memory — <date>

## Footprint

| Metric | Value |
|--------|-------|
| Memory files | N |
| Total lines | N |
| Total size | N KB |
| Oversized files | N (>300 lines or >15 KB) |
| Decisions recorded | N |

## Health Verdict

> ✅ Healthy / ⚠️ Approaching limits / ❌ Oversized

<1-2 lines explaining the verdict and recommended action>

## Memory Files

### Core (`aidd_docs/memory/`)

#### `<file.md>` — <N lines, N KB>

<3-6 line synthesis: purpose, key facts, notable signals>

### Internal (`aidd_docs/memory/internal/`)

#### `<file.md>` — <N lines, N KB>

<synthesis>

### External (`aidd_docs/memory/external/`)

#### `<file.md>` — <N lines, N KB>

<synthesis>

## Decisions

> Recorded design and architecture decisions found in the project (dedicated files + inline sections).

### DEC-XXX — <title>

| Field | Value |
|-------|-------|
| Source | `<file path>` (dedicated or inline) |
| Status | Accepted / Deprecated / Superseded |
| Feature | <feature> |
| Date | <yyyy-mm-dd> |

- **Decision:** <1 line>
- **Why:** <1 line>
- **Consequences:** <1 line>

## Cleanup Suggestions

> Only filled if verdict is ⚠️ or ❌.

- [ ] <suggestion 1: split file X into Y and Z>
- [ ] <suggestion 2: archive stale memory file>
- [ ] <suggestion 3: consolidate duplicates>
