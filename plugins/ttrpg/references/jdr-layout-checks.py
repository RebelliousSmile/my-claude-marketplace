#!/usr/bin/env python3
"""Layout-conformance linter for a JDR game domain `R` (see jdr-layout.md).

Pre-flight for the behavioural test suites (campaign/pc/solo-mc): asserts that a *real,
populated* domain respects the local layout convention before any behavioural run is
trusted. A domain that fails here invalidates the behavioural results.

Run: `python jdr-layout-checks.py [chemin-vers-domaine-R]`.

The domain `R` is resolved **locally** (no global config): from the reference directory
(optional CLI arg, else CWD), walk up to the first parent holding one of the domain
markers `_campagnes/`, `_univers/` or `_pjs/`. See this dir's `jdr-layout.md`.

Checks are structural only — they read the tree on disk, never the plugin runtime.
Exit 0 if all PASS, 1 otherwise. WARN lines never fail the run (advisory drift).
"""
import re, sys, pathlib

sys.stdout.reconfigure(encoding="utf-8")

MARKERS = ("_campagnes", "_univers", "_pjs")
KEBAB = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")   # portable slug
YEAR = re.compile(r"^\d{4}$")
MONTH = re.compile(r"^(0[1-9]|1[0-2])$")

def domain_root():
    start = pathlib.Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else pathlib.Path.cwd()
    start = start.resolve()
    for d in (start, *start.parents):
        if any((d / m).is_dir() for m in MARKERS):
            return d
    sys.exit("domaine R introuvable : aucun marqueur _campagnes/, _univers/ ou _pjs/ "
             f"en remontant depuis {start} (passer le chemin du domaine en argument)")

R = domain_root()
fails, warns = [], []
def check(name, ok, detail=""):
    fails.append(not ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}{(' — ' + detail) if detail else ''}")
def warn(name, ok, detail=""):
    if not ok:
        warns.append(name)
        print(f"  [WARN] {name}{(' — ' + detail) if detail else ''}")

def subdirs(p):
    return [d for d in p.iterdir() if d.is_dir()] if p.is_dir() else []

print(f"R = {R}\n")

# === 1. Legacy structure must be gone (the broken `_savoir/` grouping) ===
savoir = R / "_savoir"
check("pas de _savoir/univers/ (univers au niveau R)", not (savoir / "univers").is_dir(),
      "univers must live at R/_univers/<u>/")
check("pas de _savoir/systeme/ (système au niveau R)", not (savoir / "systeme").is_dir(),
      "system must live at R/_systeme/")
check("pas de _savoir/subsystems/ (sous-systèmes au niveau R)", not (savoir / "subsystems").is_dir(),
      "subsystems must live at R/_subsystems/<nom>/")

# === 2. Working dirs are _-prefixed; their internal content is NOT ===
for wd in ("_univers", "_systeme", "_subsystems", "_pjs", "_campagnes", "_ecrits"):
    p = R / wd
    if not p.is_dir():
        continue
    bad = [d.name for d in subdirs(p) if d.name.startswith("_")]
    check(f"{wd}/ : contenu interne non préfixé `_`", not bad, str(bad))

# === 3. Universes: each _univers/<u>/ carries canon/ and/or mj/ ===
uni = R / "_univers"
if uni.is_dir():
    for u in subdirs(uni):
        has_lore = (u / "canon").is_dir() or (u / "mj").is_dir()
        has_sources = (u / "sources").is_dir()
        if has_lore:
            check(f"_univers/{u.name}/ : canon/ ou mj/ présent", True)
        elif has_sources:
            # sources brutes présentes mais pas encore ventilées — pipeline en attente, pas malformé
            warn(f"_univers/{u.name}/ : sources/ non ventilées (lore-extract en attente)", False, u.name)
        else:
            check(f"_univers/{u.name}/ : canon/, mj/ ou sources/ présent", False, "univers vide")
        warn(f"_univers/{u.name} : slug kebab-case", bool(KEBAB.match(u.name)), u.name)
else:
    warn("_univers/ présent", False, "aucun univers — domaine lore-less ?")

# === 4. System: _systeme/ present and split by provenance ===
sysd = R / "_systeme"
if sysd.is_dir():
    warn("_systeme/ : canon/ présent (règles ventilées)", (sysd / "canon").is_dir(),
         "run rules-keeper to fill canon/")
else:
    warn("_systeme/ présent", False, "no system rules at R/_systeme/ (lore-only domain?)")

# === 5. Campaigns: each _campagnes/<c>/ has a config.yaml ===
camp = R / "_campagnes"
if camp.is_dir():
    for c in subdirs(camp):
        if c.name.startswith("."):
            continue
        check(f"_campagnes/{c.name}/ : config.yaml présent", (c / "config.yaml").is_file())

# === 6. Dated session axis: <AAAA>/<MM>/ well-formed ===
for y in subdirs(R):
    if not YEAR.match(y.name):
        continue
    for m in subdirs(y):
        check(f"{y.name}/{m.name} : mois bien formé (01-12)", bool(MONTH.match(m.name)), m.name)

# === résumé ===
n = len(fails); ko = sum(fails)
print(f"\n{n - ko}/{n} checks PASS" + (f" — {len(warns)} WARN" if warns else ""))
sys.exit(1 if ko else 0)
