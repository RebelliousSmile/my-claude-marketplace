# Context Map — foresee

Defines the mandatory adjacent context to read for each artifact type before scoring. Never score in isolation.

---

## analyze-doc

| Document type | Mandatory context to load |
|---|---|
| **Plan** (`.md` in `aidd_docs/tasks/`) | Linked issue or user story (via `issue_number:` frontmatter or filename). Relevant codebase section mentioned in the plan. Active project rules in `.claude/rules/`. Memory files referenced. |
| **Skill** (SKILL.md) | All action files in `actions/`. Assets in `assets/`. References in `references/`. evals/scenarios.json if present. The plugin's `plugin.json` description. |
| **Skill action file** (`actions/*.md`) | The parent SKILL.md. Sibling action files (for duplication and dependency). Referenced assets and references via `@` paths. |
| **Rule file** (`.claude/rules/`) | Sibling rules in the same category. The `1-normative-vs-archive.md` rule if present (normative-load standard). Memory files in `aidd_docs/memory/` that the rule governs. |
| **Brainstorm** (inline or file) | Related tasks or plans in `aidd_docs/tasks/`. Applicable project rules. Relevant codebase section if the brainstorm targets one. |
| **Issue / PR** (GitHub / GitLab) | Issue body and all comments. Associated branch if present (`git branch -a`). Related open issues (linked or same milestone). Codebase section mentioned. |

---

## analyze-code

| Target type | Mandatory context to load |
|---|---|
| **Single file** | Files that import or call the target (grep for the target's export names). Associated test file (same name with `.test.` or `.spec.` suffix, or in `__tests__/`). Project rules in `.claude/rules/` whose `paths:` match the file. Memory section related to the file's domain. |
| **Directory / module** | Entry point (`index.ts`, `index.php`, `mod.rs`, `__init__.py`). All files that import from this directory (grep the directory name as an import path). Test directory (`__tests__/`, `tests/`, `spec/`). Applicable project rules. |
| **Informal description** | Locate the relevant files first (grep for the described concept). Then apply Single file or Directory rules above. |

**Always check:**
- Is there a corresponding entry in `aidd_docs/memory/` for the domain (architecture, backend_communication, database, etc.)?
- Do any active rules in `.claude/rules/` constrain this code's surface?

---

## analyze-dep

| Target type | Mandatory context to load |
|---|---|
| **Single package** | Project manifest (`package.json` / `composer.json` / etc.) for pinned version. All codebase files importing the package (measure usage surface). Package metadata (via CLI — see `03-analyze-dep.md`). `aidd_docs/memory/architecture.md` for stack decisions involving this package. |
| **Manifest (all deps)** | Full manifest. `package-lock.json` / `composer.lock` / `Cargo.lock` for exact resolved versions and transitive depth. Any prior `npm audit` / `composer audit` output in `aidd_docs/`. Memory files mentioning the dependency stack. |

---

## Depth heuristic

Limit context loading to avoid analysis paralysis:
- Read at most **10 adjacent files** for single-file and single-package targets.
- For directories: read entry point + up to **5 most-imported files** (by grep hit count).
- For manifests: full profile for the top **10 riskiest packages** only; summary for the rest.
