---
paths:
  - "**/supabase.config.*"
  - "**/supabase/**/*.ts"
  - "**/supabase/**/*.sql"
  - "**/composables/useSupabase*.ts"
---

# Data pivots — Supabase (Postgres + PostgREST + Realtime)

Stack-specific overrides for data audits when `@supabase/supabase-js` is detected. Loaded by `data-optimize`. Concatenate with framework pivots.

## §0 — Pre-flight

- Supabase Dashboard → Database / Query Performance : slow queries, table stats, index usage
- `SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 20` pour profiling
- Bundle : `@supabase/supabase-js` ~30 KB ; le typage généré (`supabase gen types`) zero coût runtime

## §1 — PostgREST queries

- `.select('id, email, posts(id, title)')` → embeds via FK ; vérifier que les FK sont déclarées (pas de hint nécessaire)
- N+1 inexistant côté PostgREST si on embed correctement (c'est du SQL JOIN sous le capot)
- `.select('*')` interdit hors prototype — toujours sélection explicite

## §2 — Row Level Security (RLS)

- **RLS = défense ultime** — toujours `enable row level security` sur chaque table publique
- Policies `using (auth.uid() = user_id)` minimum ; auditer les `using (true)` (= public)
- Chaque policy = condition WHERE additionnelle → impact perf si fonction lourde dans policy (préférer `security definer` functions cachables)
- Tester via `select set_config('request.jwt.claims', ...)` puis `select` en tant qu'utilisateur

## §3 — Pagination

- `.range(0, 19)` → offset-based ; OK jusqu'à ~1000 rows
- Au-delà : cursor pattern avec `.gt('id', lastId).order('id').limit(20)`
- `.order(...)` toujours stable (id en tiebreaker si tri sur champ non-unique)

## §4 — Indexes

- Migrations SQL versionnées (`supabase/migrations/*.sql`)
- `CREATE INDEX CONCURRENTLY` pour migration prod sans lock
- `EXPLAIN ANALYZE` via SQL Editor → vérifier que les queries hot path utilisent les index

## §5 — Realtime

- `supabase.channel('room').on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, cb).subscribe()`
- Coût : WebSocket persistent par client × nombre de tables écoutées
- **Filtre côté serveur** via `filter: 'user_id=eq.123'` — ne JAMAIS broadcast all rows et filter côté client (fuite données + bande passante)
- Quota free tier : 2 concurrent connections par client, 200 channels total
- Cleanup obligatoire : `supabase.removeChannel(channel)` côté unmount

## §6 — Connection pooling

- 2 endpoints :
  - Direct (`5432`) : session mode, prepared statements OK ; max ~60 connexions
  - Pooler (`6543`) : transaction mode (PgBouncer) ; `prepare: false` côté driver, scalable
- Serverless (Edge Functions, Vercel) → toujours pooler 6543
- App long-running (Node server) → direct 5432 si volume connections raisonnable

## §7 — Storage

- `supabase.storage.from('bucket').upload(...)` ; quotas free tier 1 GB
- URLs signées (`createSignedUrl`) pour assets privés ; TTL court (5-60 min)
- CDN devant `https://*.supabase.co/storage/v1/object/public/*` → `Cache-Control` configurable côté bucket
- Image transforms (`?width=300`) servis depuis CDN (cache key = full URL avec params)

## §8 — Edge Functions

- Deno runtime, cold start ~50-200ms
- Bundle limit 10 MB ; éviter les libs lourdes (préférer fetch + Deno std)
- `Deno.serve(...)` pattern ; pas de longue tâche (timeout fonction)

## §9 — Auth

- JWT stocké en localStorage par défaut (`@supabase/supabase-js`) — XSS readable
- `persistSession: false` + refresh token côté serveur (cookie httpOnly) si compliance stricte
- `getUser()` valide le JWT auprès du serveur (1 round-trip) ; `getSession()` lit du storage local (instantané mais non vérifié)
