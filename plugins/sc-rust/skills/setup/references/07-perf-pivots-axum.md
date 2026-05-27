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
- Build warnings load-bearing : `warning: unused import` sur des middleware Tower = middleware non appliqué silencieusement ; `warning: dead_code` sur des handlers = route jamais enregistrée
- Capture variance : Axum est un backend Rust — latence mesurée via `wrk`/`vegeta`/`bombardier`, pas PSI ; 5 runs à charge identique pour baseline p50/p95
- Tripwire CI : `cargo clippy -- -D warnings` échoue le build sur tout warning Clippy

## §1 — Critical path

N/A — Axum/Actix-web est un backend API Rust, pas un générateur de pages HTML avec CSS ; pas de render-blocking resources côté serveur.

## §2 — LCP

N/A — Axum ne sert pas de pages HTML avec images hero ; LCP géré par le frontend séparé (React, Vue, Leptos, etc.).

## §3 — CLS

N/A — Axum ne génère pas de HTML avec layout ; CLS géré par le frontend séparé.

## §4 — Bundle

- Si Axum sert des fichiers statiques (`ServeDir`) : assets frontend hashés → `Cache-Control: immutable` sur ces fichiers
- N/A — code-splitting géré par le bundler frontend (Vite/webpack) ; Axum sert les fichiers produits tels quels
- Import lazy N/A côté Rust ; Rust compile en binaire statique

## §5 — CSS

N/A — Axum ne génère pas de CSS ; purge et optimisation CSS relèvent du frontend séparé.

## §6 — Caching

- Fichiers statiques hashés : `Cache-Control: public, max-age=31536000, immutable` via `tower-http::set_response_header::SetResponseHeaderLayer`
- Routes API authentifiées : `Cache-Control: no-store` — header ajouté via middleware Tower ou dans le handler
- Routes API données publiques stables : `Cache-Control: public, max-age=60, stale-while-revalidate=300`
- Routes HTML SSR : N/A — Axum ne génère pas de HTML en général
- Cache applicatif : `moka` (in-memory TTL) ou `redis-rs` (Redis) ; pas de framework intégré
- ETag / Cache-Control : implémenter via response headers + `tower-http` layers

## §7 — SSR

N/A — Axum est un backend API Rust ; pas d'hydration JS. Sauf si Leptos SSR (framework Rust séparé, hors scope).

## §8 — INP/TBT

N/A — Axum est un serveur HTTP Rust, pas une UI côté navigateur ; pas d'interactions utilisateur DOM.

## §9 — Backend / TTFB

- Chemin critique : handler Axum → extracteur State → DB query via SQLx/Diesel → sérialisation JSON via Serde → response
- Max 3 queries séquentielles ; `tokio::join!()` pour paralléliser : `let (users, posts) = tokio::join!(fetch_users(&pool), fetch_posts(&pool));`
- Connexion data : voir `data-pivots-sqlx.md` ou `data-pivots-diesel.md`
- Cold start : Axum = binaire compilé, démarrage < 100ms ; cold start significatif uniquement si Lambda/Cloud Run (warm-up via keep-alive ping ou `PROVISIONED_CONCURRENCY`)
- Async runtime Tokio : `#[tokio::main(flavor = "multi_thread", worker_threads = N)]` ; eviter `spawn_blocking` dans le hot path
- Gunicorn workers N/A — déploiement direct du binaire ou via `systemd` + reverse proxy Nginx

## §10 — Client-side storage

N/A — Rust backend, pas d'accès possible à localStorage/sessionStorage (côté serveur).

Sessions : cookies httpOnly signés via `tower-sessions`, jamais en LocalStorage.

## §11 — Verification

- `cargo flamegraph` pour profiling CPU
- `tokio-console` pour debug runtime tokio (tasks, spawn count, await durations)
- Prometheus metrics via `axum-prometheus` ou `metrics` crate
- `wrk` / `bombardier` / `vegeta` pour load test
- Critère déterministe : latence p50/p95 via `wrk -t4 -c100 -d30s http://localhost:3000/endpoint` ; taille du binaire via `ls -lh target/release/app`
- Comparaison : médiane post-fix vs maximum pré-fix sur 5 runs à charge identique

---

## Notes internes Axum (hors contrat web-optimize)

### Async runtime

- **Tokio** : runtime async standard ; configurer workers via `#[tokio::main(flavor = "multi_thread", worker_threads = N)]`
- Mixage blocking dans async = catastrophe : `std::fs`, `std::thread::sleep`, sync DB drivers bloquent un worker thread
- Pour code blocking (CPU-bound, sync I/O) : `tokio::task::spawn_blocking(|| {...})`
- `tokio-rayon` pour CPU-bound parallèle

### Handlers

- Handlers Axum : `async fn handler(...) -> impl IntoResponse` — éviter `.unwrap()` (panic = abort thread tokio)
- Result return → `?` operator + `IntoResponse` impl pour error type custom
- Extractors (`State`, `Path`, `Query`, `Json`) parsés à chaque request → audit complexité

### Middleware (Tower)

- `Layer` composition : ordering matters → `TraceLayer` en premier, `CompressionLayer` après business logic
- `ServiceBuilder::new().layer(...).layer(...)` pattern
- Custom middleware : implémenter `tower::Layer` + `tower::Service` ; tester latency overhead

### Serialization

- `serde_json` : `#[derive(Serialize, Deserialize)]` ; `#[serde(rename_all = "camelCase")]` pour API JSON
- `simd-json` (`simd-json` crate) 2-3× plus rapide sur gros payloads
- `axum::Json<T>` deserialize l'input — borné via `RequestBodyLimitLayer`

### Response compression

- `tower-http::compression::CompressionLayer` → gzip / brotli auto sur `Accept-Encoding`
- Coût CPU vs réduction bande passante : profiler en charge réelle

### Background tasks

- `tokio::spawn(async { ... })` pour fire-and-forget — pas de garantie d'exécution si shutdown
- Pour reliable jobs : queue externe (Redis via `bullmq-rs` ou Postgres via `pg-queue`)
- Graceful shutdown : `axum::serve(...).with_graceful_shutdown(...)` indispensable en prod

### Logging & tracing

- `tracing` + `tracing-subscriber` : structured logs avec span hierarchy
- `TraceLayer` (tower-http) pour HTTP request tracing automatique
- En prod : level `INFO` ou `WARN` ; jamais `TRACE`/`DEBUG` (overhead massif)
- Async stdout writer (`tracing-appender::non_blocking`) pour ne pas bloquer

### Database connection

- Pool obligatoire : `sqlx::PgPool::connect(...)` ou `diesel::r2d2::Pool` — voir data pivots
- Pool size = CPU cores × 2 typiquement ; ajuster selon DB max_connections
- Connection reuse entre requests via `axum::extract::State`

### Storage / sessions

- Backend Rust = SSR pur, pas d'hydration JS → storage côté client géré par le frontend séparé
- Sessions via cookie httpOnly + signed (tower-sessions, axum-login) ; **JAMAIS** secrets en client storage
