---
name: taste
description: >-
  Assess repository-backed Markdown freshness, route narrow code checks to AIDD, or judge whether a bounded product/code target should be added minimally, retained, simplified, merged, or removed. Use for outdated docs/code, feature bloat, over-engineering, or code-volume reduction. Do NOT use to implement findings or maintain a parallel code scanner.
author: François-Xavier Guillois
version: 5.5.0
vibe_version: ">=1.0.0"
permissions:
  - bash
tags:
  - productivity
  - workflow
  - automation
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

# Taste

Keeps repository-backed document freshness and product/code sobriety native. Specialist code evidence delegates to current AIDD authorities; Taste owns the final value-and-volume verdict.

## Available actions

| #  | Action        | Role                                                               | Input                              |
|----|---------------|--------------------------------------------------------------------|------------------------------------|
| 01 | `assess-doc`  | Weight and verify Markdown claims against repository evidence; delegate external facts separately | File path, or bounded scan if omitted |
| 02 | `assess-code` | Route code freshness, dependency, or runnable-resolution concerns to AIDD | File or directory path (required) |
| 03 | `assess-sobriety` | Judge whether a bounded product/code target is present in the right amount, using AIDD evidence | Repository, module, diff, or completed feature (required) |

## Default flow

Dispatch on explicit intent first, then file extension (or absence of argument):
- Explicit lightness, bloat, unnecessary-feature, over-engineering, removal, merge, or code-volume intent → `assess-sobriety`; without a bounded target, ask once before any work
- No argument OR `.md` / `.markdown` path → `assess-doc`
- Any code file extension (`.ts`, `.js`, `.vue`, `.php`, `.py`, etc.) → `assess-code`

## Harvest integration

`harvest` invokes taste as a dedicated phase via `@../taste/SKILL.md`. Taste returns aggregated document-verdict metrics; an explicitly requested code branch returns the delegated AIDD report and receipt instead of legacy detector counts.

## Delegation

Read [the AIDD delegation contract](../../references/aidd-delegation.md) before `assess-code`, `assess-sobriety`, or external fact verification. Delegated reports remain authoritative; Taste returns receipts and never restores a local code detector when AIDD is unavailable.

## Transversal rules

- Extract only claims that are explicitly stated — never infer.
- Skip issue-status checks when no tracker CLI is detectable.
- Never modify the assessed document, project source, tests, configuration, product data, or documentation during assessment. Disclose contract-required AIDD report artifacts under receipt `writes`.
- Resolve the active rule sources from host portability: `AGENTS.md` plus `.agents/rules/` on Codex, `.claude/rules/` on Claude Code, or their union in a dual-host project. Skip the rule-violation check silently only when none exists.
- Verdicts use weighted local evidence: **Current** (≥80%), **Partial** (20–79%), **Obsolete** (<20%), **Superseded** (subject-matched replacement after ≥80%), or **N/A** (no eligible local claim). A critical obsolete claim vetoes Current and Superseded.
- Scan at most 25 documents by default and report unscanned coverage. Git history prioritizes work but never proves obsolescence.
