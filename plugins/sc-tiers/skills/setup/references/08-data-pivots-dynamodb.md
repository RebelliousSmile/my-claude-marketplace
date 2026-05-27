---
paths:
  - "**/dynamodb.*"
  - "**/*Dynamo*.ts"
  - "**/aws-sdk/**/*.ts"
  - "serverless.yml"
---

# Data pivots — DynamoDB

Stack-specific overrides for data audits when `@aws-sdk/client-dynamodb` or `@aws-sdk/lib-dynamodb` is detected. Loaded by `data-optimize`. Concatenate with backend pivots.

## §0 — Pre-flight

- CloudWatch metrics : `ConsumedReadCapacityUnits`, `ConsumedWriteCapacityUnits`, throttling events
- Mode billing : **On-Demand** (pay-per-request) vs **Provisioned** (RCU/WCU réservés) — auditer cost/load patterns
- DAX (DynamoDB Accelerator) considéré si reads > 90% du workload sur dataset stable

## §1 — Query vs Scan (CRITIQUE)

- `Scan` lit la TABLE ENTIÈRE puis filtre → coût × volume × frequency = explosion
- **Bannir `Scan` en runtime** ; uniquement pour analytics/ETL ponctuels avec `Parallel Scan` et `Limit`
- `Query` (sur PK + SK) ou `GetItem` (sur full PK) = O(1) coût fixe
- `BatchGetItem` (max 100 keys, 16 MB total) pour bulk lookup

## §2 — Access patterns (single-table design)

- Une table DynamoDB modélise TOUS les access patterns du domaine (single-table design)
- PK + SK composés (`USER#123` / `POST#2026-01-01#abc`) pour groupes hiérarchiques
- GSI (Global Secondary Index) par access pattern alternatif — coûte 1 write supplémentaire par index
- Lister tous les access patterns AVANT de modéliser ; les modifier après = migration douloureuse

## §3 — Pagination

- `LastEvaluatedKey` retourné si résultat > 1 MB OU `Limit` atteint
- Toujours passer `ExclusiveStartKey: lastEvaluatedKey` à la query suivante
- Pas d'offset natif (volontaire — design key-value)

## §4 — Throttling

- Provisioned : si bursts > RCU/WCU → throttling 400 `ProvisionedThroughputExceededException`
- Auto-scaling activé via `scaleTargetValue: 70` (cible 70% utilisation)
- Hot partition : `KeyCount / ItemCount` skewed → distribuer via suffix random (`USER#123#shard1..N`) si counter contesté

## §5 — Item size

- Item max 400 KB — au-delà, stocker en S3 et référencer
- `Update` qui shrink l'item ne réduit pas le WCU (1 WCU par 1 KB écrit)
- `ProjectionExpression` pour ne récupérer que les attributs nécessaires (économise réseau, pas RCU)

## §6 — Transactions

- `TransactWriteItems` (max 100 items, atomic) ; coût 2× WCU vs writes simples
- `TransactGetItems` (max 100 items) ; coût 2× RCU
- Idempotency via `ClientRequestToken` → retries safe

## §7 — Streams & TTL

- DynamoDB Streams → Lambda trigger pour CDC ; coût Lambda + stream reads à compter
- `TimeToLive` attribute : DynamoDB delete async sous 48h (pas exactement à l'expiration) ; idéal pour sessions, cache

## §8 — DAX (cache)

- DAX devant lectures eventually-consistent → latence ms → μs, coût additionnel mais reduces RCU
- Cache TTL : item-level + query-level
- Pas pour writes (DAX écrit derrière)

## §9 — SDK & bundle

- `@aws-sdk/client-dynamodb` modulaire ~30 KB vs ancien `aws-sdk` monolithe ~700 KB
- `@aws-sdk/lib-dynamodb` Document Client → marshalling auto types JS ↔ DynamoDB types
- Cold start Lambda + SDK initialisation : init le client HORS du handler (réutilisation entre invocations chaudes)

## §10 — Cost auditing

- `aws ce get-cost-and-usage` avec filter sur DynamoDB → daily cost par table
- GSI listées séparément ; flag tout GSI lu < 1% du temps (coût inutile)
