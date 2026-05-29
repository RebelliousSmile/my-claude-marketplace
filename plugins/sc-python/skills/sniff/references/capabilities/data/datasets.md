---
paths:
  - "**/pipelines/**/*.py"
  - "**/data/**/*.py"
  - "**/datasets/**/*.py"
  - "**/training/**/*.py"
---

# Data pivots — HuggingFace datasets

Stack-specific overrides for data audits when `datasets` (HuggingFace) is detected. Loaded by `data-optimize`.

## §0 — Pre-flight

- `load_dataset(...)` sans `streaming=True` sur un corpus > 1 Go = chargement RAM complet
- Détecter : `grep -rn "load_dataset(" . --include="*.py" | grep -v "streaming=True"` — appels sans streaming suspects sur gros corpus
- Cache par défaut : `~/.cache/huggingface/datasets/` — vérifier que le disque est suffisant avant le premier run
- Baseline RAM : `python -c "from datasets import load_dataset; d = load_dataset(...); print(d.dataset_size)"` avant de passer en prod

## §1 — N+1 (row-by-row access)

- Itération directe `for row in dataset` = anti-pattern sur gros volumes — pas d'I/O réseau mais CPU/mémoire non optimisé
- **Fix** : `.map(function, batched=True, batch_size=1000)` pour traitement vectorisé par batch
- Détecter : `grep -rn "for .* in dataset\|for .* in train_data\|for .* in ds\b" . --include="*.py"` — itération directe dans une boucle
- `batch_size=1000` est un bon défaut ; ajuster selon RAM disponible (nb_rows × taille_par_row)

## §2 — Streaming (select narrowing + pagination)

- Corpus > 1 Go : `load_dataset(..., streaming=True)` → `IterableDataset` ; ne charge jamais tout en mémoire
- `dataset.take(N)` pour pré-visualiser sans charger l'intégralité
- `dataset.skip(N)` pour reprendre après une interruption (streaming)
- Filtrage avant map : `dataset.filter(lambda x: x["lang"] == "fr")` avant `.map(process)` — réduire le volume tôt
- Sous-ensembles déterministes : `dataset.select(range(start, end))` ou slices nominaux (`train`, `test`, `validation`)

## §3 — Real-time

N/A — `datasets` est un loader batch ; pour les pipelines temps réel, utiliser un message broker (Kafka, Redis Streams) et une fenêtre glissante.

## §4 — Caching

- `cache_dir` explicite en prod : `load_dataset(..., cache_dir="/data/hf_cache")` → éviter `~/.cache` sur disque OS plein
- Désactiver le cache si corpus en mutation : `load_dataset(..., download_mode="force_redownload")` ou `dataset_dict.cleanup_cache_files()`
- `.map(fn, cache_file_name="processed.arrow")` pour mettre en cache le résultat d'un `.map()` coûteux
- `datasets.disable_caching()` uniquement pour tests — jamais en prod (recalcul complet à chaque run)

## §5 — Payload optimization

- Sélectionner les colonnes nécessaires : `dataset.select_columns(["text", "label"])` — réduire I/O et RAM
- `dataset.remove_columns(["metadata", "url"])` pour supprimer les champs non utilisés après map
- Conversion de format : `.to_pandas()` pour analyse ponctuelle ; `.to_torch_dataset()` / `.to_tf_dataset()` pour l'entraînement — éviter la conversion intermédiaire en Python pur
- `dataset.cast_column("label", ClassLabel(names=["neg", "pos"]))` → encodage plus compact
- Détecter overfetch : colonnes chargées mais non consommées en aval → tracer les colonnes entre `load_dataset` et le modèle

## §6 — Quota & cost

- HuggingFace Hub : téléchargements comptabilisés par token API — `HF_TOKEN` en env var, jamais hardcodé
- Gros datasets Parquet (`wikipedia`, `c4`) : téléchargement une seule fois → cache local obligatoire
- `dataset.save_to_disk("/data/my_dataset")` + `load_from_disk("/data/my_dataset")` pour éviter les re-téléchargements en CI/CD
- `num_proc=os.cpu_count()` dans `.map()` → parallélisation sur CPU disponibles ; ajuster pour éviter OOM sur serveurs à forte concurrence

## §7 — Security

- `load_dataset(..., trust_remote_code=True)` : UNIQUEMENT pour des dépôts vérifiés — exécute du code Python arbitraire du Hub
- Ne jamais logger le contenu brut de datasets contenant des PII (noms, emails, numéros) — masquer avant logging
- `HF_TOKEN` : lire depuis `os.environ["HF_TOKEN"]`, jamais en clair dans le code

## §8 — Schema & indexing

- `DatasetDict` : structure canonique `{"train": ..., "validation": ..., "test": ...}` — respecter les splits nominaux
- `dataset.features` : vérifier le schema avant `.map()` — une colonne manquante provoque une `KeyError` silencieuse dans certains backends
- `dataset.cast(new_features)` pour migrer un schema Arrow sans rechargement
- `dataset.flatten()` pour aplatir les colonnes imbriquées (JSON nested → colonnes plates)

## §9 — Background jobs

- `.map(fn, num_proc=N)` utilise `multiprocessing` → ne pas passer de ressources non-picklables (connexions DB, locks)
- Streaming dans un worker Celery/arq : `IterableDataset` est sérialisable mais stateful — créer une nouvelle instance par job
- Idempotence : `cache_file_name` explicite dans `.map()` → même call = même résultat → workers idempotents

## §10 — Verification

- Critère déterministe : RAM peak via `tracemalloc` + temps de chargement via `time.perf_counter()` — comparer avant/après streaming
- `dataset.info.dataset_size` (bytes) + `len(dataset)` (lignes) pour caractériser le volume
- `datasets.logging.set_verbosity_info()` pour afficher la progression du téléchargement et du map

## §11 — Self-audit

- `streaming=True` interdit `dataset.shuffle()` avec seed fixe → utiliser `IterableDataset.shuffle(buffer_size=10000, seed=42)`
- Gaps : pas de section sur `datasets.interleave_datasets()` pour mixer plusieurs sources avec ratio pondéré ; pas de section sur `datasets.concatenate_datasets()`
