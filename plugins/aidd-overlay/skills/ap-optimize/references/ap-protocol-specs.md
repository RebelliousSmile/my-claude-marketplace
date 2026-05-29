# AP Protocol Specs — Référence normative

> Équivalent de `w3c-perf-specs.md` pour web-optimize. Chaque entrée lie un pattern audit à sa source normative. Consulter avant de déclarer un finding — une recommandation sans ancrage spec est rejetée.

---

## W3C ActivityPub (REC 2018-01-23)

| § | Pattern | Critère normative |
|---|---------|-------------------|
| 3.1 | `actor` doit être une URL déréférençable | "Actors MUST have a unique global identifier" |
| 4.1 | Outbox = `OrderedCollection` | "The outbox MUST be an OrderedCollection" |
| 5.1 | Inbox POST accepte `application/activity+json` | "The server MUST accept POST requests" |
| 5.2 | Livraison via POST sur l'inbox de chaque destinataire | "The server MUST deliver activities to the inboxes" |
| 6.1 | `@context` obligatoire sur tout objet AS2 | "All objects MUST include the ActivityStreams context" |
| 7.1 | Side effects côté serveur (Create, Update, Delete, Follow…) | "Servers MUST perform the side effects" |

Source: https://www.w3.org/TR/activitypub/

---

## W3C Activity Streams 2.0 (REC 2017-05-23)

| § | Pattern | Critère normative |
|---|---------|-------------------|
| 2.0 | `id` doit être une URL absolue | "The id property expresses the global identifier" |
| 2.0 | `type` obligatoire | "The type property is used to identify the type" |
| 4.1 | `Object` : propriétés de base (`id`, `type`, `name`, `content`, `published`) | Core vocabulary |
| 5.1 | `OrderedCollectionPage` : `partOf`, `next`, `prev` | Collection paging |
| 6.0 | `Activity` : `actor`, `object`, `target` | Activity structure |

Source: https://www.w3.org/TR/activitystreams-core/

---

## HTTP Signatures (draft-cavage-http-signatures-12)

| Pattern | Critère |
|---------|---------|
| Headers signés obligatoires | `(request-target)`, `host`, `date`, `digest` |
| Algorithme recommandé | `rsa-sha256` |
| `Date` header skew max | 30 secondes (convention fediverse) |
| `Digest` header | `SHA-256=<base64(sha256(body))>` |
| Clé publique exposée | `actor.publicKey.publicKeyPem` (PEM format) |
| `keyId` | URL stable et déréférençable vers la clé publique de l'acteur |

Source: https://datatracker.ietf.org/doc/html/draft-cavage-http-signatures-12

Note: La spec a évolué vers `http-message-signatures` (RFC 9421, 2024). Le fediverse utilise encore massivement draft-12 — ne pas migrer unilatéralement sans compatibilité descendante.

---

## WebFinger (RFC 7033)

| Pattern | Critère |
|---------|---------|
| Endpoint | `GET /.well-known/webfinger?resource=acct:user@domain` |
| Réponse | `application/jrd+json` avec `links[rel="self"]` pointant vers l'acteur AP |
| `subject` | Doit correspondre exactement à la ressource demandée |

Source: https://www.rfc-editor.org/rfc/rfc7033

---

## Conventions fediverse (non normatives, largement adoptées)

| Pattern | Source |
|---------|--------|
| Soft delete via `Tombstone` | Mastodon, Pleroma, Misskey |
| `sensitive: true` + `summary` pour contenu sensible | Extension Mastodon |
| `Hashtag` comme `tag` d'objet | Extension AS2 commune |
| `Mention` comme `tag` avec `href` | Extension AS2 commune |
| `manuallyApprovesFollowers` sur acteur | Extension Mastodon |
| Inbox partagée (`sharedInbox`) pour fan-out optimisé | Extension Mastodon |

---

## Anti-patterns normativement disqualifiés

| Anti-pattern | Violation |
|---|---|
| `id` relatif (ex. `/activities/123`) | AS2 §2.0 — doit être URL absolue |
| Livraison synchrone dans la view | AP §5.2 — aucune obligation de synchronisme, mais bloque la réponse |
| Inbox sans vérification de signature | AP §5.1 — "SHOULD" vérifier, convention fediverse = MUST |
| Outbox sans pagination | AP §4.1 — `OrderedCollection` sans `first` = non conforme |
| Fetch acteur sans cache | Non normatif mais pattern universel — fetch/request = DoS sur instances populaires |
| SSRF sur URL acteur non validée | OWASP A10 — Server-Side Request Forgery |
| Livraison avant `transaction.on_commit` | AP §5.2 — une activité livrée avant le commit de la transaction référence un objet inexistant en DB côté destinataire ; le task doit être enqueué via `transaction.on_commit(lambda: deliver.delay(...))` |
| Activités de réponse non signées (Accept, Reject, Announce) | HTTP Signatures draft-12 — toute activité sortante doit être signée ; `Accept` et `Reject` sont des activités à part entière, pas de simples ACKs HTTP ; l'absence de signature les rend ignorées par les pairs stricts (Mastodon 4+, Misskey) |
| Cache de clé publique sans TTL + sans invalidation sur `Update Person` | Convention fediverse — une clé en cache sans TTL empêche la rotation de clé chez un pair ; recevoir `Update(Person)` sans invalider le cache local casse silencieusement la vérification de signature après une rotation |
| Implémentation inbox sécurisée non routée (code mort) | AP §5.1 — si la view routée dans `urls.py` diffère de l'implémentation avec vérification de signature, les contrôles de sécurité sont inopérants en production ; vérifier systématiquement que la view importée dans le routeur est celle qui contient la logique de sécurité |
| `coverage.omit` ou `# pragma: no cover` sur les chemins AP critiques | Sécurité — omit les chemins de vérification de signature, d'idempotence et de livraison de la couverture de test crée un faux sentiment de sécurité ; les chemins AP critiques doivent avoir une couverture de test explicite |
