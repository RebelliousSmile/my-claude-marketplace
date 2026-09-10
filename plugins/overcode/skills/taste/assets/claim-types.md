# Weighted claim types — taste

Classify by consequence, not Markdown syntax. When one statement contains several independently falsifiable claims, split it before assigning weights.

## Local repository claims

| Class | Weight | Claim types | Primary verification |
|---|---:|---|---|
| Critical | 3 | Required file/directory exists; required command or skill exists; dependency/runtime version satisfies a stated requirement; decision re-evaluation condition; claimed replacement/implementation exists | Filesystem and content read; loaded skill catalogue or PATH; active manifest/toolchain file; subject-matched repository/tracker evidence |
| Structural | 2 | Function, class, component, method, constant, export, CSS token, branch, commit, issue/PR state, ADR/DEC or memory/rule reference | Exact symbol search plus declaration context; Git/tracker query; active normative roots |
| Informative | 1 | Line number, count, non-required path mention, relative Markdown link, release artifact mention | Target existence and relevant line/count; link resolved relative to the document; subject-matched release metadata |

An absent critical claim has more influence than any two informative claims and vetoes `Current`/`Superseded` regardless of percentage.

## External factual claims

Claims whose authority is outside the repository are tagged `external` and carry no local weight. Examples: market share, public product behavior, laws, standards, vendor promises, external dates, and factual comparisons. Delegate them to `aidd-refine:04-fact-check` as extracted text.

Project tracker state, release assets, and upstream repository facts used by the decision protocol remain eligible only when they are directly tied to this repository's decision subject and their primary source is accessible. Otherwise tag them external.

## Exclusions

Do not score:

- rationale, preference, or opinion;
- future intent clearly marked `TODO`, `will`, `à venir`, or equivalent;
- conceptual explanation with no falsifiable repository referent;
- anchor-only links;
- a claim whose supposed evidence is only another prose document.

Record an excluded passage only when it helps explain why coverage is limited; never convert it to `Obsolete`.
