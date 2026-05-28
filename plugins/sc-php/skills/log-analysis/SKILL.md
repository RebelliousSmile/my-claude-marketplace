---
name: log-analysis
description: >-
  Analyzes server and PHP logs across three environments: host filesystem (local),
  Docker containers (docker), and remote production server (prod via SSH).
  Works with any PHP project — auto-discovers Docker containers and standard log paths.
  Use when the user says "check logs", "PHP errors", "find in logs", "log summary",
  "500 errors", "server logs", "analyze logs", "what's wrong in prod".
  Do NOT use for application debugging (use aidd-dev:08-debug), DB queries
  (use data-optimize), or performance profiling.
---

# Log Analysis

Inspects PHP and server logs from any environment — local filesystem, Docker containers, or a remote server via SSH. Produces a raw tail, filtered error list, pattern search, or period summary. Works with any PHP project: auto-discovers containers from `docker ps` / `docker-compose.yml` and uses standard PHP/Apache/Nginx log paths as defaults.

## Available actions

| #   | Action          | Role                                              | Input                          |
| --- | --------------- | ------------------------------------------------- | ------------------------------ |
| 01  | `tail`          | Display the last N lines from a log source        | env, source, optional lines    |
| 02  | `parse-errors`  | Extract and group PHP/Apache/Nginx errors         | env, source, optional since    |
| 03  | `search`        | Search for a pattern, status code, or time range  | pattern, optional env, source  |
| 04  | `summarize`     | Period digest: error rate, top errors, 5xx count  | optional env, optional since   |

## Default flow

Non-sequential — dispatch based on user intent:

- "tail / show / last lines / recent logs / check logs" → `tail`
- "errors / PHP errors / warnings / error list" → `parse-errors`
- "find / search / grep / [specific pattern or status code]" → `search`
- "summary / digest / report / stats" → `summarize`
- Env not specified → ask: `local`, `docker`, or `prod`?
- No clear intent → `tail` on `php` + `apache-error`, then offer `parse-errors`

## Transversal rules

- Never print or log SSH credentials, passwords, key paths, hostnames, or tokens that may appear in grepped log lines.
- Always show timestamps in output.
- Truncate individual log lines to 300 chars to avoid flooding context.
- When errors are found, always suggest a likely fix or next investigation step.
- Default `env` is `docker` when Docker is detected in the project; otherwise `local`.
- For `prod`: if no SSH host is configured, ask user for `user@host` before proceeding.

## References

- `references/environments.md` — env detection, standard log paths, SSH config pattern
- `references/log-formats.md` — PHP/Apache/Nginx log line formats and parsing patterns
