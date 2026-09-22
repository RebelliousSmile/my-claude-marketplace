# SC CD contract

Canonical maintenance source: `tools/sc-cd/contract.md`. This file is copied byte-for-byte to every SC-CD plugin so each plugin remains independently installable.

## Lifecycle and targets

- `local` is the reproducible development runtime. Remote delivery targets are named entries, not implicit environments.
- Every target declares a unique `id`, lifecycle `phase` (`staging` or `production`), execution `mode` (`server` or `automata`), provider, lifecycle revision, remote guard, lock, invocation, and enabled operations.
- A project may own any number of independent targets. A target is never the source of another target and the contract contains no target-to-target relation.
- `server` and `automata` are execution modes, not lifecycle phases. Changing mode preserves the project facade, target arguments, proof, recovery, and exit status.

## Source and execution context

- One root project facade owns every target invocation. Provider files and package-manager aliases never contain a second procedure.
- Delivery is initiated through that facade from either a reviewed workspace or an automation checkout of the same repository and ref.
- An automation checkout requires a clean, immutable ref. A dirty workspace is server-only and requires an explicit dirty-source policy, confirmation, and source manifest.
- Every mutation verifies the target's current phase and lifecycle revision against its non-secret remote guard before doing work.

## Surfaces and authority

- Surfaces are named `code`, `schema`, `data`, or `media`.
- `code` and `schema` are local-authoritative in staging and production.
- `data` and user `media` are local-authoritative in staging and target-authoritative in production.
- Versioned images, fonts, and other build inputs belong to `code`, not user `media`.
- Only `deploy:*` operations are public. A CD contract does not model production-to-local or target-to-target synchronization.
- Production targets never enable local-to-target `data` or `media` replacement. Migrations operate on `schema` and do not imply mutable-data copy.

## Differential synchronization

- Staging data or media mirrors require an explicit scope, stable dry-run, content inventory, deletion preview, confirmation, backup, proof, and recovery.
- Unchanged content is skipped by content identity. A target without a reliable inventory and integrity proof is unsupported; it never falls back silently to a complete archive.
- Transfers use temporary destinations, safe resume, final integrity verification, and a per-target mutation lock.

## Promotion

- In-place staging-to-production promotion requires both a delivery lock and proven application-write quiescence. Without quiescence, use a new target.
- Promotion is fail-closed: quiesce, back up, run and prove the final mirror, confirm, increment the remote lifecycle guard to production, update the local contract, regenerate envelopes, prove old envelopes fail, leave quiescence, and unlock.
- Lifecycle revision never decreases. After the remote guard changes, no recovery path may re-enable an older staging envelope.

## Reconciliation and safety

- Detect before writing, preserve user-owned commands, update only bounded generated regions, and produce no diff on a second unchanged run.
- Never store secret values in versioned configuration. Contracts declare secret names only.
- Display target, source identity, dirty state, phase, lifecycle revision, operation, and surface before mutation.
- Every operation declares preconditions, observable proof, recovery, and lock. Database replacement or destructive staging mirror also requires a fresh backup and explicit confirmation.
- Setup, fixtures, validation, and dry-runs never contact a real target.

## Automation

- Automation requires a valid version 2 `deploy/contract.json`, a clean materializable source ref, and a matching remote lifecycle guard.
- The default trigger is manual. Push is emitted only per target when explicitly requested.
- Provider envelopes install prerequisites and invoke the exact target command. They preserve nonzero status and contain no application, migration, inventory, or synchronization logic.
- Missing provider support, stale lifecycle state, or a missing `overcode:deploy` capability stops without writing a fallback workflow.
