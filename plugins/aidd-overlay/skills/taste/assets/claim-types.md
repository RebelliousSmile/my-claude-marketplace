# Claim Types — assess-doc

Reference catalogue of verifiable claim types extracted from `.md` files.

## File and path claims

| Pattern | Example | Verification method |
|---------|---------|---------------------|
| Absolute or relative file path | `src/components/Auth.vue`, `./utils/format.ts` | File exists at path |
| Directory path | `aidd_docs/memory/` | Directory exists |
| Line number reference | `Auth.vue:42` | File exists AND line count ≥ 42 |

## Code symbol claims

| Pattern | Example | Verification method |
|---------|---------|---------------------|
| Function name | `useAuth()`, `formatDate` | `rg -n "function\|const\|def" <codebase> \| grep <name>` |
| Class name | `UserService`, `AuthController` | Same as function |
| Component name (Vue/React) | `<AuthForm>`, `LoginButton` | Grep in component files |
| Method name | `.signIn()`, `->create()` | Grep in codebase |
| Constant / export name | `AUTH_COOKIE_NAME`, `DEFAULT_TIMEOUT` | Grep in codebase |
| CSS class or variable | `.btn-primary`, `--color-primary` | Grep in style files |

## Version and dependency claims

| Pattern | Example | Verification method |
|---------|---------|---------------------|
| Package version | `firebase@10.x`, `vue 3.4` | Compare with `package.json` / `composer.json` |
| Node / PHP / Python version | `Node 20`, `PHP 8.3` | Compare with `.nvmrc`, `composer.json`, `pyproject.toml` |

## VCS and tracker claims

| Pattern | Example | Verification method |
|---------|---------|---------------------|
| Branch name | `feature/auth-refactor` | `git branch -a \| grep <branch>` |
| Issue / PR number | `#42`, `PR #108` | `gh issue view <n>` or `glab issue view <n>` (skip if CLI absent) |
| Commit hash | `a3f9c12` | `git log --oneline \| grep <hash>` |

## Normative document references

| Pattern | Example | Verification method |
|---------|---------|---------------------|
| ADR / DEC reference | `DEC-042`, `ADR-007` | File exists in `aidd_docs/internal/decisions/` or equivalent |
| Rule file reference | `1-normative-vs-archive.md` | File exists in `.claude/rules/` |
| Memory file reference | `architecture.md` | File exists in `aidd_docs/memory/` |

## Command and skill references

| Pattern | Example | Verification method |
|---------|---------|---------------------|
| Slash command / skill name | `/harvest`, `/taste`, `/end-plan` | Skill exists in any loaded plugin's `skills/` directory |
| CLI command | `gh`, `glab`, `bru` | Command available in PATH (`which <cmd>`) |

## Markdown hyperlinks

Applies to **relative** links only. External URLs (`http://`, `https://`, `ftp://`) are excluded.

| Pattern | Example | Verification method |
|---------|---------|---------------------|
| Relative Markdown link | `[Guide](../docs/guide.md)` | Resolve path relative to the file's directory; check that the target file exists |
| Relative link without extension | `[README](./README)` | Try appending `.md`, `.txt`, none; check that one of the candidates exists |
| Anchor-only link | `[Section](#heading)` | Skip — heading anchors are not verified |

## Release artifact references

Applies only in decision document context (see `@decision-doc.md`).

| Pattern | Example | Verification method |
|---------|---------|---------------------|
| Platform artifact | `.apk`, `.exe`, `.dmg`, `.AppImage` | `gh release list --json tagName,assets \| jq '.[].assets[].name'` |
| Feature keyword in release | service name, module name | Same as above, keyword match |

## Exclusions

Do NOT attempt to verify:
- Conceptual or explanatory statements ("Auth is handled via JWT")
- Rationale and opinion ("We chose Prisma because…")
- Future intent ("We will migrate to…") — phrased as `(nouveau)`, `(à créer)`, `TODO`, `will`, `à venir`
- External URLs (`http://`, `https://`, `ftp://`) — too volatile; skip unless explicitly asked
- Anchor-only Markdown links (`#heading`)
