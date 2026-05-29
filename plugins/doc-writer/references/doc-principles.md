# Documentation principles (shared)

The ethos every `doc-writer` skill follows, whatever the document type. Referenced via `${CLAUDE_PLUGIN_ROOT}/references/doc-principles.md`.

## Before writing

- **Name the reader and their goal.** Who reads this, what do they want to accomplish, what do they already know. No document starts before this is answered.
- **Structure before prose.** Agree the outline/skeleton first; fill sections second. A wrong structure is expensive to fix once prose exists.

## While writing

- **Scannable over linear.** Headings, tables, short paragraphs, lists. A reader finds the one answer they need without reading top to bottom.
- **Examples over description.** Show the command, snippet, request/response, or screenshot rather than describing it in prose.
- **Consistent terminology.** One term per concept, matching the product/codebase wording. Define each acronym on first use.
- **Right altitude.** Don't restate what the code, README, or another doc already says — link to it. Each document has one job.

## Truthfulness

- **Every claim verifiable.** Never invent versions, numbers, behaviors, endpoints, or UI. If unknown, ask or mark it explicitly as an assumption / open question.
- **No marketing fluff.** Ban "powerful", "easy", "seamless", "robust", "simply", "just". State what it does and how, factually.

## Language

- Write in the language of the request/product (default to the language the user wrote in); keep terminology aligned with the product's own wording.
- No emoji in the body of a versioned/delivered document unless the user asks.

## Done

- The outline's promise is fully covered, every example is real, every link resolves, and assumptions are listed where facts were missing.
