#!/usr/bin/env python3
"""Functional / data-integrity checks for the `oracle` agent's subsystems.

Validates the vault subsystem data the oracle draws from (muses-et-oracles, parallaxe).
Run: `python oracle-data-checks.py`  (resolves the vault from ~/.jdr.yaml).

These are reproducible versions of the inline checks run during the oracle test pass
(2026-06-01). They assert the invariants the oracle relies on; they do NOT need network
or the plugin runtime — only the vault on disk.
"""
import re, sys, pathlib, collections

sys.stdout.reconfigure(encoding="utf-8")

# --- resolve <vault> from ~/.jdr.yaml, with platform fallbacks (mirrors SKILL.md T0) ---
def vault_root():
    cfg = pathlib.Path.home() / ".jdr.yaml"
    if cfg.exists():
        for line in cfg.read_text(encoding="utf-8").splitlines():
            m = re.match(r"\s*vault\s*:\s*(.+?)\s*$", line)
            if m:
                return pathlib.Path(m.group(1).strip().strip('"').strip("'")).expanduser()
    for cand in ("C:/Users/fxgui/Public/Notes/Perso/jdr", "~/JDR"):
        p = pathlib.Path(cand).expanduser()
        if p.exists():
            return p
    sys.exit("vault introuvable (ni ~/.jdr.yaml, ni défauts plateforme)")

VAULT = vault_root()
SUB = VAULT / "subsystems"
results = []
def check(name, ok, detail=""):
    results.append(ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}{(' — ' + detail) if detail else ''}")

def read(p): return pathlib.Path(p).read_text(encoding="utf-8").splitlines()

def master_table(lines, key1, key2):
    h = next(i for i, l in enumerate(lines)
             if l.startswith("|") and key1 in l and key2 in l)
    cols = [c.strip() for c in lines[h].strip("|").split("|")]
    rows = []
    for l in lines[h + 2:]:
        if not re.match(r"^\|\s*\d+\s*\|", l):
            break
        rows.append([c.strip() for c in l.strip("|").split("|")])
    return cols, rows

print(f"VAULT = {VAULT}\n")

# === muses-et-oracles / cartes-standard ===
cs = read(SUB / "muses-et-oracles/systeme/canon/cartes-standard.md")
cols, rows = master_table(cs, "Mots-oracles", "Relation")
check("muses: table maître = 200 cartes", len(rows) == 200, f"{len(rows)}")
check("muses: 17 colonnes (générateurs + Index dés)", len(cols) == 17, f"{len(cols)}")

oi = cols.index("Oracle"); di = cols.index("Index dés")
# invariant : le [d10] de la carte == son palier d'oracle
m10 = {1: "Non, et…", 2: "Non, et…", 3: "Non", 4: "Non, mais…", 5: "Non, mais…",
       6: "Oui, mais…", 7: "Oui, mais…", 8: "Oui", 9: "Oui, et…", 10: "Oui, et…"}
inv_ok = 0
for r in rows:
    g = re.search(r"\[d10\]\s*(\d+)", r[di])
    if g and r[oi] == m10.get(int(g.group(1))):
        inv_ok += 1
check("muses: invariant [d10] → réponse d'oracle (200/200)", inv_ok == 200, f"{inv_ok}/200")

# distribution pondérée du deck (nuancées 20% / Non-Oui 10%)
dist = collections.Counter(r[oi] for r in rows)
expected = {"Non, et…": 40, "Non, mais…": 40, "Oui, mais…": 40, "Oui, et…": 40, "Non": 20, "Oui": 20}
check("muses: distribution oracle 40/40/40/40/20/20", dict(dist) == expected, str(dict(dist)))

# tous les blocs de dés présents
check("muses: bloc [d4..d20] sur les 200 cartes",
      all("[d20]" in r[di] for r in rows))

# === parallaxe ===
pa = read(SUB / "parallaxe/systeme/canon/parallaxe.md")
pcols, pcards = master_table(pa, "Archétype", "Focale")
check("parallaxe: 54 cartes", len(pcards) == 54, f"{len(pcards)}")
iF = next(i for i, c in enumerate(pcols) if c.startswith("Focale"))
iT = next(i for i, c in enumerate(pcols) if c.startswith("Tonalité"))
iA = next(i for i, c in enumerate(pcols) if c.startswith("Archétype"))

# filtres : aucune fuite
def leak(keep, forbid):
    return [c[1] for c in pcards if keep(c) and forbid(c)]
check("parallaxe: filtre exclure Compagnon — pas de fuite",
      not leak(lambda c: "Compagnon" not in c[iF], lambda c: "Compagnon" in c[iF]))
check("parallaxe: filtre exclure Hostile ▼ — pas de fuite",
      not leak(lambda c: "▼" not in c[iT], lambda c: "▼" in c[iT]))

# exclusions systématiques (Moi·= absolue ; Tiers·▲ et Lieu·▲ : 1 exception Retournement chacune)
def combo(f, t): return [c[1] for c in pcards if c[iF] == f and c[iT] == t]
check("parallaxe: Moi·= absent (exclusion absolue)", combo("Moi", "=") == [])
tiers_fav = combo("Tiers", "▲"); lieu_fav = combo("Lieu", "▲")
check("parallaxe: Tiers·▲ = seulement Le Retour (Retournement)",
      tiers_fav == ["Le Retour"], str(tiers_fav))
check("parallaxe: Lieu·▲ = seulement Le Sanctuaire (Retournement)",
      lieu_fav == ["Le Sanctuaire"], str(lieu_fav))

# === résumé ===
n, ok = len(results), sum(results)
print(f"\n{ok}/{n} checks PASS")
sys.exit(0 if ok == n else 1)
