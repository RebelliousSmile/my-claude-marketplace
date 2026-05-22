---
name: changelog
model: haiku
description: Generates or updates CHANGELOG.md from git history following the Keep a Changelog format, commits the changelog, and creates a signed annotated tag. Use when a user wants to release or document changes: "generate changelog", "update CHANGELOG", "release v1.2.0", "tag this version", "what changed since last release". Do NOT use for writing release notes in a format other than Keep a Changelog, managing GitHub Releases UI, or bumping version numbers in package.json or Cargo.toml — this skill only manages CHANGELOG.md and git tags.
---

# Changelog

Changelog reads the git log since the last tag, groups commits by Keep a Changelog category, prepends a new version section to `CHANGELOG.md`, commits the file, and creates an annotated tag.

## Available actions

| #  | Action     | Role                                                                 | Input                                               |
|----|------------|----------------------------------------------------------------------|-----------------------------------------------------|
| 01 | `generate` | Gather commits → group → write CHANGELOG.md → commit → tag         | Version string (`$ARGUMENTS`, optional)             |

## Default flow

Single action. Dispatch to `generate` on any trigger.

## Transversal rules

- Follow [Keep a Changelog](https://keepachangelog.com) format strictly: sections Added / Changed / Deprecated / Removed / Fixed / Security.
- Skip `chore`, `style`, and `ci` commits unless they are significant (e.g., a major CI overhaul).
- Most recent version section must appear at the top of `CHANGELOG.md`.
- Dates must use `YYYY-MM-DD` format.
- Prepend to existing `CHANGELOG.md`; never overwrite the full file.
- Semver bump rules: `feat` → minor, `fix` → patch, `BREAKING CHANGE` footer → major.

## External data

- `aidd_docs/templates/vcs/commit.md` — commit message conventions for this project
