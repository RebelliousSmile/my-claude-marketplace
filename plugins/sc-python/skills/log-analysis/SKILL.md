---
name: log-analysis
description: >-
  Analyzes Python application logs across three environments: host filesystem (local),
  Docker containers (docker), and remote production server (prod via SSH).
  Works with Django request logs, uvicorn/gunicorn access logs, Python tracebacks,
  structlog JSON output, and Celery task logs. Auto-discovers Docker containers.
  Use when the user says "check logs", "Python errors", "find in logs", "log summary",
  "500 errors", "traceback in prod", "analyze logs", "what's wrong in prod".
  Do NOT use for application debugging (use aidd-dev:08-debug), DB queries
  (use data-optimize), or performance profiling.
---

# Log Analysis

Inspects Python application logs from any environment — local filesystem, Docker containers, or a remote server via SSH. Produces a raw tail, filtered error list, pattern search, or period summary. Handles Python tracebacks, Django request logs, uvicorn/gunicorn access logs, structlog JSON, and Celery task logs.

## Available actions

| # | Action | Role | Input |
|---|--------|------|-------|
| 01 | `tail` | Display the last N lines from a log source | env, source, optional lines |
| 02 | `parse-errors` | Extract and group Python exceptions and HTTP errors | env, source, optional since |
| 03 | `search` | Search for a pattern, status code, or time range | pattern, optional env, source |
| 04 | `summarize` | Period digest: error rate, top exceptions, 5xx count | optional env, optional since |

## Default flow

Non-sequential — dispatch based on user intent:

- "tail / show / last lines / recent logs / check logs" → `tail`
- "errors / exceptions / tracebacks / error list" → `parse-errors`
- "find / search / grep / [specific pattern or status code]" → `search`
- "summary / digest / report / stats" → `summarize`
- Env not specified → ask: `local`, `docker`, or `prod`?
- No clear intent → `tail` on `app` + `web-server`, then offer `parse-errors`

## Transversal rules

- Never print or log SSH credentials, passwords, or key paths.
- Always show timestamps in output.
- Truncate individual log lines to 300 chars to avoid flooding context.
- When errors are found, always suggest a likely fix or next investigation step.
- Default `env` is `docker` when Docker is detected in the project; otherwise `local`.
- For `prod`: if no SSH host is configured, ask user for `user@host` before proceeding.
- Multiline Python tracebacks must be kept intact — never truncate a traceback at a line boundary.

## References

- `references/environments.md` — env detection, standard log paths, SSH config pattern
- `references/log-formats.md` — Python/Django/uvicorn log formats and parsing patterns
