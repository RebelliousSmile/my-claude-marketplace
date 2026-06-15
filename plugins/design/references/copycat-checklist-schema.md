# Copycat checklist — schema (resumable, mid-integration)

> Lets copycat join a project ALREADY underway (not only greenfield) and resume safely.
> The checklist is the unit of human-visible progress; `define` (bulk extraction) and
> `enforce` (drift gate) each keep one. Stored in the TARGET project (e.g.
> `design/copycat-checklist.json`), source-controlled.
>
> **State detection over assumption**: on every run, statuses are (re)derived from the
> LIVE target (existing tokens/components, and — in drift mode — the rendered page).
> A unit already faithful is set done, not redone. Runs are **idempotent**: only units
> not yet terminal are processed.

## Bulk checklist (define / extraction)

One row per page (replication unit). Statuses progress left→right.

| field | meaning |
|-------|---------|
| `page` | mockup key / URL |
| `status` | `todo` → `measured` → `proposed` → `aggregated` → `signed-off` |
| `breakpoints` | which bands had a mockup source vs were derived |
| `oracle_report` | path to the measure.py JSON for this page |
| `model` | model used (sonnet default; haiku/opus per pre-signal) |
| `notes` | conflicts raised, derived flags |

Resume rule: a run spawns agents only for pages whose `status` is not `signed-off`.

```json
{
  "mode": "bulk",
  "generated_at": "<ts>",
  "units": [
    { "page": "mentions-legales", "status": "measured", "breakpoints": {"desktop":"measured","mobile":"measured","tablet":"derived"}, "oracle_report": "out/mentions-legales.json", "model": "haiku", "notes": "eyebrow missing on target" }
  ]
}
```

## Drift checklist (enforce / fidelity gate)

One row per component (or page-section). Used mid-integration to drive deltas to 0.

| field | meaning |
|-------|---------|
| `unit` | component key / section |
| `status` | `todo` → `measured` → `remediating` → `passed` (delta 0 or ledgered) |
| `breakpoints` | per-band pass state |
| `deviation_refs` | ledger ids if a tolerated deviation was recorded |

Resume rule: re-measure only units whose `status` is not `passed`.

```json
{
  "mode": "drift",
  "generated_at": "<ts>",
  "units": [
    { "unit": "c.hero-title", "status": "remediating", "breakpoints": {"desktop":"passed","mobile":"todo"}, "deviation_refs": [] }
  ]
}
```

## Invariants

- A terminal status (`signed-off` / `passed`) is only set after the gate/checkpoint, never assumed.
- Editing the live target between runs is fine: the next run re-detects state and may re-open a unit.
- The checklist references — it does not duplicate — the correspondence table rows and ledger ids.
