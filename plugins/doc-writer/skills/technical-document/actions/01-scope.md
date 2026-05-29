# 01 - scope

Determine the document type, its audience, and the sources to write from.

## Inputs

- `request` (required) — what needs documenting.
- Access to the codebase / system.

## Process

1. **Classify the document type** against `references/doc-types.md`: architecture, API/reference, integration, runbook, or design note. If the request spans two, propose splitting into linked docs.
2. **Name the audience** and their goal (calling the API? operating the system? reviewing a design?) per `doc-principles.md`.
3. **Locate the sources**: the specific modules, endpoints, configs, or ADRs that ground the doc. List the files you will read.
4. **Spot gaps**: parts of the system you cannot inspect or that are undecided — these become assumptions/open questions.
5. **Confirm the structure**: present the chosen type's section list as the outline.

## Outputs

The document type, audience, source file list, and the section outline from the type's template — presented for confirmation. Plus any gap to resolve.

## Test

The type matches `doc-types.md`, the audience and their goal are stated, the grounding sources are concrete files, and the outline follows the type's structure.
