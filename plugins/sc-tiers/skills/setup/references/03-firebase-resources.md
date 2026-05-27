# Firebase resource controls

## Firestore query rules (MUST follow)

- Every `query()` MUST include `limit()` — a query without limit can read thousands of documents and explode quota
- Use `getAggregateFromServer()` with `count()` for totals — free up to 1M/day, never use `getDocs().length`
- Paginate with cursors (`startAfter` + `limit`) for lists > 50 items
- No Firestore queries inside loops — batch with `documentId()` `in` clause (max 30 per batch, chunk larger arrays)
- Cache static/reference data in Pinia store with TTL (5min default) — avoid redundant reads
- `limit()` value should stay ≤ 100 for client queries; higher values need justification

## Security rules

- No `allow read, write: if true` on collections containing user data
- Always verify `request.auth.uid` matches document owner for private data
- Avoid `get()` calls in security rules hot paths — each `get()` counts as an additional read
- Admin role checked via custom claims (`request.auth.token.admin == true`), not via Firestore document lookup in rules

## Quota awareness

- **Spark plan free tier:** 50,000 reads/day, 20,000 writes/day, 1GB storage
- **Blaze plan:** $0.06/100K reads, $0.18/100K writes
- `onSnapshot` (Firestore data listeners) count 1 read per document on initial load + 1 read per changed document — unsubscribe in component `onUnmounted`. Auth listeners (`onAuthStateChanged`) are covered by the auth-listeners rule
- Cloud Functions invocations and egress have separate quotas — keep function payloads small

## Anti-patterns

```javascript
// ❌ Query without limit
const q = query(collection(db, "users"))

// ❌ getDocs for counting
const snapshot = await getDocs(q)
const total = snapshot.docs.length

// ❌ Query in loop (N+1)
for (const id of ids) {
  await getDoc(doc(db, "users", id))
}

// ❌ get() in security rules for role check
function isAdmin() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

```javascript
// ✅ Always limit
const q = query(collection(db, "users"), limit(50))

// ✅ count() for totals
const { totalCount } = (await getAggregateFromServer(q, { totalCount: count() })).data()

// ✅ Batch read (client-side — max 30 per in clause, chunk larger arrays)
const batchQuery = query(collection(db, "users"), where(documentId(), "in", ids.slice(0, 30)), limit(30))

// ✅ Custom claims for admin
request.auth.token.admin == true
```
