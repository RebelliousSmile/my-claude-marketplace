---
name: changelog
model: haiku
description: Generates or updates CHANGELOG.md from git history following the Keep a Changelog format, commits the changelog, and creates a signed annotated tag; also curates an existing changelog by filling undocumented versions and condensing older major cycles into bounded summaries. Use when a user wants to release or document changes: "generate changelog", "update CHANGELOG", "release v1.2.0", "tag this version", "what changed since last release", "combler les trous du changelog", "résumer les anciennes versions", "le CHANGELOG est trop long". Do NOT use for writing release notes in a format other than Keep a Changelog, managing GitHub Releases UI, or bumping version numbers in package.json or Cargo.toml — this skill only manages CHANGELOG.md and git tags.
---

# Changelog

Changelog reads the git log since the last tag, groups commits by Keep a Changelog category, prepends a new version section to `CHANGELOG.md`, commits the file, and creates an annotated tag. A second action maintains the file over time: it fills the versions that were never documented and condenses the closed major cycles so the changelog stays readable.

## Available actions

| #  | Action     | Role                                                                 | Input                                               |
|----|------------|----------------------------------------------------------------------|-----------------------------------------------------|
| 01 | `generate` | Gather commits → group → write CHANGELOG.md → commit → tag         | Version string (`$ARGUMENTS`, optional)             |
| 02 | `curate`   | Fill undocumented versions → condense older majors (≤ 20 items each) → commit | Existing `CHANGELOG.md`                  |

## Default flow

Dispatch on the trigger:

| Situation | Action |
|---|---|
| Release, tag, "what changed since last release", `/changelog` on a repo with commits to release | `generate` |
| "combler les trous", "le CHANGELOG est trop long", "résume les anciennes versions", maintenance pass | `curate` |
| No `CHANGELOG.md` at all | `generate` (`curate` never creates the file) |
| Release requested on a file with known holes | `generate` first, then propose `curate` |

## Transversal rules

- Follow [Keep a Changelog](https://keepachangelog.com) format strictly: sections Added / Changed / Deprecated / Removed / Fixed / Security.
- Skip `chore`, `style`, and `ci` commits unless they are significant (e.g., a major CI overhaul).
- Most recent version section must appear at the top of `CHANGELOG.md`.
- Dates must use `YYYY-MM-DD` format.
- Prepend to existing `CHANGELOG.md`; never overwrite the full file.
- Semver bump rules: `feat` → minor, `fix` → patch, `BREAKING CHANGE` footer → major.
- Never invent a version, a date, or an entry: everything comes from the existing file or from git. What neither provides is reported as unrecoverable, not filled in.
- Condensing is bounded: **20 items maximum** per summarized major cycle, all categories combined, and breaking changes are never among the items dropped.
- A summary always carries the git range that holds the detail — condensation compacts the file, it never loses the history.
- `generate` tags; `curate` never does.

## External data

- `aidd_docs/templates/vcs/commit.md` — commit message conventions for this project
