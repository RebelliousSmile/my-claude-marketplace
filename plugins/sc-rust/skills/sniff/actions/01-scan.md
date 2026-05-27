# Action 01 — scan

Detect the Rust stack in the current project and audit `.claude/rules/` to determine which rules are missing or outdated.

## Process

### Step 1 — Read Cargo.toml

Read `Cargo.toml` from the project root. Parse `[dependencies]` and `[dev-dependencies]`.

If `Cargo.toml` is absent, check for a workspace: look for `Cargo.toml` files in immediate subdirectories and collect all `[dependencies]` sections.

If no `Cargo.toml` is found anywhere, abort:
```
❌ sc-rust sniff — no Cargo.toml found
   Aborting.
```

### Step 2 — Classify stack

Evaluate the following signals. A project can use multiple data crates.

| Signal (Cargo.toml dependency key) | Stack |
|---|---|
| `axum` | Axum web framework |
| `actix-web` | Actix-web framework |
| `sqlx` | SQLx async queries |
| `diesel` | Diesel ORM |

Note: both `axum` and `actix-web` map to the same perf pivot file (`perf-pivots-axum.md`), which covers both frameworks. If either is detected, mark the pivot as required.

### Step 3 — Audit installed rules

For each detected stack, determine the required rule file and its status:

| Stack detected | Rule file | Reference |
|---|---|---|
| Axum or Actix-web | `.claude/rules/07-quality/perf-pivots-axum.md` | `references/07-perf-pivots-axum.md` |
| SQLx | `.claude/rules/07-quality/data-pivots-sqlx.md` | `references/08-data-pivots-sqlx.md` |
| Diesel | `.claude/rules/07-quality/data-pivots-diesel.md` | `references/08-data-pivots-diesel.md` |

For each required rule file, check its status:
- File does not exist → **MISSING**
- File exists and content matches the plugin reference (ignore trailing whitespace) → **UP-TO-DATE**
- File exists but content differs from the plugin reference → **OUTDATED**

## Output

Emit a structured manifest for `02-sync`:

```
📊 sc-rust sniff — scan results

Stack detected:
  ✅ Axum (from: Cargo.toml — axum = "0.7")
  ✅ SQLx (from: Cargo.toml — sqlx = "0.8")
  ❌ Actix-web — not detected
  ❌ Diesel — not detected

Rule audit (required for detected stack):
  MISSING   .claude/rules/07-quality/perf-pivots-axum.md
  UP-TO-DATE .claude/rules/07-quality/data-pivots-sqlx.md

→ sync will install 1 file, update 0 files.
```

Then proceed to action `02-sync`.
