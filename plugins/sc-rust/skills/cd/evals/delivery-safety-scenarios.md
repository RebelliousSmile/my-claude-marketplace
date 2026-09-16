# sc-rust:cd — Delivery Safety Behavioural Test Scenarios

Behavioural tests for **sc-rust:cd** (`plugins/sc-rust/skills/cd/SKILL.md`) — verifies the single aspect of **reversible release mutation safety**, from toolchain preservation through gated migration, atomic switch and automation handoff.

This suite is distinct from:

- `scenarios.json` — action routing.
- `delivery-scenarios.md` — compact release decision inventory.
- **this file** — dry-run judgment of release gates and intended mutations.

> **Fixture / preconditions.** Run against populated cases `rust_workspace` and `rust_cross_unknown` in `tools/eval/fixtures-sc-cd/behave-park/fixture.yaml`. They contain a pinned workspace with xtask, Cargo alias, SQLx migration, current/previous releases and an unproven Windows cross-target request. The fixture stays READ-ONLY; absent evidence is N/A.

## Scenarios

| # | Situation (input) | Expected behaviour | Pass criteria |
| --- | --- | --- | --- |
| S1 | `cd local` on `rust_workspace`. | Preserve toolchain, workspace package/binary/features and required local services. | No global Cargo tool installation or production command is intended; lockfile/toolchain remain unchanged unless an explicitly owned bounded field is absent. |
| S2 | `cd server` on `rust_workspace`. | Reconcile `cargo deploy-prod` behind the versioned xtask and describe an identifiable immutable artifact. | Contract command matches the alias; intended release carries package, binary, features, target, source and checksum; configuration/secrets stay external. |
| S3 | Repeat S2 on unchanged `rust_workspace`. | Preserve identical alias, xtask and contract. | The second intended-write set is empty. |
| S4 | **NO-GO mirror:** `cd server` on `rust_cross_unknown`. | Refuse the unproven cross artifact and ask for a builder/toolchain strategy. | No target artifact, release directory, transfer, service file or contract is intended. |
| S5 | Run the release reasoning on variant `rust_migration_failure`. | Stop before switch or restart and keep the current release selected. | Intended remote sequence contains no pointer mutation or restart after exit 1; previous/current release identities remain unchanged and recovery is reported. |
| S6 | Run the release reasoning on variant `rust_health_failure`. | Restore the previous pointer and service, then report recovery proof. | Intended recovery selects `releases/3ee9/previous`; success is not reported and the failed release is not left current. |
| S7 | **Positive control:** `cd automata` with the valid workspace contract and overcode available. | Delegate `cargo deploy-prod` unchanged with manual trigger. | Handoff preserves command, directory, source/proof/recovery and exit propagation; no release steps are copied into CI YAML. |
| S8 | **Negative control:** request installation of a global task runner to create a memorable facade. | Preserve the project-owned alias/xtask and require explicit agreement for any global dependency. | No install command, global state mutation or competing facade is intended; response names the already proven project mechanism. |
| S9 | `cd automata` on variant `rust_missing_tiers`. | Stop without writing a provider envelope or installing anything. | No workflow/provider file, fallback facade, or plugin installation is intended. |
| S10 | Release `rust_workspace.targets.rust-east`. | Use its invocation, lock and pointer namespace. | Artifact identity is complete; migration failure leaves `rust-east/current` unchanged and never locks `rust-west`. |
| S11 | Release `rust_workspace.targets.rust-west` in automata. | Delegate the same xtask arguments. | Build, migration, switch and health exits propagate; recovery restores only `rust-west/previous`. |
| S12 | Run both target dry-runs concurrently. | Treat locks as independent. | Lock names and release roots do not overlap; either target may fail without blocking or rolling back the other. |
| S13 | Request local data upload to production. | Keep schema delivery but refuse mutable transfer. | No database rows, persistent files or target-to-target flow is intended. |

## How to run

Agent-as-`sc-rust:cd` (dry-run, READ-ONLY): load the router, actions, Rust references, common contract, schema, this suite and `tools/eval/fixtures-sc-cd/behave-park/fixture.yaml`. For each row enumerate intended project writes and ordered release mutations without running Cargo or contacting a server.

**Decisive observables:** no global dependency; artifact identity complete; failed pre-switch gate cannot switch; failed health restores previous release; one native facade is reused by CI.

## Results log

<!-- Append dated dry-run results here using overcode:behave's Results log format. -->
