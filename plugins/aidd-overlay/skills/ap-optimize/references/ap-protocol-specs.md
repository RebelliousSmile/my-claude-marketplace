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
