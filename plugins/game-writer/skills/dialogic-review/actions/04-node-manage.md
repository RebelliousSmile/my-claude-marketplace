# 04 - node-manage

List, inspect, update, or retire nodes in the node spec registry.

## Inputs

- `command` (required) - one of: `list`, `status`, `update`, `retire`
- `node_id` (optional) - node ID for `status`, `update`, `retire` commands
- `field` (optional) - field name to update (for `update` command)
- `value` (optional) - new value (for `update` command)

## Outputs

`list`:
```
| Node ID | Arc  | Status  | output_style | Complexity |
|---------|------|---------|--------------|------------|
| PRO-01  | PRO  | active  | scenario     | simple     |
| A1-03   | A1   | retired | scenario     | dense      |
```

`status`: full content of the node spec for the given ID.

`update`: confirmation message + updated field in the node spec file.

`retire`: confirmation + `status: retired` set in the node spec frontmatter.

## Process

### `list`
1. Scan all `.md` files in `aidd_docs/memory/external/nodes/`.
2. For each file, read frontmatter fields: `id`, `arc`, `status` (default `active` if absent), `output_style`, `complexity`.
3. Print table sorted by arc then node ID.

### `status`
1. Find the node spec file matching `node_id`.
2. Print its full content.

### `update`
1. Find the node spec file matching `node_id`.
2. Validate `field` against the allowed frontmatter fields from `aidd_docs/memory/internal/templates/node-spec.md`: `status`, `output_style`, `complexity`. Reject any other field with an error.
3. Update `field` to `value` in the frontmatter.
4. Print: `Updated <node_id>: <field> = <value>`.

### `retire`
1. Find the node spec file matching `node_id`.
2. Set `status: retired` in the frontmatter. Add a `retired_date: <ISO date>` field.
3. Print: `Retired <node_id>. Node spec preserved at <path>`.
4. Do NOT delete the file — retired specs are kept for narrative history.

## Test

`list` → stdout contains a Markdown table with at least one row and columns `Node ID`, `Arc`, `Status`. `retire <node_id>` → the corresponding node spec file contains `status: retired` in its frontmatter.
