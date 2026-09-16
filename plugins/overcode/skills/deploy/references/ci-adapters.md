# Thin CI adapters

GitHub Actions and GitLab CI adapters perform only checkout, stack installation, locked dependency installation, provider prerequisites and the exact project command in its exact working directory.

- GitHub: default to `workflow_dispatch`; add a `push` event only for explicit contract `trigger: push`.
- GitLab: default to a manually started deploy job; add push rules only for explicit `trigger: push`.
- Railway/Heroku native automation follows the same manual-default policy where configurable.

Do not append `|| true`, reinterpret status, duplicate migrations or copy the script body into YAML. Environment entries reference declared secret names. Pin actions/images/tool versions according to repository policy. Expose contract source identity and post-delivery proof; keep its recovery instructions visible when the command fails.

For v2, each job or matrix entry names exactly one automata target and checks out its immutable resolved ref. Copy that target's phase, lifecycle revision, invocation and working directory byte-for-byte. Re-read its remote guard before mutation, and use a concurrency group derived from target id so sibling targets remain independent. Refuse dirty workspaces, floating refs, stale guards and non-reproducible manifests before generating or executing the envelope.

The envelope contains no application build, migration, manifest comparison, file synchronization or provider restart implementation; those remain behind the producer facade or bounded provider hook.
