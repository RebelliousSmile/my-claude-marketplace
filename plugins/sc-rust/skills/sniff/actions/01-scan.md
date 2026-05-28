# Action 01 — scan

Detect project capabilities, map them to plugin pivots, and emit a structured pivot manifeste for `02-install-pivots` and `/sc-rust:audit`.

## Process

### Step 1 — Read Cargo.toml

Read `Cargo.toml` from the project root. Parse `[dependencies]` and `[dev-dependencies]`.

If `Cargo.toml` is absent, check for a workspace: look for `Cargo.toml` files in immediate subdirectories and collect all `[dependencies]` sections.

If no `Cargo.toml` is found anywhere, abort:
```
❌ sc-rust sniff — no Cargo.toml found
   Aborting.
```

### Step 2 — Classify web framework

| Signal (Cargo.toml dependency key) | Framework |
|---|---|
| `axum` | Axum |
| `actix-web` | Actix-web |

Note: both `axum` and `actix-web` map to the same perf pivot (`perf/axum.md`). If either is detected, mark the perf pivot as required.

### Step 3 — Classify data layer

| Signal (Cargo.toml dependency key) | Data layer |
|---|---|
| `sqlx` | SQLx (async queries) |
| `diesel` | Diesel ORM |
| `rusqlite` | rusqlite (embedded SQLite, synchronous) |

### Step 4 — Map capabilities to pivots

#### Capability pivots (loaded at audit time by `/sc-rust:audit` — never installed to disk)

| Capability | Condition | Pivot path |
|---|---|---|
| Rust idioms | Any Rust project detected | `rust/idioms.md` |
| PyO3 FFI bridge | `pyo3` detected | `rust/pyo3.md` |

#### Perf pivots (installed to `.claude/rules/07-quality/`)

| Capability | Condition | Source → Target |
|---|---|---|
| Web framework perf | Axum or Actix-web detected | `references/capabilities/perf/axum.md` → `.claude/rules/07-quality/perf-pivots-axum.md` |

#### Data pivots (installed to `.claude/rules/07-quality/`)

| Capability | Condition | Source → Target |
|---|---|---|
| SQLx async | `sqlx` detected | `references/capabilities/data/sqlx.md` → `.claude/rules/07-quality/data-pivots-sqlx.md` |
| Diesel ORM | `diesel` detected | `references/capabilities/data/diesel.md` → `.claude/rules/07-quality/data-pivots-diesel.md` |
| rusqlite embedded | `rusqlite` detected | `references/capabilities/data/rusqlite.md` → `.claude/rules/07-quality/data-pivots-rusqlite.md` |

### Step 5 — Status each perf/data pivot

For each required pivot, determine status:
- File does not exist → **MISSING**
- File exists, content matches plugin reference → **UP-TO-DATE**
- File exists, content differs from plugin reference → **OUTDATED**
- Condition not met → **NOT-APPLICABLE**

### Step 6 — Detect gaps

A **gap** is a capability detected but for which the plugin has no matching pivot.

Report only meaningful gaps — foundational crates like `tokio`, `serde`, or `anyhow` need not be reported.

Examples of gaps to report:
- `tower-http` detected — no middleware rule in plugin
- `tonic` detected — no gRPC rule in plugin
- `sea-orm` detected — no SeaORM rule in plugin

## Output

Emit the pivot manifeste for `02-install-pivots`:

```
📊 sc-rust sniff — pivot manifeste

Web framework:
  ✅ Axum (axum = "0.7" from Cargo.toml)
  ❌ Actix-web — not detected

Data layer:
  ✅ SQLx (sqlx = "0.8" from Cargo.toml)
  ❌ Diesel — not detected

Capability pivots (loaded at audit time — not installed):
  rust/idioms.md   ✅

Perf pivots (to install):
  perf/axum.md     ✅ → .claude/rules/07-quality/perf-pivots-axum.md

Data pivots (to install):
  data/sqlx.md     ✅ → .claude/rules/07-quality/data-pivots-sqlx.md
  data/diesel.md   — N/A (not detected)

Skills support:
  /web-optimize  ✅ (perf-pivots-axum.md ready)
  /data-optimize ✅ (data-pivots-sqlx.md ready)
  /sc-rust:audit ✅ (rust/idioms.md will be loaded)

Gaps (no plugin pivot):
  tower-http — no middleware rule in plugin

Rule audit (.claude/rules/07-quality/):
  MISSING   perf-pivots-axum.md
  UP-TO-DATE data-pivots-sqlx.md
  N/A       data-pivots-diesel.md (Diesel not detected)

→ install-pivots will install 1 file, update 0 files.
```

Then proceed to `02-install-pivots`.
