---
paths:
  - "**/firebase.config.*"
  - "**/firebase-admin.*"
  - "**/firestore.rules"
  - "**/firestore.indexes.json"
  - "**/composables/useFirestore*.ts"
  - "**/composables/useAuth*.ts"
---

# Data pivots — Firebase / Firestore

Stack-specific overrides for data audits when `firebase` is detected. Loaded by `data-optimize`. Concatenate with framework pivots (Nuxt, Vue SPA, etc.).

## §0 — Pre-flight

- Firebase Console → Usage tab : reads, writes, deletes par jour ; flag tout pic anormal
- Bundle cost : auditer `import { ... } from 'firebase/firestore'` vs `import 'firebase/firestore'` (le 2nd inline tout, le 1st tree-shake)
- Coût $ Firestore = (reads + writes + deletes) × volume — **chaque doc lu compte**, même filtré côté client

## §1 — Reads accounting (CRITIQUE)

- `getDocs(query(collection, where(...), limit(N)))` → N reads (servi par index Firestore)
- `getDocs(collection)` SANS limit → **autant de reads que de docs** = facture explosée
- Subcollections : `collectionGroup('comments')` → tous les `comments` de tous les parents (auditer limit + index)

## §2 — Real-time listeners

- `onSnapshot()` : 1 read par doc retourné à l'init + 1 read par modif détectée
- Cleanup obligatoire (`unsubscribe()` retour) dans `onUnmounted` / `useEffect` cleanup
- N composants montés simultanément avec `onSnapshot` sur la même query → N listeners (pas dédupliqué)
- Préférer `getDocs()` one-shot si données pas critique-realtime → 1 read fixe vs listener qui peut "lag-burst"
- **`onAuthStateChanged`** : voir rule `04-firebase-auth-listeners.md` — cleanup pattern one-shot

## §3 — Pagination

- `query(collection, orderBy('createdAt', 'desc'), limit(20), startAfter(lastDoc))`
- `startAfter` (cursor) > pas d'offset natif — Firestore force cursor-based, c'est sain
- Toujours stocker le `lastDoc` (DocumentSnapshot) pour la page suivante, pas seulement la valeur du champ

## §4 — Indexes

- `firestore.indexes.json` versionné dans le repo + `firebase deploy --only firestore:indexes`
- Single-field : auto-indexé sauf désactivé
- Composite indexes : nécessaires dès que `where(a, op, x).where(b, op, y).orderBy(c)` — Firebase Console suggère via URL d'erreur en dev
- Trop d'indexes = coût write × indexes ; auditer les `single-field exemptions` pour colonnes non-filtrées

## §5 — Security rules

- `firestore.rules` testées via `firebase emulators:start` + `@firebase/rules-unit-testing`
- Règle classique : `allow read: if request.auth != null && resource.data.userId == request.auth.uid`
- `get()` / `exists()` dans les rules = reads facturables → minimiser (chaque rule eval avec `get` coûte un read)

## §6 — Batched reads & writes

- `Promise.all([getDoc(a), getDoc(b), getDoc(c)])` exécute en parallèle (3 reads)
- `writeBatch()` pour writes atomiques (max 500 ops/batch)
- `runTransaction()` pour read-then-write avec conflict detection

## §7 — Storage des tokens Auth

- Firebase Auth stocke son token en **IndexedDB** (`firebaseLocalStorageDb`), PAS en localStorage
- Absence de `document.cookie` / `localStorage.token` au grep n'est PAS un faux négatif — comportement attendu
- Custom claims : `getIdTokenResult()` pour les lire ; ne pas spam, cache côté composable

## §8 — Cloud Functions

- Cold start : 1-3s pour Node 20, plus si dépendances lourdes ; auditer le bundle de chaque function (`firebase functions:config:get`)
- Min instances (`runWith({ minInstances: 1 })`) coûte mais élimine cold start sur endpoints critiques
- Gen2 (Cloud Run) > Gen1 (Cloud Functions) pour throughput / mémoire

## §9 — Quotas

- Free tier : 50k reads/jour, 20k writes/jour, 1 GB storage — auditer si projet en pré-launch
- Quotas par BDD : 1M reads/sec sustained mais 10k reads/sec contre un seul doc = hotspot
- Sharding pour counters fortement contestés (ex: views, likes) : pattern shards distribués
