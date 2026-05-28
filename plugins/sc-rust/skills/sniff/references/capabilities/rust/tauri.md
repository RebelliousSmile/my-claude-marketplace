---
paths:
  - "src-tauri/src/**/*.rs"
  - "src-tauri/Cargo.toml"
  - "src-tauri/tauri.conf.json"
  - "src-tauri/capabilities/**/*.json"
---

# Tauri 2 — patterns Rust backend

Applicable quand `tauri` est détecté dans `Cargo.toml`. Loaded at audit time, never installed.

## Commandes IPC (`#[tauri::command]`)

```rust
// ✅ Retour typé + erreur sérialisable
#[derive(thiserror::Error, Debug, serde::Serialize)]
pub enum CommandError {
    #[error("not found: {0}")]
    NotFound(String),
    #[error("database error: {0}")]
    Db(String),
}

#[tauri::command]
async fn get_user(state: tauri::State<'_, AppState>, id: i64) -> Result<User, CommandError> {
    let conn = state.db.lock().map_err(|e| CommandError::Db(e.to_string()))?;
    // ...
}

// ❌ .unwrap() dans une commande — panic = crash du process renderer
#[tauri::command]
fn bad_command(state: tauri::State<'_, AppState>) -> User {
    state.db.lock().unwrap().get_user(1).unwrap()
}
```

- L'erreur retournée doit implémenter `Serialize` — Tauri la sérialise en JSON pour le frontend
- Ne jamais retourner `String` comme erreur brute — utiliser un type `#[derive(thiserror::Error, Serialize)]`
- Les commandes `async` s'exécutent sur le runtime async de Tauri — ne pas bloquer

## État partagé (`tauri::State`)

```rust
// ✅ État enregistré au setup, injecté dans les commandes
struct AppState {
    db: Arc<Mutex<rusqlite::Connection>>,
    config: Arc<RwLock<AppConfig>>,
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            db: Arc::new(Mutex::new(Connection::open(db_path).unwrap())),
            config: Arc::new(RwLock::new(AppConfig::default())),
        })
        .invoke_handler(tauri::generate_handler![get_user, update_config])
        .run(tauri::generate_context!())
        .unwrap();
}

// ✅ Accès en commande
#[tauri::command]
fn read_config(state: tauri::State<'_, AppState>) -> AppConfig {
    state.config.read().unwrap().clone()
}
```

- L'état doit être `Send + Sync` — jamais `Rc<T>` ou `RefCell<T>`
- `Arc<Mutex<T>>` pour état mutable partagé ; `Arc<RwLock<T>>` si lectures fréquentes
- Un seul `manage()` par type — `tauri::State<T>` est unique par type concret

## Async dans les commandes

```rust
// ✅ async command — s'exécute sur le runtime Tauri
#[tauri::command]
async fn fetch_data(url: String) -> Result<String, String> {
    reqwest::get(&url).await
        .map_err(|e| e.to_string())?
        .text().await
        .map_err(|e| e.to_string())
}

// ✅ I/O bloquante → spawn_blocking
#[tauri::command]
async fn read_large_file(path: String) -> Result<String, String> {
    tokio::task::spawn_blocking(move || {
        std::fs::read_to_string(&path).map_err(|e| e.to_string())
    }).await.map_err(|e| e.to_string())?
}

// ❌ std::fs en async command — bloque le runtime
#[tauri::command]
async fn bad_read(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}
```

## Résolution de chemins

```rust
// ✅ Toujours passer par app.path() pour les chemins app-specific
#[tauri::command]
fn get_db_path(app: tauri::AppHandle) -> Result<PathBuf, String> {
    app.path().app_local_data_dir()
        .map(|d| d.join("data.db"))
        .map_err(|e| e.to_string())
}

// ❌ Chemin hardcodé — non portable, échec sur autres OS/users
fn bad_path() -> PathBuf {
    PathBuf::from("C:\\Users\\user\\AppData\\data.db")
}
```

| Méthode | Usage |
|---|---|
| `app.path().app_local_data_dir()` | DB, cache, état persistant |
| `app.path().app_config_dir()` | Fichiers de configuration |
| `app.path().app_log_dir()` | Logs |
| `app.path().resource_dir()` | Ressources embarquées (read-only) |

## Événements frontend ↔ backend

```rust
// ✅ Émettre vers toutes les fenêtres
app_handle.emit("data-updated", payload)?;

// ✅ Émettre vers une fenêtre spécifique (Tauri 2)
app_handle.emit_to(EventTarget::labeled("main"), "data-updated", payload)?;

// ✅ Écouter depuis Rust
app_handle.listen("frontend-ready", |event| {
    println!("Frontend ready: {:?}", event.payload());
});
```

- Le payload doit implémenter `Serialize + Clone`
- `emit_to` avec un label inexistant échoue silencieusement — vérifier le label de la fenêtre

## Sécurité — Capabilities (Tauri 2)

- Chaque commande exposée doit être déclarée dans un fichier `capabilities/*.json`
- Ne jamais exposer toutes les commandes à toutes les fenêtres — scope par `windows` label
- Plugin `shell` : toujours restreindre aux commandes explicites, jamais `"open": { "all": true }`
- Plugin `fs` : restreindre les scopes aux dossiers app-specific — jamais accès système entier

```json
// ✅ capabilities/main.json — scope minimal
{
  "identifier": "main-capability",
  "windows": ["main"],
  "permissions": [
    "core:default",
    "fs:allow-app-read-recursive",
    "fs:allow-app-write-recursive"
  ]
}
```

## Anti-patterns à signaler

| Anti-pattern | Détection | Risque |
|---|---|---|
| `.unwrap()` dans `#[tauri::command]` | `grep -rn "\.unwrap()" src-tauri/src/` dans les fns `#[tauri::command]` | Panic = crash renderer |
| `String` comme type d'erreur retourné | grep `Result<.*, String>` dans commands | Pas de typage côté frontend |
| `Rc<T>` ou `RefCell<T>` dans l'état | compiler / grep | Non-Send, panic au `manage()` |
| Chemins hardcodés | grep `"C:\\\|/home/\|/Users/"` | Non portable |
| `std::fs` dans async command | grep | Bloque le runtime async |
| `std::sync::Mutex` + `.await` | grep | Deadlock potentiel |
| Toutes les commandes exposées dans capabilities | audit `capabilities/*.json` | Surface d'attaque inutile |
