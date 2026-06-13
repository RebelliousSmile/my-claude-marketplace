# 01 - Index

Scan the real arborescence and build/refresh the navigation cache `<anchor>/_tree/cache.json`. This is the foundation the other actions read.

> Read `${CLAUDE_PLUGIN_ROOT}/references/tree-convention.md` first. Local paths only — discover the anchor, never hardcode it.

## Inputs

- `<target>` (optional, positional) — where to start. Default: current working directory.

## Process

1. **Resolve the anchor.** From `<target>`, walk up parents until a `Perso` or `Pro` segment. That directory is the anchor.
   - No anchor found → report it; offer to treat `<target>` as a managed root (`_tree/` will be created there if the user agrees).
2. **Scan** the subtree under the anchor (depth-first, skip `_tree/` itself and VCS dirs like `.git`).
3. **Infer each domain's effective convention.** For every `subcategory` (domain), look at what exists:
   - Is it dated (`AAAA/MM/...`) or flat? Record `dated` + the observed `convention` string.
   - List its work `units` and any durable areas (`_savoir`, other `_`-prefixed domain-level dirs).
4. **Collect invariant anomalies** (I1–I4): working dirs missing `_`, prefixed content inside a working dir, non-portable slugs (spaces/accents/uppercase in free segments), malformed dates.
5. **Collect `unsorted`**: paths that sit outside any recognised domain pattern (loose files/dirs that `sort` could place).
6. **Write `<anchor>/_tree/cache.json`** per the reference's shape. Use the current date (from the session context) for `scanned_at`. Create `_tree/` if absent.
7. **Refresh each domain's `R/bank.yml`** (resource manifest, consumed by `obsidian:brief`): for every domain that has a `_savoir/`, scan it and write/update `R/bank.yml` — derive `id`/`kind`/`path` from the files, and a best-effort `summary` from each file's title/first lines. **Merge, do not clobber**: preserve any existing curated `summary`, add new resources, flag vanished ones. Format: see `obsidian:brief`'s `references/bank-yml.md`. (No `_savoir/` → no `bank.yml` for that domain.)
8. Print a short summary: anchor, # domains, # units, # anomalies, # unsorted, # bank.yml refreshed.

## Output (cache shape)

See `${CLAUDE_PLUGIN_ROOT}/references/tree-convention.md` › "Le cache". Key fields: `root`, `scanned_at`, `default_pattern`, `domains[]` (`path`, `dated`, `convention`, `units`, `durable`, `notes`), `anomalies[]`, `unsorted[]`.

## Rules

- `index` writes only **derived caches** — `_tree/cache.json` and per-domain `R/bank.yml`. It **never** moves, renames, or deletes user content.
- `_tree/cache.json` is **descriptive** and **regenerable** — overwrite it wholesale. `R/bank.yml` is also regenerable but **merge-updated** (preserve curated summaries — never clobber).
- Record each domain's **learned** convention; do not force domains onto the default pattern.

## Test

Run `index` on a tree with one dated domain (`Perso/RPG/zombiology/2026/06/test-scenario/_brief/`) carrying a `_savoir/` with two files, and one flat domain. Confirm: `cache.json` is written at the `Perso` anchor; both domains appear with their respective `dated` flag and learned `convention`; `zombiology/bank.yml` is created with one entry per `_savoir/` file (each with a `summary`); a pre-existing curated `summary` in `bank.yml` is preserved on re-run; and no user file was moved, renamed, or deleted.
