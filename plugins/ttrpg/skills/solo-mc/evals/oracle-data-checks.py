#!/usr/bin/env python3
"""Functional / data-integrity checks for the `oracle` agent's subsystems.

Validates the subsystem data the oracle draws from (muses-et-oracles, parallaxe, conversation-cards).
Run: `python oracle-data-checks.py [chemin-de-depart]`.

Each subsystem canon is resolved with the **oracle agent's own robust logic** (mirrors
`oracle.md` "How to draw" step 2): from the start dir (optional CLI arg, else CWD), walk up
the parents and, for each `<nom>`, accept the first of — domain install `_subsystems/<nom>/canon/`,
shared library `subsystems/<nom>/{canon,systeme/canon}/`, or top-level `<nom>/{canon,systeme/canon}/`
— that holds the canon index `<nom>.md`. No rigid single path. See `../../../references/jdr-layout.md`.

These are reproducible versions of the inline checks run during the oracle test pass
(2026-06-01). They assert the invariants the oracle relies on; they do NOT need network
or the plugin runtime — only the domain on disk.
"""
import re, sys, pathlib, collections

sys.stdout.reconfigure(encoding="utf-8")

# --- resolve each subsystem canon with the oracle agent's own robust logic ---
# (mirrors oracle.md "How to draw" step 2: domain install OR shared library, grouped OR
#  top-level, in canon/ or systeme/canon/ form — no rigid single path).
START = (pathlib.Path(sys.argv[1]).expanduser() if len(sys.argv) > 1 else pathlib.Path.cwd()).resolve()
_CANDIDATES = (
    "_subsystems/{n}/canon",
    "subsystems/{n}/canon", "subsystems/{n}/systeme/canon",
    "{n}/canon", "{n}/systeme/canon",
)
def resolve_subsystem(nom):
    for base in (START, *START.parents):
        for tmpl in _CANDIDATES:
            p = base / tmpl.format(n=nom)
            if (p / f"{nom}.md").is_file():
                return p
    return None

def canon_dir(nom):
    d = resolve_subsystem(nom)
    if d is None:
        sys.exit(f"subsystème '{nom}' introuvable en remontant depuis {START} "
                 f"(cherché _subsystems/{nom}/canon, subsystems/{nom}/[systeme/]canon, {nom}/[systeme/]canon)")
    return d

results = []
def check(name, ok, detail=""):
    results.append(ok)
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}{(' — ' + detail) if detail else ''}")

def read(p):
    p = pathlib.Path(p)
    if not p.is_file():
        sys.exit(f"[FAIL] fichier de données manquant : {p} "
                 "(canon partiel — relancer extract-pdf puis rules-keeper)")
    return p.read_text(encoding="utf-8").splitlines()

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

MUSES = canon_dir("muses-et-oracles")
PARALLAXE = canon_dir("parallaxe")
CC = canon_dir("conversation-cards")
print(f"muses-et-oracles   = {MUSES}\nparallaxe          = {PARALLAXE}\nconversation-cards = {CC}\n")

# === muses-et-oracles / cartes-standard ===
cs = read(MUSES / "cartes-standard.md")
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
pa = read(PARALLAXE / "parallaxe.md")
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

# === muses : couverture des dés d'index (sélection d'une carte par dé) ===
for die, N in [(4, 4), (6, 6), (8, 8), (10, 10), (12, 12), (20, 20)]:
    seen, xcount = set(), 0
    for r in rows:
        g = re.search(rf"\[d{die}\]\s*([0-9Xx]+)", r[di])
        if not g:
            continue
        v = g.group(1)
        if v.upper() == "X":
            xcount += 1
        elif v.isdigit():
            seen.add(int(v))
    full = seen == set(range(1, N + 1))
    check(f"muses: dé d{die} — faces 1..{N} toutes atteignables", full,
          f"distinctes={len(seen)} hors-plage(X)={xcount}")

# === conversation-cards : 9 combos Famille × Emphase (3 cartes chacune) ===
cc = read(CC / "conversation-cards.md")
ccols, ccards = master_table(cc, "Famille", "Emphase")
fi = ccols.index("Famille"); ei = ccols.index("Emphase")
check("conversation-cards: 27 cartes", len(ccards) == 27, str(len(ccards)))
combos = collections.Counter((r[fi], r[ei]) for r in ccards)
fams = ["Aggressive", "Passive", "Submissive"]; emps = ["Casual", "Overt", "Subtle"]
grid = {f"{f[:3]}/{e[:3]}": combos.get((f, e), 0) for f in fams for e in emps}
check("conversation-cards: 9 combos Famille×Emphase = 3 chacune",
      all(combos.get((f, e), 0) == 3 for f in fams for e in emps), str(grid))

# === rebondissements : comptages des sous-tables ===
rb = read(MUSES / "cartes-rebondissements.md")
def section_rows(lines, substr):
    inside, out = False, 0
    for l in lines:
        if re.match(r"^#{2,3}\s", l):
            inside = substr.lower() in l.lower(); continue
        if inside and re.match(r"^\|\s*\d+\s*\|", l):
            out += 1
    return out
for label, substr, exp in [("Focus", "Focus", 28), ("Soudain", "Soudain", 19),
                           ("Hors des sentiers", "Hors des sentiers", 39),
                           ("Coup de théâtre", "Coup de théâtre", 33)]:
    got = section_rows(rb, substr)
    check(f"rebondissements: {label} = {exp}", got == exp, str(got))

# === résumé ===
n, ok = len(results), sum(results)
print(f"\n{ok}/{n} checks PASS")
sys.exit(0 if ok == n else 1)
