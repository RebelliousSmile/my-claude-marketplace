# 01 - Mikado

Apply the Mikado method to a bare subject: iteratively surface the ideas/beats that make up the text's progression via DFS Q&A, display Mermaid subtrees, and generate YAML files after user validation.

## Inputs

- `subject` (required) - string, the topic/idea to interview around, provided as `$ARGUMENTS`

## Outputs

Directory `interview/<subjectSlug>/` containing:
- `_meta.yaml` — graph metadata (subject, graph name, root node ID, creation date)
- One `<nodeId>.yaml` per node in the graph, each containing: `id`, `title`, `status`, `prerequisites` (list of node IDs), `purpose`, and `notes`

## Process

1. **Restate subject**: echo the subject back to the user in one sentence. Propose a `graphName` (kebab-case, ≤ 32 chars) and a `rootNodeId` (kebab-case) — the root node is the text's core claim/premise/ending, whatever the reader must ultimately land on. WAIT for user approval before continuing.

   **Kebab-case rule** (applies to `graphName`, `rootNodeId`, and every `<nodeId>` produced in step 2): lowercase; strip accents/diacritics (é→e, ç→c, etc.); drop leading French articles/prepositions with no semantic weight (le/la/les/un/une/des/de/du); replace any run of whitespace or punctuation with a single `-`; on collision with an existing node ID in the same graph, append `-2`, `-3`, etc.

2. **DFS Mikado loop** — repeat until all nodes are classified. One pass through steps a-g for one node is **one iteration** (the unit counted for the checkpoint in step 3).
   a. Pick the current node (start with root, then DFS).
   b. **Leaf check**: ask the user "Peut-on rédiger `<nodeId>` en un seul jet, sans qu'aucune autre idée du texte ne doive être établie avant ?" ("Can `<nodeId>` be drafted in one pass, with no other idea of the text needing to land first?").
   c. **If yes** (leaf): mark the node as actionable — draftable right now, standalone, with no prerequisites. Continue to step e — leaf nodes still get their `purpose` recorded and their subtree displayed like any other node.
   d. **If no** (internal node): propose 2-3 prerequisites — the ideas, context, or earlier beats the reader (or the writer) needs before this one can work. WAIT for user response — the user may accept, modify, or add prerequisites. Continue to step e.
   e. Record the node, its prerequisites (empty list for a leaf), and its `purpose` (what this beat must land in the reader's mind — one sentence). Note: prerequisites explored and then dropped are recorded as such in `notes`.
   f. **Display subtree**: render a Mermaid `graph TD` showing the current node and all its known descendants — for a leaf this is just the node itself, still rendered.
   g. Move to the next unvisited node in DFS order (for an internal node, its freshly added prerequisites; for a leaf, the next sibling/backtrack target).

3. **Checkpoint every 4 iterations** (i.e. after every 4th completed pass through steps a-g, counting both leaf and internal nodes): display the full graph as a Mermaid `graph TD`. Ask: "Continue decomposing, or would you like to restructure any part of the progression?" WAIT for user response.

4. **Final validation**: when all nodes have been classified (leaf or internal with prerequisites), display the complete Mermaid graph and list all actionable leaves (the beats ready to draft). WAIT for user validation.

5. **Generate YAML files** (only after user validation):
   - Create `interview/<subjectSlug>/` directory.
   - Write `interview/<subjectSlug>/_meta.yaml`:
     ```yaml
     graph_name: <graphName>
     root_node_id: <rootNodeId>
     subject: <original subject text>
     created_at: <YYYY-MM-DD>
     ```
   - For each node, write `interview/<subjectSlug>/<nodeId>.yaml`:
     ```yaml
     id: <nodeId>
     title: <human-readable beat/argument>
     status: pending   # pending | drafted | validated
     prerequisites:
       - <nodeId>
     purpose: <what this beat must land in the reader's mind>
     notes: ""
     ```
   - Close by telling the user this graph is standalone: to turn it into prose, hand the leaf list to `write` directly (short-form, no TOC needed) or to `toc`/`forge` if the piece warrants a full chapter breakdown or a structural challenge first.

## Test

Invoke with subject "pourquoi le télétravail tue la culture d'entreprise" (an opinion piece). After completing the DFS loop and user validation, verify that `interview/<graphName>/` is created with `_meta.yaml` present and at least one `<nodeId>.yaml` for a leaf node with `status: pending` and a non-empty `purpose`.
