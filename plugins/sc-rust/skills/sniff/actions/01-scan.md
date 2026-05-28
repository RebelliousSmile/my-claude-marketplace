# Action 01 — scan

Detect project capabilities, map them to plugin rules, audit `.claude/rules/` to determine what is missing or outdated.

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

Note: both `axum` and `actix-web` map to the same perf pivot (`perf-pivots-axum.md`). If either is detected, mark the perf pivot as required.

### Step 3 — Classify data layer

| Signal (Cargo.toml dependency key) | Data layer |
|---|---|
| `sqlx` | SQLx (async queries) |
| `diesel` | Diesel ORM |

### Step 4 — Map capabilities to rules

For each capability, evaluate the detection condition and determine the rule to install.

#### Perf pivots (consumed by `web-optimize`)

| Capability | Condition | Reference → Target |
|---|---|---|
| Web framework perf | Axum or Actix-web detected | `references/07-perf-pivots-axum.md` → `.claude/rules/07-quality/perf-pivots-axum.md` |

#### Data pivots (consumed by `data-optimize`)

| Capability | Condition | Reference → Target |
|---|---|---|
| SQLx async | `sqlx` detected | `references/08-data-pivots-sqlx.md` → `.claude/rules/07-quality/data-pivots-sqlx.md` |
| Diesel ORM | `diesel` detected | `references/08-data-pivots-diesel.md` → `.claude/rules/07-quality/data-pivots-diesel.md` |

### Step 5 — Status each rule

For each required rule, determine status:
- File does not exist → **MISSING**
- File exists, content matches plugin reference → **UP-TO-DATE**
- File exists, content differs from plugin reference → **OUTDATED**
- Condition not met → **NOT-APPLICABLE** (do not install, do not audit)

### Step 6 — Detect gaps

A **gap** is a capability that is detected but for which the plugin has no matching rule or skill.

Check: are there crates in `Cargo.toml` representing a capability not covered by any entry in Step 4?

Report only meaningful gaps — foundational crates like `tokio`, `serde`, or `anyhow` that represent standard infrastructure rather than app-level capabilities need not be reported.

Examples of gaps to report:
- `tower-http` detected — no middleware rule in plugin
- `tonic` detected — no gRPC rule in plugin
- `sea-orm` detected — no SeaORM rule in plugin

List all gaps explicitly in the output.

## Output

Emit a structured manifest for `02-sync`:

```
📊 sc-rust sniff — capability scan

Web framework:
  ✅ Axum (axum = "0.7" from Cargo.toml)
  ❌ Actix-web — not detected

Data layer:
  ✅ SQLx (sqlx = "0.8" from Cargo.toml)
  ❌ Diesel — not detected

Capabilities → rules:
  Perf (Axum/Actix) ✅ perf-pivots-axum.md
  Data (SQLx)       ✅ data-pivots-sqlx.md
  Data (Diesel)     — N/A (not detected)

Skills support:
  /web-optimize  ✅ (perf-pivots-axum.md ready)
  /data-optimize ✅ (data-pivots-sqlx.md ready)

Gaps (no plugin rule):
  tower-http — no middleware rule in plugin

Rule audit:
  MISSING        .claude/rules/07-quality/perf-pivots-axum.md
  UP-TO-DATE     .claude/rules/07-quality/data-pivots-sqlx.md
  NOT-APPLICABLE data-pivots-diesel.md (Diesel not detected)

→ sync will install 1 file, update 0 files.
```

Then proceed to action `02-sync`.
