---
name: 'aidd:02:decompose_mikado'
description: 'Decompose a goal into a Mikado dependency graph through iterative questioning'
argument-hint: Goal to decompose (e.g. "migrate authentication to OAuth2")
---

# Mikado Decomposition

## Goal

Apply the Mikado method to decompose $ARGUMENTS into a dependency graph of actionable tasks, then generate the YAML files.

## Context

### Storage format

```markdown
@docs/wiki/Storage-Format.md
```

### MCP guide

```markdown
@mcp-server/src/resources/guide.md
```

## Rules

- Node IDs in kebab-case
- Each leaf node must be achievable in a single work session
- Follow DFS order: decompose depth-first, pick first child before siblings
- Display a mermaid diagram of the current subtree after each iteration, full graph at checkpoints only

## Steps

1. Restate the goal in one sentence, propose a `graphName` and `rootNodeId`
2. **WAIT FOR USER APPROVAL**
3. Start the Mikado loop on the root node, following DFS:
   a. **LEAF CHECK** — Is this node directly achievable in one work session? If yes, mark as leaf and skip to (f)
   b. **ATTEMPT** — "Imagine you try to do **[current node]** right now. What breaks? What's missing?"
   c. Propose 2-3 likely prerequisites as candidate child nodes
   d. **WAIT FOR USER RESPONSE** — user confirms, edits, or adds prerequisites
   e. **REVERT** — "The attempt on **[current node]** failed. We revert and record its prerequisites." Add confirmed prerequisites as `depends_on` of the current node
   f. Display current subtree (mermaid). Pick next undecomposed node (DFS, first child first) and repeat from (a)
   g. If decomposing a child reveals the parent was wrong, announce "Restructuring: [reason]", update the parent, and resume
4. Every 4 iterations, display full graph + ask: "Continue decomposing, or restructure something?"
5. When all paths end in actionable leaves or user says "stop":
   a. Display final complete graph (mermaid) with all nodes and dependencies
   b. List all leaf nodes as "actionable now" and their suggested execution order (bottom-up)
   c. **WAIT FOR USER VALIDATION**
6. Generate YAML files:
   a. Create `mikado/<graphName>/` directory
   b. Write `_meta.yaml`: goal, root, version: "1", phase: design, created_at, updated_at (ISO 8601)
   c. Write one `<nodeId>.yaml` per node: description, status: todo, depends_on
   d. Confirm files written with count
