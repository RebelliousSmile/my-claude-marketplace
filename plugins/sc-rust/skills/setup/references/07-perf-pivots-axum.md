---
paths:
  - "Cargo.toml"
  - "src/**/*.rs"
---

# Perf pivots — Axum / Actix-web (Rust)

Stack-specific overrides applied when `axum` or `actix-web` is in `Cargo.toml`. Loaded by `web-optimize`.

## §0 — Pre-flight

- **Release profile** OBLIGATOIRE en prod : `cargo build --release` (sinon 10-100× plus lent)
- `Cargo.toml [profile.release] lto = "fat"`, `codegen-units = 1`, `strip = true` pour binaire optimisé
- `cargo flamegraph --release` pour profiling CPU

## §1 — Async runtime

- **Tokio** : runtime async standard ; configurer workers via `#[tokio::main(flavor = "multi_thread", worker_threads = N)]`
- Mixage blocking dans async = catastrophe : `std::fs`, `std::thread::sleep`, sync DB drivers bloquent un worker thread
- Pour code blocking (CPU-bound, sync I/O) : `tokio::task::spawn_blocking(|| {...})`
- `tokio-rayon` pour CPU-bound parallèle

## §2 — Handlers

- Handlers Axum : `async fn handler(...) -> impl IntoResponse` — éviter `.unwrap()` (panic = abort thread tokio)
- Result return → `?` operator + `IntoResponse` impl pour error type custom
- Extractors (`State`, `Path`, `Query`, `Json`) parsés à chaque request → audit complexité

## §3 — Middleware (Tower)

- `Layer` composition : ordering matters → `TraceLayer` en premier, `CompressionLayer` après business logic
- `ServiceBuilder::new().layer(...).layer(...)` pattern
- Custom middleware : implémenter `tower::Layer` + `tower::Service` ; tester latency overhead

## §4 — Serialization

- `serde_json` : `#[derive(Serialize, Deserialize)]` ; `#[serde(rename_all = "camelCase")]` pour API JSON
- `simd-json` (`simd-json` crate) 2-3× plus rapide sur gros payloads
- `axum::Json<T>` deserialize l'input — borné via `RequestBodyLimitLayer`

## §5 — Response compression

- `tower-http::compression::CompressionLayer` → gzip / brotli auto sur `Accept-Encoding`
- Coût CPU vs réduction bande passante : profiler en charge réelle

## §6 — Caching

- Pas de cache framework intégré → `moka` (in-memory) ou `redis-rs` (Redis)
- ETag / Cache-Control : implémenter via response headers + middleware

## §7 — Background tasks

- `tokio::spawn(async { ... })` pour fire-and-forget — pas de garantie d'exécution si shutdown
- Pour reliable jobs : queue externe (Redis via `bullmq-rs` ou Postgres via `pg-queue`)
- Graceful shutdown : `axum::serve(...).with_graceful_shutdown(...)` indispensable en prod

## §8 — Logging & tracing

- `tracing` + `tracing-subscriber` : structured logs avec span hierarchy
- `TraceLayer` (tower-http) pour HTTP request tracing automatique
- En prod : level `INFO` ou `WARN` ; jamais `TRACE`/`DEBUG` (overhead massif)
- Async stdout writer (`tracing-appender::non_blocking`) pour ne pas bloquer

## §9 — Database connection

- Pool obligatoire : `sqlx::PgPool::connect(...)` ou `diesel::r2d2::Pool` — voir data pivots
- Pool size = CPU cores × 2 typiquement ; ajuster selon DB max_connections
- Connection reuse entre requests via `axum::extract::State`

## §10 — Storage / sessions

- Backend Rust = SSR pur, pas d'hydration JS → storage côté client géré par le frontend séparé
- Sessions via cookie httpOnly + signed (tower-sessions, axum-login) ; **JAMAIS** secrets en client storage

## §11 — Verification

- `cargo flamegraph` pour profiling CPU
- `tokio-console` pour debug runtime tokio (tasks, spawn count, await durations)
- Prometheus metrics via `axum-prometheus` ou `metrics` crate
- `wrk` / `bombardier` / `vegeta` pour load test
