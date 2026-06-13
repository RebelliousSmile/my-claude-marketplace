# 01 - Mikado

Apply the Mikado method to a goal: iteratively surface prerequisites via DFS Q&A, display Mermaid subtrees, and generate YAML files after user validation.

## Inputs

- `goal` (required) - string, the goal to decompose, provided as `$ARGUMENTS`

## Outputs

Directory `mikado/<graphName>/` containing:
- `_meta.yaml` — graph metadata (name, root node ID, creation date, description)
- One `<nodeId>.yaml` per node in the graph, each containing: `id`, `title`, `status`, `prerequisites` (list of node IDs), and `notes`

## Process

1. **Restate goal**: echo the goal back to the user in one sentence. Propose a `graphName` (kebab-case, ≤ 32 chars) and a `rootNodeId` (kebab-case). WAIT for user approval before continuing.

2. **DFS Mikado loop** — repeat until all leaves are identified:
   a. Pick the current node (start with root, then DFS).
   b. **Leaf check**: ask the user "Can you achieve `<nodeId>` in a single work session without changing anything else first?"
   c. **If yes** (leaf): mark the node as actionable. Move to the next unvisited node in DFS order.
   d. **If no** (internal node): propose 2-3 prerequisites for this node. WAIT for user response — the user may accept, modify, or add prerequisites.
   e. Record the node and its prerequisites. Note: prerequisites that were attempted and reverted are recorded as such.
   f. **Display subtree**: render a Mermaid `graph TD` showing the current node and all its known descendants.
   g. Move to the next node in DFS order.

3. **Checkpoint every 4 iterations**: display the full graph as a Mermaid `graph TD`. Ask: "Continue decomposing, or would you like to restructure any part of the graph?" WAIT for user response.

4. **Final validation**: when all nodes have been classified (leaf or internal with prerequisites), display the complete Mermaid graph and list all actionable leaves. WAIT for user validation.

5. **Generate YAML files** (only after user validation):
   - Create `mikado/<graphName>/` directory.
   - Write `mikado/<graphName>/_meta.yaml`:
     ```yaml
     graph_name: <graphName>
     root_node_id: <rootNodeId>
     goal: <original goal text>
     created_at: <YYYY-MM-DD>
     ```
   - For each node, write `mikado/<graphName>/<nodeId>.yaml`:
     ```yaml
     id: <nodeId>
     title: <human-readable title>
     status: pending   # pending | done | reverted
     prerequisites:
       - <nodeId>
     notes: ""
     ```

## Test

Invoke with goal "migrate authentication to OAuth2". After completing the DFS loop and user validation, verify that `mikado/<graphName>/` is created with `_meta.yaml` present and at least one `<nodeId>.yaml` for a leaf node.
