---
name: tree
description: Keeps the Documents/ tree navigable as it evolves — maintains a cache (map of the real arborescence), verifies it against a small set of portability invariants, fixes drift safely, and helps sort loose items into place by arbitration. Use to check whether a directory is well-organised, to tidy it, or to decide where something belongs. Do NOT use to build a writing brief — use `obsidian:brief`; do NOT use to produce content — use the `writing` plugin.
disable-model-invocation: true
---

# Tree

Keeps `Documents/` **navigable while it keeps changing**. Rather than enforcing a frozen layout, `tree` maintains a **cache** (a map of the *actual* arborescence) and uses it to verify drift, fix it, and arbitrate where loose items go.

**Local paths, discovered anchor — no global hardcoding.** `tree` works relative to a **target directory** (the CWD by default, or a path passed as argument). It finds the schema **anchor** by walking up to a `Perso`/`Pro` segment; it never hardcodes `C:\Users\…\Documents`. The cache lives at the anchor (`<anchor>/_tree/cache.json`) and is fully regenerable.

> The convention — invariants, the observed default pattern, the cache format, anchor resolution — lives in `${CLAUDE_PLUGIN_ROOT}/references/tree-convention.md`. Read it before acting.

## What stays fixed vs what is learned

- **Invariants (fixed, enforced):** `_` prefix on working dirs, content inside not prefixed, portable kebab-case slugs, well-formed dates. These serve portability and never change.
- **Convention (learned, soft):** the `(Perso|Pro)/category/subcategory/AAAA/MM/unit` pattern is a *default*, not a law. `tree` learns each domain's effective convention from what already exists and records it in the cache. Divergence is reported as drift, not punished as a violation.

## Available actions

| #   | Action  | Role                                                                          | Input                              |
| --- | ------- | ----------------------------------------------------------------------------- | ---------------------------------- |
| 01  | `index` | Scan the real tree → refresh `<anchor>/_tree/cache.json` + each domain's `R/bank.yml` | `[<target>]` (default: CWD)        |
| 02  | `check` | Verify invariants + drift vs the cached convention; report only                | `[<target>]` (default: CWD)        |
| 03  | `fix`   | Apply safe corrections for confirmed anomalies/drift (rename, move; never delete) | `[<target>]` (default: CWD)        |
| 04  | `sort`  | Arbitrate placement of loose/unsorted items into the tree, using the cache     | `<items…>` `[--into <target>]`     |

## Default flow

Trigger-to-action mapping:
- "index the tree", "scan", "refresh the map", "rebuild cache" → `index`
- "check organisation", "is this tidy", "vérifier l'arbo", "what's out of place" → `check`
- "fix the tree", "tidy", "ranger", "corriger l'arbo" → `fix`
- "where does this go", "sort these files", "trier", "classe ça" → `sort`

`check`/`fix`/`sort` auto-refresh the cache if it is missing or stale (the target changed since `scanned_at`).

## Transversal rules

- **Discovered anchor only**: resolve the anchor by walking up to `Perso`/`Pro`. No hardcoded absolute path. No anchor found → report it and offer to treat the target as a managed root.
- **Cache is regenerable**: it accelerates navigation; the disk is the source of truth. Never trust the cache over the actual files — re-scan on doubt.
- **Invariants vs drift**: enforce I1–I4 (see reference); treat everything else as soft drift judged against the domain's learned convention.
- **Never destructive** (`fix`/`sort`): only rename/move, always after a dry-run preview and explicit confirmation. Never delete user content; never overwrite an existing destination — flag the collision instead. (See `delete-safety`.)
- **Learn, don't impose**: when a domain diverges from the default pattern, record its effective convention in the cache rather than forcing it back.
- `index` and `check` never modify user content; `index` only writes derived caches (`_tree/cache.json` and per-domain `R/bank.yml`).
- **`R/bank.yml` is a cache, not curation.** `index` derives `id`/`kind`/`path` from scanning `R/_savoir/`, and a best-effort `summary` from each file's heading. It is **merge, not clobber**: existing curated `summary` text is preserved; new resources are added; vanished ones are flagged. It is consumed by `obsidian:brief`, never by `writing`.

## External data

- `${CLAUDE_PLUGIN_ROOT}/references/tree-convention.md` — invariants, default pattern, cache format, anchor resolution.
- `<anchor>/_tree/cache.json` — the navigation cache `tree` maintains.
- `R/bank.yml` — per-domain resource manifest `tree` maintains; format in `obsidian:brief`'s `references/bank-yml.md`. Consumed by `brief`.
