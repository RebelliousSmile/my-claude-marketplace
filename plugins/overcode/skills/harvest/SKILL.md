---
name: harvest
description: Global maintenance skill — reconciles tracker items with implemented AIDD plans, harvests durable decisions, purges eligible task artifacts, checks freshness, and reviews what remains
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
| 01 | `inventory` | Detect host state and classify Harvest-owned artifacts | execution context |
| 02 | `tracker` | Reconcile completed plans with GitHub, GitLab, Local, or no tracker | inventory |
| 03 | `normative` | Delegate durable memory and rule reconciliation | execution context |
| 04 | `cleanup` | Protect learning, then purge eligible completed artifacts | inventory + tracker + normative results |
| 05 | `freshness` | Delegate documentation and source freshness assessment | detected document and source roots |
| 06 | `review` | Review and arbitrate every remaining artifact | inventory + tracker state |
| 07 | `report` | Persist the complete Harvest report | all pillar metrics |
| 08 | `all` | Run the complete maintenance workflow | optional configuration overrides |

## Default flow

Harvest currently runs `all` for every valid invocation. Configuration arguments are passed to `all`; pillar selection is introduced separately.

`all` runs `inventory → tracker → normative → cleanup → freshness → review → report`. Read an action file immediately before running that action. Reuse the execution context and every completed result; never rerun inventory or a pillar within one invocation.

## Configuration

| Parameter | Default | Description |
|---|---:|---|
| `plan_warn_days` | 14 | Age above which an active plan is flagged |
| `plan_stale_days` | 60 | Age above which an active plan is proposed for deletion |
| `audit_stale_days` | 90 | Age above which an audit or non-plan output is flagged |
| `rule_elevation_threshold` | 3 | Decisions on one topic needed to propose rule elevation |

Use a supplied `key=value` instead of its default. Read [the pillar contract](references/pillar-contract.md) before orchestration.

## Transversal rules

- Never close a tracker item without showing the closing comment and waiting for confirmation.
- Never delete files without explicit confirmation. Enumerate files; never recursively delete a feature directory.
- Use only the tracker CLI detected by inventory, never MCP.
- Adapt shell commands to the OS detected once by inventory.
- A feature lifecycle comes only from direct `plan.md` frontmatter, never a filename suffix or phase contents.
- Normative reconciliation must complete before cleanup can purge completed work.
- Product artifacts outside backlog stories are reported only and never purged.

## Evals

- `evals/plan-layout-scenarios.md`
- `evals/aidd-artifact-scenarios.md`
- `evals/pillar-routing-scenarios.md`
