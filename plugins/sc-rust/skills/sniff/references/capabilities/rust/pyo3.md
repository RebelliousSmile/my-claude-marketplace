---
paths:
  - "Cargo.toml"
  - "src/**/*.rs"
  - "!**/target/**"
---

# PyO3 — Bridge Rust/Python

Criteria for `/sc-rust:audit` when `pyo3` is detected in `Cargo.toml`. Loaded at audit time, never installed. Couvre les patterns FFI Rust→Python : panics, GIL, types, erreurs, thread safety.

## Panics across the FFI boundary

**Règle absolue** : un panic Rust traversant la frontière FFI vers Python produit un comportement indéfini.

```rust
// ❌ panic possible dans du code appelé depuis Python
#[pyfunction]
fn process(data: Vec<u8>) -> PyResult<String> {
    let value = data[0]; // panic si data est vide — UB côté Python
    Ok(value.to_string())
}

// ✅ convertir en PyResult avant toute opération faillible
#[pyfunction]
fn process(data: Vec<u8>) -> PyResult<String> {
    let value = data.first()
        .ok_or_else(|| PyValueError::new_err("data is empty"))?;
    Ok(value.to_string())
}
```

- Détecter : `grep -rn "\.unwrap()\|\.expect(" src/ --include="*.rs"` dans des fonctions `#[pyfunction]` ou méthodes `#[pymethods]`
- Utiliser `std::panic::catch_unwind` uniquement comme dernier recours si le code appelé est du code tiers non contrôlable

## GIL — Python Global Interpreter Lock

```rust
// ✅ acquérir le GIL explicitement pour les appels Python depuis Rust
Python::with_gil(|py| {
    let result: PyObject = py_module.call_method1(py, "compute", (input,))?;
    Ok(result)
})?;

// ✅ relâcher le GIL pendant les opérations Rust longues
Python::with_gil(|py| {
    py.allow_threads(|| {
        heavy_rust_computation() // pas d'appel Python ici
    })
})?;
```

- `py.allow_threads(|| { ... })` pour tout traitement CPU-bound ou I/O Rust — évite de bloquer l'interpréteur Python
- Ne jamais tenir le GIL pendant une attente bloquante (sleep, I/O, lock Rust)
- `Py<T>` (smart pointer GIL-independent) pour stocker des références Python sans tenir le GIL

## Conversions de types

```rust
// ✅ FromPyObject pour convertir Python → Rust
#[pyfunction]
fn sum_list(items: Vec<f64>) -> f64 {
    items.iter().sum()
}

// ✅ IntoPy pour retourner Rust → Python
#[pyfunction]
fn get_config(py: Python<'_>) -> PyObject {
    let dict = PyDict::new(py);
    dict.set_item("key", "value").unwrap();
    dict.into()
}

// ❌ PyAny sans validation de type — peut paniquer au cast
#[pyfunction]
fn bad(val: &PyAny) -> i64 {
    val.extract::<i64>().unwrap() // panic si val n'est pas un int
}
```

- Préférer les types Rust concrets (`Vec<f64>`, `String`, `HashMap<String, i64>`) dans les signatures — PyO3 génère la validation automatiquement
- `.extract::<T>()` retourne `PyResult<T>` — toujours propager avec `?`

## Propagation d'erreurs

```rust
// ✅ mapper les erreurs Rust vers des exceptions Python explicites
use pyo3::exceptions::{PyValueError, PyIOError, PyRuntimeError};

#[pyfunction]
fn read_file(path: &str) -> PyResult<String> {
    std::fs::read_to_string(path)
        .map_err(|e| PyIOError::new_err(e.to_string()))
}

// ✅ type d'erreur custom mappé automatiquement si From<MyError> for PyErr est implémenté
impl From<AppError> for PyErr {
    fn from(err: AppError) -> PyErr {
        PyRuntimeError::new_err(err.to_string())
    }
}
```

- Choisir l'exception Python sémantiquement correcte : `PyValueError` (bad input), `PyIOError` (I/O), `PyRuntimeError` (état interne), `PyTypeError` (mauvais type)
- Ne jamais retourner `Ok(())` en cas d'erreur silencieuse — Python s'attendrait à un succès

## Structure du module

```rust
// ✅ module minimal bien structuré
#[pymodule]
fn lyremember(_py: Python<'_>, m: &PyModule) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(phonetic_match, m)?)?;
    m.add_class::<PhoneticIndex>()?;
    Ok(())
}

// ✅ classe Python exposée depuis Rust
#[pyclass]
struct PhoneticIndex {
    inner: HashMap<String, Vec<u32>>,
}

#[pymethods]
impl PhoneticIndex {
    #[new]
    fn new() -> Self {
        PhoneticIndex { inner: HashMap::new() }
    }

    fn search(&self, query: &str) -> Vec<u32> {
        self.inner.get(query).cloned().unwrap_or_default()
    }
}
```

- `#[pyclass(frozen)]` pour les structs immutables exposées — permet à Python de les utiliser dans des sets ou comme clés de dict
- Éviter d'exposer des types `#[pyclass]` contenant des `Rc<T>` ou `RefCell<T>` — non thread-safe, interdit par PyO3

## Thread safety

- `#[pyclass]` doit implémenter `Send` — les types `Rc<T>`, `*mut T`, `RefCell<T>` l'en empêchent
- Pour l'état mutable partagé dans un `#[pyclass]` : `Arc<Mutex<T>>` uniquement
- `Py<T>` est `Send` + `Sync` — peut être stocké dans du code Rust multi-thread

## Anti-patterns à signaler

| Anti-pattern | Détection | Risque |
|---|---|---|
| `.unwrap()` dans `#[pyfunction]` / `#[pymethods]` | grep | Panic = UB côté Python |
| GIL tenu pendant I/O ou computation lourde | revue | Bloque l'interpréteur Python |
| `format!()` pour construire du code Python évalué | grep | Injection de code |
| `PyAny::extract().unwrap()` | grep | Panic si mauvais type |
| `Rc<T>` dans un `#[pyclass]` | compiler | Non-Send, refused by PyO3 |
| Appel Python sans `Python::with_gil` | grep `py_module\|call_method` | Undefined behavior si GIL non tenu |
