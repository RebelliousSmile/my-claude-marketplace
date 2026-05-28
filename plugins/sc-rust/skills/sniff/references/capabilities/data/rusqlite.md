---
paths:
  - "Cargo.toml"
  - "src/**/*.rs"
---

# Data pivots — rusqlite (Rust)

Stack-specific checklist for data audits when `rusqlite` is detected in `Cargo.toml`. Loaded by `data-optimize`. Applies to embedded SQLite — synchronous, single-file, no connection pool.

## §0 — Pre-flight

- Vérifier la feature `bundled` dans `Cargo.toml` : `rusqlite = { version = "...", features = ["bundled"] }` — recommandé pour desktop Tauri (aucune dépendance SQLite système)
- Tests : `Connection::open_in_memory()` — une connexion par test, jamais partagée
- `PRAGMA journal_mode = WAL` au démarrage pour la concurrence lecture/écriture
- `PRAGMA optimize` au startup pour mettre à jour les statistiques SQLite
- Détecter full table scans : `conn.prepare("EXPLAIN QUERY PLAN SELECT ...")` sur les queries critiques

## §1 — N+1 et queries en boucle

- rusqlite n'a pas d'ORM ni de lazy loading — le risque N+1 est entièrement manuel
- Détecter : `grep -rn "query_row\|query_map\|execute\b" src/ --include="*.rs"` dans des boucles `for` ou `.iter().map()`
- Remplacer par `WHERE id IN (?)` avec construction manuelle de la liste de paramètres, ou par un JOIN SQL
- Batch insert en transaction : boucler sur `stmt.execute(params![...])` dans `conn.transaction(...)` — bien plus rapide que N inserts séparés

## §2 — Select narrowing

- Jamais `SELECT *` en production — mapper vers une struct avec champs explicites
- Pattern `query_row` :

```rust
// ✅
let user: User = conn.query_row(
    "SELECT id, email, created_at FROM users WHERE id = ?1",
    params![id],
    |row| Ok(User { id: row.get(0)?, email: row.get(1)?, created_at: row.get(2)? }),
)?;

// ❌
conn.query_row("SELECT * FROM users WHERE id = ?1", params![id], |row| ...)
```

## §3 — Gestion de connexion

- `rusqlite::Connection` n'implémente pas `Send` — ne jamais passer entre threads sans `Mutex`
- Pattern Tauri / state partagé :

```rust
// ✅ connexion ouverte une fois, partagée via Arc<Mutex<>>
struct DbState(Arc<Mutex<Connection>>);

// dans setup Tauri :
let conn = Connection::open(db_path)?;
conn.execute_batch("PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;")?;
app.manage(DbState(Arc::new(Mutex::new(conn))));

// dans un command Tauri :
#[tauri::command]
fn get_user(state: tauri::State<DbState>, id: i64) -> Result<User, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    // ...
}
```

- Interdire `Connection::open()` dans chaque handler — coût d'ouverture non négligeable
- `OpenFlags::SQLITE_OPEN_READ_WRITE | OpenFlags::SQLITE_OPEN_CREATE` pour l'ouverture initiale

## §4 — Transactions

- Utiliser `conn.transaction(|tx| { ... })` pour les opérations multi-steps — rollback automatique sur `?`
- Alternative pour les opérations simples : `conn.execute_batch("BEGIN; ...; COMMIT;")`
- Batch inserts en transaction : gain de 10-100x sur les inserts en boucle

```rust
// ✅
let tx = conn.transaction()?;
{
    let mut stmt = tx.prepare("INSERT INTO events (type, payload) VALUES (?1, ?2)")?;
    for event in &events {
        stmt.execute(params![event.kind, event.payload])?;
    }
}
tx.commit()?;
```

## §5 — Paramètres liés et sécurité

- Toujours utiliser `params![...]` ou paramètres nommés (`:name`) — jamais `format!()` pour construire une query

```rust
// ✅
conn.execute("DELETE FROM sessions WHERE user_id = ?1", params![user_id])?;

// ❌ injection SQL
conn.execute(&format!("DELETE FROM sessions WHERE user_id = {}", user_id), [])?;
```

- Paramètres nommés avec `named_params!` pour les queries complexes :
  `stmt.execute(named_params!{ ":id": id, ":email": email })?;`

## §6 — Bundled vs system SQLite

| Feature | Comportement | Recommandé pour |
|---|---|---|
| `bundled` | SQLite embarqué dans le binaire (~1 MB) | Tauri desktop, CI sans SQLite système |
| `system` | Utilise SQLite installé sur l'OS | Serveurs avec SQLite garanti |
| `bundled-sqlcipher` | SQLite chiffré (SQLCipher) | Données sensibles at-rest |

- Vérifier l'absence de mismatch de version entre `bundled` et les PRAGMA utilisés

## §7 — Tests

```rust
// ✅ in-memory par test — rapide, isolé
fn setup_db() -> Connection {
    let conn = Connection::open_in_memory().unwrap();
    conn.execute_batch(include_str!("../migrations/001_init.sql")).unwrap();
    conn
}

#[test]
fn test_insert_user() {
    let conn = setup_db();
    // ...
}
```

- Jamais de connexion partagée entre tests — `setup_db()` doit retourner une nouvelle connexion à chaque appel
- Appliquer toutes les migrations avant d'exécuter les assertions

## §8 — Error handling

```rust
// ✅ mapper rusqlite::Error vers un type domaine
#[derive(thiserror::Error, Debug)]
pub enum DbError {
    #[error("not found")]
    NotFound,
    #[error("database error: {0}")]
    Rusqlite(#[from] rusqlite::Error),
}

// ✅ QueryReturnedNoRows → NotFound
fn get_user(conn: &Connection, id: i64) -> Result<User, DbError> {
    conn.query_row("SELECT ...", params![id], |row| Ok(User { ... }))
        .map_err(|e| match e {
            rusqlite::Error::QueryReturnedNoRows => DbError::NotFound,
            other => DbError::Rusqlite(other),
        })
}
```

- `rusqlite::Error::SqliteFailure` contient le code SQLITE (`libsqlite3_sys::ErrorCode`) — utile pour détecter les violations de contrainte UNIQUE

## §9 — Schéma et migrations

- Pas de système de migration intégré — utiliser `rusqlite_migration` (crate) ou scripts SQL versionés
- Pattern simple avec `include_str!` :

```rust
const MIGRATIONS: &[&str] = &[
    include_str!("../migrations/001_init.sql"),
    include_str!("../migrations/002_add_sessions.sql"),
];

fn apply_migrations(conn: &Connection) -> rusqlite::Result<()> {
    let version: i64 = conn.query_row("PRAGMA user_version", [], |r| r.get(0))?;
    for (i, sql) in MIGRATIONS.iter().enumerate().skip(version as usize) {
        conn.execute_batch(sql)?;
        conn.execute_batch(&format!("PRAGMA user_version = {}", i + 1))?;
    }
    Ok(())
}
```

- Ne jamais modifier une migration déjà appliquée — toujours ajouter une nouvelle

## §10 — Vérification

- `EXPLAIN QUERY PLAN SELECT ...` pour détecter les full table scans (chercher `SCAN TABLE` sans `USING INDEX`)
- `PRAGMA integrity_check` au startup en dev pour détecter une corruption de fichier
- Détecter les index manquants : colonnes utilisées dans `WHERE`, `ORDER BY`, `JOIN ON` sans index → `CREATE INDEX IF NOT EXISTS`

## §11 — Self-audit

- N/A : §3 Real-time (SQLite pas de NOTIFY/LISTEN), pagination curseur standard applicable
- Faux positifs : `execute_batch` avec plusieurs statements est intentionnel pour les migrations — ne pas flaguer
- Feature `bundled` augmente la taille du binaire de ~1 MB — acceptable pour desktop
