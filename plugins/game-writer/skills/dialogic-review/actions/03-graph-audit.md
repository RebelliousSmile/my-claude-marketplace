# 03 - graph-audit

Validate the narrative graph structure: transitions, orphan nodes, broken loops, dead ends.

## Inputs

- `arcs_dir` (optional, default: `aidd_docs/memory/external/arcs/`) - arc specs directory
- `nodes_dir` (optional, default: `aidd_docs/memory/external/nodes/`) - node specs directory

## Outputs

```markdown
## Graph Audit Report — <date>

### Node inventory
| Node ID | Arc | Status | Next nodes |
|---|---|---|---|
| PRO-01 | PRO | ✅ | PRO-02, PRO-03 |
| A1-05 | A1 | ⚠️ orphan | — |

### Issues
- ❌ Node `PRO-04` declared in arc spec but no node spec found
- ⚠️ Node `A1-05` has no incoming transition from any other node
- ⚠️ Transition `PRO-02 → PRO-99` points to non-existent node

### Summary
<N> nodes OK · <M> orphans · <P> broken transitions · <Q> missing specs
```

## Process

1. **Collect all node specs**: list `.md` files in `nodes_dir`. Parse each for `id`, `arc`, and the Transitions table (`Next NODE` column, as defined in `aidd_docs/memory/internal/templates/node-spec.md`).
2. **Collect all arc specs**: list `.md` files in `arcs_dir`. Extract the `### Nodes à produire` list from each.
3. **Cross-check declared vs. existing**: for each node declared in an arc spec, verify a corresponding node spec file exists. Flag missing ones as ❌.
4. **Build transition graph**: for each node, collect all `next_node` values from its Transitions table. Verify each target exists in the node spec list.
5. **Detect orphans**: nodes with no incoming transition from any other node (except designated arc entry nodes). Flag as ⚠️.
6. **Detect dead ends**: non-terminal nodes (nodes without the terminal signal declared in `api-cheatsheet.md § signaux de fin de node`, or without `terminal: true` in their frontmatter) with no outgoing transitions. Flag as ❌.
7. **Detect cycles**: identify any transition loop that does not include a guard flag (i.e. same node reachable without a state change). Flag as ⚠️.
8. **Print report** to stdout.

## Test

Report printed to stdout contains a `### Node inventory` table where every listed node ID has a non-empty `Next nodes` cell or is explicitly marked terminal, and a `### Summary` line with numeric counts.
