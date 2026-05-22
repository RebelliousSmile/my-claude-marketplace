# 02 - challenge

Audit `bank.yml` for path integrity and lore-vs-code consistency. Read-only — never writes files.

## Inputs

- `bank_yml` (required) - path to `bank.yml` (default: `aidd_docs/memory/internal/bank.yml`)

## Outputs

```
## Bank Challenge Report — <date>

### Path integrity
| Resource | Path | Status |
|---|---|---|
| lore.bible | aidd_docs/memory/external/bible-jeu.md | ✅ |
| code.linter | scripts/tools/dtl_linter.gd | ❌ missing |

### Lore-vs-code mismatches
- `variables-register.md` declares flag `flag_new_x` but no `.dtl` references it
- `bible-jeu.md` mentions PNJ `Yasmine` but `PNJ_VALIDES` in `DialogicBridge.gd` does not include her

### Personas
| Persona | File | Loads valid |
|---|---|---|
| margot-joueuse | ✅ | ✅ |
| dramaturge | ✅ | ⚠️ loads lore.architecture (field not in bank) |

### Summary
- <N> paths OK · <M> missing · <P> lore-code mismatches
```

## Process

1. **Read `bank.yml`**.
2. **Path integrity check**: for every path declared in every section, check `fs.existsSync`. Mark ✅ / ❌.
3. **Lore-vs-code cross-check**:
   - Read `variables-register.md` — list all declared flags, factions, countdowns.
   - Grep `dialogic/timelines/` for usage of each. Flag declared-but-never-used items as ⚠️.
   - Read `bible-jeu.md` — list PNJ names. Cross-check against `PNJ_VALIDES` in `DialogicBridge.gd`. Flag mismatches.
4. **Persona loads check**: for each persona in `bank.yml`, verify its `loads` list only references keys that exist in `bank.yml` sections.
5. **Print report** to stdout. Never write any file.

## Test

Report printed to stdout contains a `### Path integrity` table where every row has a non-empty `Status` cell (✅ or ❌), and a `### Summary` line with counts.
