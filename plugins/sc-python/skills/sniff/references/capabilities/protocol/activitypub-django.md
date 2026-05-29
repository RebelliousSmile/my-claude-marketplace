---
paths:
  - "**/activitypub/**/*.py"
  - "**/inbox*.py"
  - "**/outbox*.py"
  - "**/delivery*.py"
  - "**/activities*.py"
  - "**/federation*.py"
---

# Protocol pivot — ActivityPub / Django

Stack-specific checklist for `/ap-optimize` when a Django ActivityPub implementation is detected. Installed to `.claude/rules/07-quality/ap-pivots-django-activitypub.md` by `sc-python:sniff`.

---

## §0 — Pre-flight

- Détecter le pattern d'implémentation : custom (signals + models + tasks) vs librairie (rare en Django)
- Vérifier la présence d'un modèle `ProcessedActivity` (garde d'idempotence) :
  `grep -rn "ProcessedActivity" . --include="*.py" | head -5`
- Vérifier que `inbox` est routé vers la bonne view :
  `grep -rn "inbox" */urls.py`
- Baseline avant toute recommandation :
  ```bash
  python manage.py shell -c "from activitypub.models import ProcessedActivity; print(ProcessedActivity.objects.count())"
  redis-cli LLEN celery
  grep 'ap:delivered' /var/log/*.log | tail -1000 | awk '{print $NF}' | sort | uniq -c
  ```
- Tripwire CI : test d'idempotence + test SSRF dans la suite pytest — failure bloque le merge

## §1 — Inbox : sécurité et idempotence

- **Signature HTTP vérifiée AVANT parsing du payload** — toute view inbox qui touche au body avant `verify_signature()` est une vulnérabilité critique (AP §5.1 + convention fediverse MUST)
- **Idempotence atomique** — guard race-safe obligatoire :
  ```python
  # ✅ atomique
  _, created = ProcessedActivity.objects.get_or_create(activity_id=activity_id)
  if not created:
      return HttpResponse(status=202)

  # ❌ race condition — deux requêtes simultanées passent toutes les deux
  if ProcessedActivity.objects.filter(activity_id=activity_id).exists():
      return HttpResponse(status=202)
  ```
- **Anti-replay date skew** — rejeter les requêtes dont le header `Date` dépasse ±30s (convention fediverse universelle) :
  ```python
  from django.utils import timezone
  from datetime import timedelta

  def check_date_skew(request, max_skew_seconds=30):
      date_header = request.headers.get("Date")
      if not date_header:
          raise ValueError("Missing Date header")
      request_time = parsedate_to_datetime(date_header)
      delta = abs((timezone.now() - request_time).total_seconds())
      if delta > max_skew_seconds:
          raise ValueError(f"Date skew {delta:.0f}s exceeds limit")
  ```
- **Validation acteur ↔ keyId** — l'acteur dans le payload `activity["actor"]` doit correspondre au `keyId` de la signature — une signature valide d'un acteur tiers ne doit pas permettre d'agir au nom d'un autre
- **Rate limiting par IP + par domaine distant** — `429 Retry-After` ; bloquer les domaines `FederatedServer.BLOCKED` avant toute vérification coûteuse
- Détecter : `grep -rn "verify_signature\|check_signature" . --include="*.py"` — absente de views.py = 🔴 critique

## §2 — Delivery : fiabilité

- **`transaction.on_commit` obligatoire** avant `.delay()` — sans ça, le task peut s'exécuter avant que la transaction soit committée, causant une livraison d'une activité inexistante en DB :
  ```python
  # ✅
  transaction.on_commit(lambda: deliver_activity.delay(activity_id))

  # ❌ livraison avant commit possible
  deliver_activity.delay(activity_id)
  ```
- **Retry avec backoff exponentiel** — pas de retry linéaire :
  ```python
  @shared_task(bind=True, max_retries=5)
  def deliver_activity(self, activity_id, recipient_inbox):
      try:
          ...
      except (httpx.TransientError, httpx.TimeoutException) as exc:
          raise self.retry(exc=exc, countdown=2 ** self.request.retries * 60)
  ```
- **Un task par destinataire** — jamais un seul task qui itère sur tous les followers (perte de tolérance aux pannes par destinataire, timeout global)
- **Circuit breaker par domaine** — après N échecs consécutifs vers un domaine, passer en mode backoff ; respecter `410 Gone` → supprimer le follower local
- **Queue dédiée** `ap_delivery` — séparer de la queue Celery générale pour éviter la famine des tâches AP derrière des tâches longues
- Détecter sync delivery : `grep -rn "httpx\.\|requests\." . --include="*views*.py" --include="*inbox*.py"` — tout hit = 🔴

## §3 — Conformance AS2 / JSON-LD

- **Namespace `@context` stable** — jamais `settings.DOMAIN` dans le namespace ; utiliser `"https://www.w3.org/ns/activitystreams"` littéral (la casse du namespace entre deux domaines d'un même projet casse la federation)
- **`Content-Type` à l'envoi** : `application/ld+json; profile="https://www.w3.org/ns/activitystreams"` — pas `application/json`, pas `application/activity+json` seul
- **`id` = URL absolue** — jamais `f"/activities/{pk}"`, toujours `f"https://{settings.DOMAIN}/activities/{pk}"` (AS2 §2.0)
- **Outbox paginé** — `OrderedCollection` avec `first` pointant vers `OrderedCollectionPage` ; chaque page avec `partOf`, `next`, `prev` (AP §4.1) :
  ```python
  # Collection racine
  {"@context": "https://www.w3.org/ns/activitystreams",
   "type": "OrderedCollection",
   "id": f"https://{domain}/users/{username}/outbox",
   "totalItems": count,
   "first": f"https://{domain}/users/{username}/outbox?page=1"}

  # Page
  {"type": "OrderedCollectionPage",
   "partOf": f"https://{domain}/users/{username}/outbox",
   "next": f"https://{domain}/users/{username}/outbox?page=2",
   "orderedItems": [...]}
  ```
- **Side effects par type d'activité** — `Follow` → créer `FollowRequest` en DB ; `Undo(Follow)` → supprimer ; `Delete` → marquer `Tombstone` ; ne jamais ignorer silencieusement une activité reçue (AP §7.1)
- Détecter : `grep -rn '"@context"' . --include="*.py"` — vérifier que la valeur est la string littérale W3C, pas une f-string avec `settings.DOMAIN`

## §4 — SSRF

- **Allowlist ou denylist stricte** sur tous les fetch sortants d'acteurs — rejeter avant la connexion :
  ```python
  import ipaddress
  from urllib.parse import urlparse

  _BLOCKED_PREFIXES = ("localhost", "127.", "::1", "0.", "169.254.", "10.", "192.168.")
  _BLOCKED_RANGES = [ipaddress.ip_network(r) for r in ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "169.254.0.0/16"]]

  def validate_remote_url(url: str) -> None:
      parsed = urlparse(url)
      if parsed.scheme != "https":
          raise ValueError(f"Non-HTTPS actor URL rejected: {url}")
      host = parsed.hostname or ""
      if any(host.startswith(p) or host == p.rstrip(".") for p in _BLOCKED_PREFIXES):
          raise ValueError(f"SSRF blocked: {url}")
      try:
          addr = ipaddress.ip_address(host)
          if any(addr in net for net in _BLOCKED_RANGES):
              raise ValueError(f"SSRF blocked (private range): {url}")
      except ValueError:
          pass  # hostname, not IP — OK
  ```
- **Timeout sur fetch acteur** : `httpx.Timeout(connect=5.0, read=10.0)` — sans timeout, un acteur distant lent bloque le worker
- **Vérifier HTTPS obligatoire** en prod — rejeter tout acteur avec URL `http://`
- Détecter : `grep -rn "fetch_actor\|get_actor\|httpx\.get\|requests\.get" . --include="*.py" -A 2 | grep -v "validate\|allowlist\|127\.\|localhost"` — hit sans validation = 🔴 OWASP A10

## §5 — Observability

- **Logger chaque inbox POST** avec résultat : accepté / rejeté (signature invalide) / dupliqué (idempotence) / acteur inconnu :
  ```python
  logger.info("ap:inbox actor=%s activity_id=%s result=%s", actor, activity_id, result)
  ```
- **Logger chaque delivery** avec résultat, domaine destinataire et durée :
  ```python
  logger.info("ap:delivered inbox=%s status=%d duration=%.2fs", inbox_url, resp.status_code, elapsed)
  logger.error("ap:delivery_failed inbox=%s error=%s attempt=%d", inbox_url, exc, attempt)
  ```
- **Compteurs déterministes** (mesurables sans APM) :
  - `ProcessedActivity.objects.count()` — total inbox traités
  - `redis-cli LLEN ap_delivery` — profondeur queue delivery
  - Ratio delivered_ok / (delivered_ok + delivered_fail) sur les 24h — alerter si < 90%
- Alerting : queue depth > 1 000 ou delivery failure rate > 10% → alerte

## §6 — Verification

- **Test idempotence** : POST du même `activity_id` deux fois → un seul `ProcessedActivity` créé, second retourne HTTP 202 sans side effect
- **Test SSRF** : acteur avec URL `http://127.0.0.1/evil` → rejeté en 400 avant connexion
- **Test anti-replay** : header `Date` à `-31s` → rejeté en 401 ; header `Date` à `+31s` → rejeté en 401 ; header `Date` à `±29s` → accepté
- **Test signature** : payload modifié après signature → rejeté en 401
- **Test delivery retry** : inbox destinataire retourne 500 → task retenté avec backoff ; compteur d'erreur incrémenté
- Critère déterministe : `ProcessedActivity.objects.count()` avant et après → delta = 1 pour un nouveau `activity_id`, delta = 0 pour un dupliqué
