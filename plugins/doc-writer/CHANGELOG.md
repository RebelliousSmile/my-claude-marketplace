# Changelog — doc-writer

## [0.1.0] — 2026-05-29

Initial release. Professional documentation authoring, three skills.

### Skills

- **`user-guide`** — end-user documentation (manuals, getting-started, how-to, troubleshooting, FAQ), task-oriented and plain-language. The subject is given up front via `$ARGUMENTS`. `outline → write → review`.
- **`technical-document`** — developer/operator docs (architecture, API reference, integration guide, runbook, design note), with a per-type structure and verification of examples/links/claims against the codebase. The subject is given up front via `$ARGUMENTS`. `scope → write → verify`.
- **`specification`** — project/product specification ("cahier des charges"): objectives, explicit scope in/out, functional and non-functional requirements (unique ID + MoSCoW priority + acceptance criterion), deliverables, constraints, planning, with an adversarial challenge pass for testability and completeness. `draft` starts from a fillable French template (`references/spec-template.md`). `elicit → draft → challenge`.

### Conventions

- Shared documentation ethos in `references/doc-principles.md`, referenced by all skills via `${CLAUDE_PLUGIN_ROOT}`.
- Scoped to professional docs — distinct from the `writing` plugin (narrative) and `aidd-overlay:readme` (repository READMEs).
