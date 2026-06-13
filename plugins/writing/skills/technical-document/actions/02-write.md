# 02 - write

Write the document from the scoped type's template, grounded in the code.

## Inputs

- The type, outline and source list from `01-scope`.
- Read access to those sources.

## Process

0. **Load the output style**: `${CLAUDE_PLUGIN_ROOT}/skills/technical-document/references/output-style.md` by default, or the file passed via `--style <path>`. Apply its voice, tense and formatting (code blocks, citation format, tables, Mermaid) throughout.
1. **Read the sources first.** Confirm behavior, signatures, params, errors, and flow from the actual code before writing them.
2. **Write section by section** per the type's structure in `${CLAUDE_PLUGIN_ROOT}/skills/technical-document/references/doc-types.md`.
3. **Examples are real**: copy signatures/requests/commands from the code or a validated run. Never present illustrative pseudo-code as working.
4. **Cite** `file:symbol` or `file:line` where it helps a reader navigate; link ADRs/existing docs instead of restating decisions.
5. **Diagrams**: use Mermaid (sequence/flow/component) the reader can edit; describe in text what isn't drawable.
6. **Mark assumptions**: anything you could not verify from source is flagged, not asserted.
7. **Export (if requested)**: if `--format icml` was passed, export the finished Markdown to ICML per `${CLAUDE_PLUGIN_ROOT}/references/export-icml.md`. The Markdown stays the source.

## Outputs

The drafted technical document (Markdown by default; plus a `.icml` export when `--format icml`), with code citations and an assumptions/open-questions section where source was missing.

## Test

The document follows its type's structure, every signature/param/error traces to the source, all examples are real (not pseudo-code), and unverified points are flagged as assumptions.
