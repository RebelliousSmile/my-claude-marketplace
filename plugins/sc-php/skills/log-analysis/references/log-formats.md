# Log line formats and parsing patterns

## PHP error log

Format: `[DD-Mon-YYYY HH:MM:SS UTC] PHP <severity>: <message> in <file> on line <N>`

Severity values: `Fatal error`, `Parse error`, `Error`, `Warning`, `Notice`, `Deprecated`, `Strict Standards`

Parse regex: `^\[(.+?)\] PHP (Fatal error|Parse error|Error|Warning|Notice|Deprecated|Strict Standards): (.+) in (.+) on line (\d+)`

Normalization for grouping — strip:
- Memory addresses: `0x[0-9a-f]+`
- Line numbers: ` on line \d+`
- Stack trace continuations: lines starting with `PHP  \d+\. `

## Apache error log

Format (Apache 2.4): `[Weekday Mon DD HH:MM:SS.usec YYYY] [module:level] [pid N] <message>`

Parse regex: `^\[(\w+ \w+ \d+ [\d:.]+) \d+\] \[([^:]+):(\w+)\] \[pid \d+\] (.+)`

Levels: `emerg`, `alert`, `crit`, `error`, `warn`, `notice`, `info`, `debug`

## Apache access log (Combined Log Format)

Format: `<ip> - - [DD/Mon/YYYY:HH:MM:SS +ZZZZ] "<method> <path> <proto>" <status> <bytes> "<referer>" "<ua>"`

Parse regex: `^(\S+) \S+ \S+ \[([^\]]+)\] "(\S+) (\S+) [^"]*" (\d{3}) (\d+|-)`

Status extraction: field 5 (1-indexed). 5xx = server errors, 4xx = client errors.

## Nginx error log

Format: `YYYY/MM/DD HH:MM:SS [level] <pid>#<tid>: <message>`

Parse regex: `^(\d{4}/\d{2}/\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] \d+#\d+: (.+)`

Levels: `debug`, `info`, `notice`, `warn`, `error`, `crit`, `alert`, `emerg`

## Nginx access log (Combined)

Same format as Apache Combined Log Format.

## Laravel log (Monolog)

Format: `[YYYY-MM-DD HH:MM:SS] <env>.<LEVEL>: <message> <context> <extra>`

Parse regex: `^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+)\.(\w+): (.+)`

## Timestamp filtering

### docker-* sources (stdout/stderr streams)

Native support — pass directly to `docker logs`:

```bash
docker logs --since 1h   <container>   # duration: 10m, 1h, 24h, 2h30m
docker logs --since 30m  <container>
docker logs --since 2026-05-27T00:00:00 <container>   # RFC3339 also accepted
```

### File-based sources (local, docker exec, prod SSH)

Two strategies — choose based on required precision.

#### Strategy A — Day-level precision (fast, no dependencies)

Grep on the date string visible in each format:

| Log format          | Command                                            |
| ------------------- | -------------------------------------------------- |
| PHP error log       | `grep "$(date '+%d-%b-%Y')"  <path>`               |
| Apache access       | `grep "$(date '+%d/%b/%Y:')" <path>`               |
| Apache error        | `grep "$(date '+%b %e')"     <path>` (space-padded day) |
| Nginx error/access  | `grep "$(date '+%Y/%m/%d')"  <path>`               |
| Laravel (Monolog)   | `grep "$(date '+%Y-%m-%d')"  <path>`               |

For `docker exec`: prefix with `docker exec <container>`.
For `prod`: prefix with `ssh <host>`.

#### Strategy B — Sub-day precision (PHP one-liner)

PHP is always available in PHP environments. Replace `cat <path>` with:

```bash
php -r "
\$cutoff = time() - <seconds>;  // e.g. 3600 for 1h, 1800 for 30m
\$fh = fopen('<path>', 'r') or exit(1);
while (\$line = fgets(\$fh)) {
    \$ts = null;
    if (preg_match('/^\[(\d{2}-\w{3}-\d{4} \d{2}:\d{2}:\d{2})/', \$line, \$m))
        \$ts = strtotime(\$m[1]);                              // PHP error log
    elseif (preg_match('/\[(\d{2}\/\w{3}\/\d{4}:\d{2}:\d{2}:\d{2} [+-]\d{4})\]/', \$line, \$m))
        \$ts = DateTime::createFromFormat('d/M/Y:H:i:s O', \$m[1])->getTimestamp(); // Apache access/error
    elseif (preg_match('/^(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/', \$line, \$m))
        \$ts = DateTime::createFromFormat('Y/m/d H:i:s', \$m[1])->getTimestamp();   // Nginx
    elseif (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', \$line, \$m))
        \$ts = strtotime(\$m[1]);                              // Laravel/Monolog
    if (\$ts === null || \$ts >= \$cutoff) echo \$line;  // null = continuation/stack line, always include
}
"
```

Adapt prefix:
- `docker exec <container> php -r "..."`
- `ssh <host> php -r '...'` (escape `'` as `'\''` in the PHP string if needed)

If `php` CLI is absent on the target (e.g. PHP-FPM-only prod server, container without CLI), fall back to Strategy A.

### `since` → seconds conversion table

| User input | Seconds  | Notes                         |
| ---------- | -------- | ----------------------------- |
| `30m`      | `1800`   |                               |
| `1h`       | `3600`   |                               |
| `2h`       | `7200`   |                               |
| `6h`       | `21600`  |                               |
| `12h`      | `43200`  |                               |
| `24h`      | `86400`  | → prefer Strategy A (1 day)  |
| `2d`       | `172800` | → prefer Strategy A (date prefix) |
| `YYYY-MM-DD` | —      | → Strategy A: grep on date prefix |
| ISO datetime | —      | → Strategy B with `strtotime($since)` as `$cutoff` |
