---
name: harvest
description: Global or pillar-targeted maintenance skill — runs all Harvest work by default, or only tracker, normative, cleanup, freshness, or remaining-artifact review with required dependencies
author: François-Xavier Guillois
version: 4.7.0
vibe_version: ">=1.0.0"
permissions:
  - files
  - bash
tags:
  - collection
  - workflow
  - automation
  - productivity
  - data-mining
---

Read [host portability](../../references/host-portability.md) before resolving plugin files, invoking sibling skills, or persisting project guidance.

# Harvest

Maintains `aidd_docs/tasks/` and `aidd_docs/backlog/`: tracker state, durable decisions, completed-plan cleanup, documentation and code freshness, and remaining task artifacts.

## Available actions

| # | Action | Role | Input |
|---|---|---|---|
| 01 | `inventory` | Detect only the host state and artifacts required by the selected route | `all`, `tracker`, `cleanup`, `freshness`, or `review` scope |
| 02 | `tracker` | Read tracker status or reconcile completed plans | `status-only` or `reconcile` mode |
| 03 | `normative` | Delegate durable memory and rule reconciliation | requested or dependency mode |
| 04 | `cleanup` | Protect learning, then purge eligible completed artifacts | scoped inventory + tracker + normative results |
| 05 | `freshness` | Delegate documentation and source freshness assessment | freshness-scoped discovery |
| 06 | `review` | Review and arbitrate every remaining artifact | review-scoped inventory + tracker status |
| 07 | `report` | Persist the complete Harvest report | all pillar metrics |
| 08 | `all` | Run the complete maintenance workflow | optional configuration overrides |

## Default flow

Parse arguments before reading any action file or accessing the project:

- supported selectors: `all`, `tracker`, `normative`, `cleanup`, `freshness`, `review`;
- no selector, including configuration-only input, routes to `all` without asking;
- exactly one selector routes to its exact action;
- an unknown bare token, unknown configuration key, malformed value, or more than one selector stops before work and lists the valid selectors and configuration keys.

Routes and dependency closure:

| Selected | Run in order |
|---|---|
| `all` | `inventory(all) → tracker(reconcile) → normative → cleanup → freshness → review → report` |
| `tracker` | `inventory(tracker) → tracker(reconcile)` |
| `normative` | `normative` |
| `cleanup` | `inventory(cleanup) → tracker(reconcile) → normative → cleanup` |
| `freshness` | `inventory(freshness) → freshness` |
| `review` | `inventory(review) → tracker(status-only) → review` |

Read [the pillar contract](references/pillar-contract.md), then only the selected action, required dependency actions, and references they explicitly request. Never read unrelated action or pillar-reference files. Reuse the execution context and every completed result.

## Configuration

| Parameter | Default | Description |
|---|---:|---|
| `plan_warn_days` | 14 | Age above which an active plan is flagged |
| `plan_stale_days` | 60 | Age above which an active plan is proposed for deletion |
| `audit_stale_days` | 90 | Age above which an audit or non-plan output is flagged |
| `rule_elevation_threshold` | 3 | Decisions on one topic needed to propose rule elevation |

Use a supplied `key=value` instead of its default. Values are positive integers. Reject unknown keys and malformed values before work.

## Transversal rules

- Never close a tracker item without showing the closing comment and waiting for confirmation.
- Never delete files without explicit confirmation. Enumerate files; never recursively delete a feature directory.
- Use only the tracker CLI detected by inventory, never MCP.
- Adapt shell commands to the OS detected once by inventory.
- A feature lifecycle comes only from direct `plan.md` frontmatter, never a filename suffix or phase contents.
- Normative reconciliation must complete before cleanup can purge completed work.
- Product artifacts outside backlog stories are reported only and never purged.
- A targeted run develops only the selected pillar, then briefly reports its dependencies; it never writes the global Harvest report.

## Evals

- `evals/plan-layout-scenarios.md`
- `evals/aidd-artifact-scenarios.md`
- `evals/pillar-routing-scenarios.md`
