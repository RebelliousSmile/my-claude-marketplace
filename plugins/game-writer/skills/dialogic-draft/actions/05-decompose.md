# 02 - decompose

Break an arc spec into individual node specs, each with a complete Transitions table.

## Inputs

- `arc_spec_path` (required) - path to `aidd_docs/memory/external/arcs/<ARC_ID>.md`

## Outputs

```
aidd_docs/memory/external/nodes/<NN>.md  (one file per node)
```

Each file follows the template at `@aidd_docs/memory/internal/templates/node-spec.md` and includes:
- Metadata block (`arc`, `id`, `output_style`, `complexity`)
- Incoming variables and flags
- Characters present
- Choice options (if interactive)
- **Transitions table** (canonical — flags in, flags out, next nodes per branch)

## Depends on

- `01-arc-spec`

## Process

1. **Read arc spec**: extract the node list from `### Nodes à produire`.
2. **Load** `variables-register.md`, `architecture.md` for NODE format conventions.
3. **For each node**, generate a node spec:
   - Assign ID using arc convention (`<ARC>-NN` or `<ARC>-NN-<modifier>`)
   - Declare `output_style` (default: `scenario` unless arc spec specifies otherwise)
   - Fill incoming variables from arc postconditions of upstream nodes
   - Write the Transitions table: each row = one branch with flags in, effects, flags out, next node ID
   - Flag scenes needing a `.tscn` stub (point-and-click nodes)
4. **Verify no orphan nodes**: every node except arc-terminal ones must appear as a `next_node` in at least one Transitions row of another node.
5. **Write** each node spec to `aidd_docs/memory/external/nodes/<NN>.md`.
6. **Remind user** to run `bank init` to refresh the `lore.nodes` registry with the new files.

## Test

N node files exist in `aidd_docs/memory/external/nodes/`, where N matches the node count in the arc spec's `### Nodes à produire` section. Each file contains a non-empty `## Transitions` table.
