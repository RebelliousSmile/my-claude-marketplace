# PHP delivery scenarios

| Scenario | Expected behavior |
| --- | --- |
| WordPress local | Reuse wp-env wrappers and never reset, destroy or import. |
| WordPress code release | Exclude uploads, database and secrets unless another explicit operation is selected. |
| Ambiguous sync | Ask for code/database/content/media scope and run no remote command. |
| Database push | Require backup, dry-run/review, confirmation, proof and recovery. |
| Existing Composer deployment | Preserve custom targets behind the Composer facade; create no concurrent script. |
| Existing pnpm plus PowerShell WordPress deployment | Preserve pnpm as the root facade and PowerShell as its owner; do not create `composer.json` solely for deployment. |
| Capable host and restricted host | Select from verified target capabilities independently; do not impose the restricted host's transport on the capable host. |
| Laravel/Symfony | Use native migrations and keep them distinct from content copying. |
| Missing overcode deploy | Stop automata and write no fallback. |
| WordPress staging mirror | Diff database/content/media from local, skip unchanged uploads and gate deletions behind backup, preview and confirmation. |
| WordPress production | Release code and safe migrations only; preserve remote database, editorial content and uploads. |
| Unreliable media inventory | Refuse sync without falling back to a complete archive. |
| Composite multi-target | Keep one PHP-owned root facade; JS/CSS contribute bounded scopes and overcode owns only provider envelopes. |
