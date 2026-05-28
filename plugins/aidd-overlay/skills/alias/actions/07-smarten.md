# Action 07 — smarten

Rewrites a `.md` prompt file in place using ultra-minimal criteria: remove fluff, compress steps, prefer bullet points, keep only essential constraints.

## Context required

- `$ARGUMENTS` must be a `.md` file path. If absent or not `.md`, abort: *"smarten only operates on .md files. Which file?"*

## Prompt

Execute the following workflow verbatim:

### Step 1 — Read

Read the file at `$ARGUMENTS` in full. Record line count as `N`.

### Step 2 — Smarten

Rewrite the content applying all rules simultaneously:

- **No fluff** — delete preambles, transition phrases, hedging language ("in order to", "please note that", "it is important to").
- **No redundancy** — if the same constraint appears twice in different words, keep the tightest formulation and delete the other.
- **Compress steps** — reduce each process step to its minimum complete expression. Do not impose a sentence limit; split only if two truly distinct operations are present.
- **Bullet points over prose** — convert prose enumerations to bullet lists. Do not convert narrative paragraphs that provide necessary context.
- **No speculative content** — delete "you could also", unreachable alternatives, and tangential explanations. Retain documented fallbacks and conditional branches (`if X → do Y`) that are part of the specified behavior.
- **Preserve all semantics** — every constraint, input, output, fallback, and test condition present in the original must survive in the rewrite. Compress phrasing only; do not drop rules.
- **Preserve structure** — keep existing headings (`##`, `###`) and their order. Do not add new sections. The description line immediately under the `#` title is structural (not fluff) — compress it, never delete it.

### Step 3 — Write

Overwrite the file at `$ARGUMENTS` with the rewritten content.

### Step 4 — Report

Record line count as `M`. Output:

```
Smartened: <file path>
Before: N lines → After: M lines (−X lines, −Y%)

Top changes:
- <most significant deletion or compression, 1 line>
- <second most significant, 1 line>
- <third most significant, 1 line>
```
