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

## Langue de rédaction

- **Rédaction en français par défaut.** Ce plugin produit de la documentation en français, même si les noms de skills et certains termes techniques sont en anglais. N'écrire dans une autre langue que si l'utilisateur le demande explicitement.
- Conserver les termes techniques consacrés et les libellés d'UI dans leur forme d'origine (ne pas traduire un label produit anglais) — mais la prose qui les entoure reste en français.
- Pas d'emoji dans le corps d'un document livré/versionné, sauf demande explicite.

## Output destination

- **Produce in the conversation by default** — print the document inline, without wrapping it in an outer ` ```markdown ` fence (that would break inner code blocks).
- **Write a file only when asked**, or when the user gives a target path; then create it there.
- **Never overwrite silently**: if the target file already exists and was not produced earlier in this same run, show what changes or ask before replacing it.
- **Revising (review / verify / challenge)**: if the document is a file, edit it in place; if it lives only in the conversation, return the corrected version. If the user asked for a read-only pass, report findings and do not edit.

## Done

- The outline's promise is fully covered, every example is real, every link resolves, and assumptions are listed where facts were missing.
