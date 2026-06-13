# Data-integrity checker pattern (optional companion to a scenario suite)

For targets backed by **data** (tables, decks, rulesets, a directory convention), a behavioural suite judges *behaviour* but cannot cheaply assert the **invariants of the underlying data**. A small, deterministic Python checker complements it: reproducible, no network, no runtime — it reads the data on disk and asserts the invariants the target relies on.

Use it when a target's correctness depends on data shape (e.g. "the deck has exactly 54 cards", "this directory layout is conformant", "every row maps to a valid outcome"). Skip it for purely conversational targets.

## Shape

```python
#!/usr/bin/env python3
"""<one line: what invariants this asserts, for which target>.
Run: python <name>.py [start-dir]. Read-only; exit 0 if all PASS, 1 otherwise.
WARN lines never fail the run (advisory drift)."""
import sys, pathlib
sys.stdout.reconfigure(encoding="utf-8")

# 1) Resolve the data ROBUSTLY — mirror the target's OWN resolution logic, not a rigid path.
#    Walk up from the start dir; accept the first location that holds the data, across the
#    layouts the target accepts. Never hard-code one absolute path.
START = (pathlib.Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else pathlib.Path.cwd()).resolve()
def resolve(name):
    for base in (START, *START.parents):
        for tmpl in ("<candidate>/{n}", "<other-candidate>/{n}"):
            p = base / tmpl.format(n=name)
            if (p / "<index-file>").is_file():
                return p
    sys.exit(f"'{name}' not found walking up from {START}")

fails, warns = [], []
def check(name, ok, detail=""):
    fails.append(not ok); print(f"  [{'PASS' if ok else 'FAIL'}] {name}{(' — '+detail) if detail else ''}")
def warn(name, ok, detail=""):
    if not ok: warns.append(name); print(f"  [WARN] {name}{(' — '+detail) if detail else ''}")

# 2) Assert the invariants the target relies on (counts, distributions, exclusions, conformance).
#    Distinguish FAIL (malformed → breaks the target) from WARN (advisory drift, e.g. pipeline pending).

# 3) Summary + exit code.
n, ko = len(fails), sum(fails)
print(f"\n{n-ko}/{n} checks PASS" + (f" — {len(warns)} WARN" if warns else ""))
sys.exit(1 if ko else 0)
```

## Conventions

- **Mirror the target's resolution logic.** If the target (skill/agent) locates its data with a robust multi-location search, the checker must use the **same** logic — otherwise the checker passes/fails on a path the target would never use. Parity is the point.
- **FAIL vs WARN.** FAIL = malformed data that breaks the target (wrong count, missing required file, illegal combination present). WARN = advisory drift that doesn't break the target (a not-yet-processed input, an optional-but-absent file). WARN never sets the exit code.
- **Read-only, no side effects.** Like the dry-run judge, the checker never writes. It reads the data and reports.
- **Run it as a pre-flight** for the behavioural suite: a fixture that fails the checker is malformed and invalidates the behavioural run — say so in the suite's "Fixture / preconditions".
- **Exit code is the contract.** 0 = all invariants hold; 1 = at least one FAIL. Suitable for CI / a regression gate.
- **Validate on a real fixture.** A discriminating checker should PASS a known-good fixture and FAIL a known-bad one — verify both when authoring it.
