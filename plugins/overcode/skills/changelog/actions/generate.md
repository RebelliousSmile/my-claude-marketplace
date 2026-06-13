# 01 - Generate

Gather commits since the last tag, group them by Keep a Changelog category, prepend a new version section to CHANGELOG.md, commit the file, and create an annotated tag.

## Inputs

- `version` (optional, default: auto-detect from commit history) - string, target version e.g. `v1.2.0`; if empty, the version is inferred by applying semver bump rules to the last tag

## Outputs

- `CHANGELOG.md` updated with a new version section prepended at the top.
- A git commit: `chore(release): <version>`.
- An annotated git tag: `<version>` with message `Release <version>`.

## Process

1. **Find last tag**: run `git tag --sort=-version:refname | head -1`. If no tag exists, treat the range as all commits.
2. **List commits**: run `git log <last-tag>..HEAD --pretty="%h %s" --no-merges`. Collect all commit lines.
3. **Determine new version**:
   - If `$ARGUMENTS` is non-empty, use it as the version string (normalize to `v<semver>` if needed).
   - If empty, inspect commits: any `BREAKING CHANGE` footer → major bump; any `feat:` → minor bump; any `fix:` → patch bump. Apply bump to last tag.
4. **Group commits** by Keep a Changelog category:
   - `feat:` → Added
   - `fix:` → Fixed
   - `refactor:`, `perf:` → Changed
   - `deprecate:` → Deprecated
   - `remove:` → Removed
   - `security:` → Security
   - `chore:`, `style:`, `ci:` → skip unless the commit message indicates significance
5. **Read existing CHANGELOG.md** if present; preserve its content.
6. **Write updated CHANGELOG.md**: prepend the new version section in Keep a Changelog format:
   ```
   ## [<version>] - <YYYY-MM-DD>
   ### Added
   - ...
   ### Fixed
   - ...
   ```
   Append the preserved existing content below the new section.
7. **Commit**: `git add CHANGELOG.md && git commit -m "chore(release): <version>"`.
8. **Tag**: `git tag -a <version> -m "Release <version>"`.
9. **Push decision**:
   - If `$ARGUMENTS` contains `push=auto`: run `git push && git push --tags` silently.
   - Otherwise: print a summary of the new section and tag, then ask: "Ready to push? Run `git push && git push --tags` when ready."

## Test

Invoke in a git repository that has at least one commit since the last tag. Verify that `CHANGELOG.md` contains a new version section at the top with the correct date, that a commit named `chore(release): <version>` exists, and that an annotated tag with the version name has been created.
