# Action 09 — gitit

Fires the pre-crafted prompt that turns a directory into a fully synced, versioned
git repository in one shot: **init local → ensure GitHub remote (gh) → commit →
pull → push → semantic version tag (only if something was pushed)**.

## Context required

- **`R`** — the target directory. Argument if provided, otherwise the current working directory (CWD). Idempotent: every step is a no-op when its precondition is already met.
- `gh` CLI installed and authenticated (`gh auth status`). If not authenticated, stop and ask the user to run `gh auth login` (suggest `! gh auth login`).
- **Visibility is `private` by default — always.** A repo is **never** created public unless the user explicitly passes `--public`. If anything is ambiguous, default to `private`.
- **Remote creation may be blocked** (missing `repo`/`create` scope, org/SSO policy, sandbox, no network). The workflow must degrade gracefully: the local commit is always preserved, and pull/push/version are skipped rather than failing the whole run.

## Prompt

Execute the following workflow verbatim. Every step is **idempotent** — check the precondition first and skip silently if already satisfied.

### Step 0 — Resolve target

Resolve `R` from `$ARGUMENTS` (a path), else `R = CWD`. `cd` into `R`. Record `repo_name = basename(R)` (kebab-case it if needed). Detect `visibility` (`private` default, `public` if `--public` passed).

### Step 1 — Local repo (init if absent)

Run `git rev-parse --is-inside-work-tree` (in `R`, non-recursive: verify the repo root is `R`, not a parent — compare `git rev-parse --show-toplevel` to `R`).
- If `R` is **not** a git repo root → `git init` in `R`, then `git branch -M main`.
- If `R` is already a repo → skip.

### Step 2 — Commit

Stage everything (`git add -A`) and commit **only if there is something to commit** (`git status --porcelain` non-empty). Use a conventional message:
- First commit of a new repo → `chore: initial commit`.
- Otherwise summarise the actual changes (`feat:`/`fix:`/`docs:`/`chore:` …).

If the working tree is clean and at least one commit already exists → skip.

### Step 3 — Ensure GitHub remote (gh)

Set `remote_ok = false`. Check `git remote get-url origin`.
- **If `origin` exists** → `remote_ok = true`, skip creation.
- **If no `origin`**:
  1. Confirm auth first: `gh auth status`. If it fails → report "remote skipped: gh not authenticated", leave `remote_ok = false`, and **do not** treat it as a fatal error.
  2. Check whether the remote repo already exists: `gh repo view "<owner>/<repo_name>"` (owner = `gh api user -q .login`).
  3. **If it exists** → link it: `git remote add origin "$(gh repo view <owner>/<repo_name> --json sshUrl -q .sshUrl)"` → `remote_ok = true`.
  4. **If it does not exist** → create it **private** (never public unless `--public` was passed), without pushing yet:
     `gh repo create "<repo_name>" --private --source=. --remote=origin` (use `--public` **only** if explicitly requested).
     - On **success** → `remote_ok = true`.
     - On **failure** (creation blocked: scope/SSO/policy/sandbox/network) → **do not abort**. Set `remote_ok = false`, capture the gh error, and report: *"Création du dépôt distant bloquée (`<raison>`). Le commit local est en place. Crée le dépôt manuellement (`! gh repo create <repo_name> --private --source=. --remote=origin`) puis relance `gitit`."* Continue to Step 7 (skip 4–6).

> **Garde-fou privé** : si pour une raison quelconque la visibilité ne peut pas être garantie `private`, **ne pas créer** le dépôt — signaler plutôt que risquer un dépôt public.

### Step 4 — Pull (guarded) — *only if `remote_ok`*

Skip this step entirely if `remote_ok = false`. Otherwise, pull only when safe:
- If `origin` has the branch (`git ls-remote --heads origin main` non-empty) **and** an upstream is set → `git pull --rebase origin main`. On conflict, stop and ask the user to resolve.
- If the remote branch does not exist yet (fresh repo) → skip (nothing to pull).

### Step 5 — Push — *only if `remote_ok`*

Skip if `remote_ok = false` (report "push skipped: no remote"). Otherwise `git push -u origin main` (sets upstream on first push). Record `pushed = true` if the push transferred at least one commit (new remote `HEAD`); `pushed = false` if everything was already up to date.

### Step 6 — Semantic version (only if pushed)

**Skip entirely if `remote_ok = false` or `pushed = false`.** If `pushed = true`, apply SemVer via an **annotated tag**:

- If the repo tracks a `CHANGELOG.md` (or is an aidd plugin/marketplace) → invoke `/aidd-overlay:changelog` (it writes the changelog, commits it, creates the annotated tag) then `git push --follow-tags`.
- Otherwise, tag directly:
  - Find the latest semver tag: `git tag --list 'v*' --sort=-v:refname | head -1`.
  - **No prior tag** → new tag `v0.1.0`.
  - **Prior tag `vX.Y.Z`** → bump from conventional commits since it: any `BREAKING CHANGE`/`!` → major (`v(X+1).0.0`); else any `feat` → minor (`vX.(Y+1).0`); else → patch (`vX.Y.(Z+1)`).
  - `git tag -a <new_tag> -m "<new_tag>"` then `git push --follow-tags`.

### Step 7 — Report

| Field | Value |
|---|---|
| Target `R` | `<path>` |
| Local repo | `created` or `existing` |
| Commit | `<sha> <message>` or `— (clean)` |
| Remote | `created private` / `linked existing` / `existing origin` / `⚠ blocked (<raison>)` |
| Pull | `rebased` / `skipped (fresh)` / `skipped (no remote)` / `up to date` |
| Push | `<n> commit(s)` / `up to date` / `skipped (no remote)` |
| Version | `<tag>` pushed or `— (nothing pushed)` |
