# destinations.txt — template & convention

`destinations.txt` is the curated map consumed by the `email-to-markdown`
router: a flat list of valid destination paths under the second-brain tree,
each optionally carrying matching rules. The router files each email into the
first matching path, then appends `/<Year>/<Month>` derived from the email date.

This file lives in the app config dir (`%APPDATA%\email-to-markdown\` on
Windows, `~/.config/email-to-markdown/` on Linux, `~/Library/Application
Support/email-to-markdown/` on macOS) unless `settings.destinations_file`
overrides it. It is **manually curated** — the app never rewrites it.

## Relationship to the tree convention

- Paths are relative to `notes_dir` (the second-brain base root) and **start
  with the anchor segment** `Perso/` or `Pro/`.
- A destination is the **durable** part of the tree — the
  `(Perso|Pro)/category/subcategory` level, i.e. the parent of the dated
  `AAAA/MM` levels. The router adds `/<Year>/<Month>` itself; never include
  year/month in a destination path.
- Derive the path list from `tree index`: every directory that is the immediate
  parent of an `AAAA`-named (4-digit year) directory is a destination candidate.
- `notes_dir` must be the **parent of the anchor**. For an anchor at
  `C:\Users\me\Documents\Perso`, set `notes_dir = C:\Users\me\Documents`.

## Line format

```text
<path>  [ | <attr>, <attr>... ]
```

- `<path>` — relative to `notes_dir`, starts with `Perso/` or `Pro/`. Validated
  by `join_safe_segments`: rejects `..`, `.`, `\`, absolute paths, and
  characters outside `[A-Za-z0-9À-ſ _.\-]` (spaces and accents are allowed).
- ` | <attrs>` — optional comma-separated matching rules. A line with no attrs
  is a valid folder, routed only by AI (if enabled), otherwise to the default.
- `#` starts a comment; blank lines are ignored.

### Matching attributes

| Attribute         | Matches when…                                          | Example                       |
| ----------------- | ------------------------------------------------------ | ----------------------------- |
| `domain:<d>`      | sender domain equals `d` or ends with `.d` (subdomain) | `domain:bnpparibas.net`       |
| `from:<addr>`     | sender address equals `addr` (case-insensitive)        | `from:noreply@axa.fr`         |
| `subject:<kw>`    | subject contains `kw` (case-insensitive substring)     | `subject:facture`             |
| `account:<name>`  | source email account equals `name`                     | `account:Gmail`               |
| `default`         | fallback for unmatched emails (**at most one line**)    | `Perso/Communication/Emails \| default` |

### Priority

Priority is the **order of lines in this file** — the first destination whose
rules match wins. Within one line, attributes are tried in declaration order.
There is no implicit rule-type hierarchy. More-than-one `default` → hard parse
error.

### Default fallback

If no rule matches and no `default` line exists, the router uses the hard-coded
fallback `Perso/Messy/Emails/<Year>/<Month>`. Add a `default`-tagged line to
override that target.

## Template

```text
# destinations.txt — second-brain routing map
# Generated from <anchor> on <YYYY-MM-DD> (obs:tree convention).
# Format: <path>  [ | <attr>, <attr>... ]   — path relative to notes_dir,
#   /<Year>/<Month> appended automatically. Priority = file order.

# ── Communication ────────────────────────────────────────────────
Perso/Communication/Family        | from:<relative@example.com>
Perso/Communication/Professional  | domain:<employer.com>

# ── Finances ─────────────────────────────────────────────────────
Perso/Bank/<BankName>             | domain:<bank-domain>
Perso/Administratif/Factures      | subject:facture, subject:invoice

# ── Insurance / Health ───────────────────────────────────────────
Perso/Insurance/<Insurer>         | domain:<insurer-domain>
Perso/Health/General

# ── Folders without rules (AI-routed if enabled, else default) ────
Perso/Housing/General
Perso/Identity/Accounts

# ── Catch-all (optional — overrides the hard-coded Perso/Messy/Emails) ──
# Perso/Communication/Emails       | default
```

## Generating from a scanned tree

After `tree index`, turn the cache into a starting `destinations.txt`:

1. Take each domain path at the `category/subcategory` level (parent of `AAAA`).
2. Prefix with the anchor segment (`Perso/` or `Pro/`).
3. Emit one line per path, grouped by top category with `#` headers.
4. Leave attributes empty initially; the user adds `domain:`/`from:`/`subject:`
   rules per their real correspondents.
5. Comment out (`#`) categories that never receive email (media, music, photos,
   games) so they stay available without cluttering deterministic routing.
6. Never invent matching rules — only the user knows their senders.
