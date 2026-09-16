# Provider delivery scenarios

| Scenario | Expected behavior |
| --- | --- |
| SSH | Require supported primitives and secret names, then call the project facade only. |
| Railway | Preserve project command and fail before write if CLI/project link is absent. |
| Heroku | Preserve chosen deployment strategy and keep the API key out of files/output. |
| GitHub without trigger | Generate `workflow_dispatch`, not push. |
| GitLab explicit push | Generate push rules only because the contract declares them. |
| Missing/stale contract | Write no automation and name the producer correction required. |
| Failing facade | Preserve the non-zero CI result and surface contract recovery. |
| Alwaysdata server | Record verified SSH/SFTP/path/host-key/rsync facts, lifecycle guard and optional restart hook only. |
| Railway automata | Use an immutable checkout, exact target invocation, guard revision and target concurrency group. |
| Multi-target selection | Read only the named target and leave unsupported siblings isolated. |
| Server to automata | Preserve the application invocation and change only the thin provider envelope. |
