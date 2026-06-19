#!/usr/bin/env python3
"""config-gen — génère un config oracle (measure.py) depuis le contrat design system.

Lit design/components.json + design/tokens.json et produit un config JSON exploitable
directement par measure.py, screenshot.py et pixeldiff.py. Élimine la construction manuelle
du selector mapping pour les composants déclarés dans le manifeste.

Usage:
  python config-gen.py \\
    --components design/components.json \\
    --tokens design/tokens.json \\
    --maquette-url http://localhost:8080 \\
    --wp-url http://localhost:8888 \\
    --page accueil \\
    --out aidd_docs/qa/fidelity/accueil.config.json

Le config produit est un point de départ :
  - Sélecteurs WP  : dérivés du manifeste (classes BEM canoniques) — déjà corrects.
  - Sélecteurs maq : identiques aux WP par défaut. Surcharger si la maquette utilise
    des classes différentes (hors harness). Inspecter les deux DOMs pour confirmer.
  - Props           : dérivées des groupes de tokens présents dans tokens.json.
  - Breakpoints     : dérivés de tokens.breakpoint.* ou fallback mobile 375 + desktop 1440.
  - Hints oracle    : check_text et collections lus depuis le champ components.oracle si
    présent dans le manifeste (cf. manifest-schema.md).

Après génération :
  1. Vérifier que les sélecteurs résolvent sur les deux DOMs —
     measure.py signale les targets manquants en "missing".
  2. Surcharger le champ "maq" des targets où la maquette diffère des classes DS.
  3. Ajouter coverage_ack si des sections sont délibérément non mesurées.
  4. Ajouter des targets manuels pour les éléments hors manifeste découverts via visual-diff.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

# Mapping groupe de tokens → propriétés CSS à mesurer.
# Ordre par valeur diagnostique décroissante ; chaque prop n'est ajoutée qu'une fois.
_GROUP_PROPS: list[tuple[str, list[str]]] = [
    ("font.size",        ["fontSize"]),
    ("font.weight",      ["fontWeight"]),
    ("font.lineHeight",  ["lineHeight"]),
    ("font.family",      ["fontFamily"]),
    ("color",            ["color", "backgroundColor"]),
    ("space",            ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
                          "gap", "columnGap", "rowGap"]),
    ("radius",           ["borderRadius"]),
    ("shadow",           ["boxShadow"]),
    ("border.width",     ["borderWidth", "borderColor"]),
    ("motion.duration",  ["transitionDuration"]),
]

_DEFAULT_BREAKPOINTS = [
    {"name": "mobile",  "width": 375,  "height": 812,  "maq_viewport": "mobile"},
    {"name": "desktop", "width": 1440, "height": 900,  "maq_viewport": "desktop"},
]

# Heuristiques de nommage pour les tokens breakpoint.*
_BP_MAP: dict[str, tuple[str, int, int]] = {
    "mobile":  ("mobile",  375,  812),
    "sm":      ("mobile",  375,  812),
    "tablet":  ("tablet",  834,  1194),
    "md":      ("tablet",  834,  1194),
    "lg":      ("desktop", 1440, 900),
    "desktop": ("desktop", 1440, 900),
    "xl":      ("desktop", 1440, 900),
}

_BP_ORDER = {"mobile": 0, "tablet": 1, "desktop": 2}


def _flatten_prefixes(obj: dict, prefix: str = "") -> set[str]:
    """Retourne les préfixes de chemin des tokens (ex. 'font.size', 'color')."""
    prefixes: set[str] = set()
    for k, v in obj.items():
        path = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict) and "$type" not in v:
            prefixes.add(path)
            prefixes |= _flatten_prefixes(v, path)
        else:
            prefixes.add(path)
    return prefixes


def _derive_props(tokens: dict) -> list[str]:
    """Dérive la liste de props CSS depuis les groupes de tokens présents."""
    token_prefixes = _flatten_prefixes(tokens)
    props: list[str] = []
    seen: set[str] = set()
    for group, css_props in _GROUP_PROPS:
        if any(p == group or p.startswith(group + ".") for p in token_prefixes):
            for p in css_props:
                if p not in seen:
                    props.append(p)
                    seen.add(p)
    # Fallback si tokens.json est minimal
    return props or ["fontSize", "color", "backgroundColor", "padding", "gap"]


def _derive_breakpoints(tokens: dict) -> list[dict]:
    """Dérive les breakpoints depuis tokens.breakpoint.* ou fallback mobile+desktop."""
    bp_group = tokens.get("breakpoint", {})
    if not bp_group:
        return _DEFAULT_BREAKPOINTS

    seen_names: set[str] = set()
    breakpoints: list[dict] = []
    for key, val in bp_group.items():
        hint = _BP_MAP.get(key)
        if not hint:
            continue
        name, default_w, default_h = hint
        if name in seen_names:
            continue
        raw = val.get("$value", "") if isinstance(val, dict) else str(val)
        try:
            w = int(str(raw).replace("px", "").strip())
        except ValueError:
            w = default_w
        breakpoints.append({"name": name, "width": w, "height": default_h,
                            "maq_viewport": name})
        seen_names.add(name)

    if not breakpoints:
        return _DEFAULT_BREAKPOINTS
    breakpoints.sort(key=lambda b: _BP_ORDER.get(b["name"], 99))
    return breakpoints


def _dot_selector(cls: str) -> str:
    """Ajoute le préfixe '.' si absent."""
    return cls if cls.startswith(".") else f".{cls}"


def _derive_targets_and_collections(
    components: dict,
) -> tuple[list[dict], list[dict]]:
    """Dérive targets et collections depuis le manifeste + hints oracle."""
    targets: list[dict] = []
    collections: list[dict] = []

    for comp_name, comp in components.get("components", {}).items():
        base = comp.get("base", comp_name)
        oracle = comp.get("oracle", {})
        oracle_elems = oracle.get("elements", {})

        # Target racine du composant (élément de layout — pas de check_text par défaut)
        root_sel = _dot_selector(base)
        targets.append({"name": comp_name, "maq": root_sel, "wp": root_sel})

        # Targets par élément BEM
        for elem_label, elem_class in comp.get("elements", {}).items():
            hint = oracle_elems.get(elem_label, {})
            sel = _dot_selector(elem_class)
            target: dict = {
                "name": f"{comp_name} · {elem_label}",
                "maq": sel,
                "wp": sel,
            }
            if hint.get("check_text"):
                target["check_text"] = True
            if hint.get("props"):
                target["props"] = hint["props"]
            targets.append(target)

        # Collections depuis oracle.collections
        for coll in oracle.get("collections", []):
            item_sel = _dot_selector(coll.get("item_selector", ""))
            entry: dict = {
                "name": coll.get("name", f"{comp_name} · items"),
                "maq": item_sel,
                "wp": item_sel,
            }
            if coll.get("ack"):
                entry["ack"] = coll["ack"]
            collections.append(entry)

    return targets, collections


def generate(
    components_path: str,
    tokens_path: str,
    maquette_url: str,
    wp_url: str,
    page: str | None = None,
) -> dict:
    components = json.loads(Path(components_path).read_text(encoding="utf-8"))
    tokens = json.loads(Path(tokens_path).read_text(encoding="utf-8"))

    props = _derive_props(tokens)
    breakpoints = _derive_breakpoints(tokens)
    targets, collections = _derive_targets_and_collections(components)

    cfg: dict = {
        "_generated_by": "config-gen.py — review selectors before use",
        "maquette_url": maquette_url,
        "wp_url": wp_url,
        "breakpoints": breakpoints,
        "props": props,
        "targets": targets,
        "headings_sel": {"maq": "h1, h2, h3", "wp": "h1, h2, h3"},
    }
    if page:
        cfg["maquette_page"] = page
    if collections:
        cfg["collections"] = collections
    return cfg


def main():
    ap = argparse.ArgumentParser(
        description="Génère un config measure.py depuis le contrat design system (components.json + tokens.json)."
    )
    ap.add_argument("--components", required=True,
                    help="Chemin vers design/components.json")
    ap.add_argument("--tokens", required=True,
                    help="Chemin vers design/tokens.json")
    ap.add_argument("--maquette-url", required=True, dest="maquette_url",
                    help="URL de la maquette de référence (servie en HTTP)")
    ap.add_argument("--wp-url", required=True, dest="wp_url",
                    help="URL du rendu cible")
    ap.add_argument("--page", default=None,
                    help="Clé setPage pour les maquettes SPA (window.setPage)")
    ap.add_argument("--out", required=True,
                    help="Chemin de sortie du config JSON (ex. aidd_docs/qa/fidelity/accueil.config.json)")
    args = ap.parse_args()

    cfg = generate(args.components, args.tokens,
                   args.maquette_url, args.wp_url, args.page)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(cfg, indent=2, ensure_ascii=False), encoding="utf-8")

    n_t = len(cfg["targets"])
    n_c = len(cfg.get("collections", []))
    n_b = len(cfg["breakpoints"])
    n_p = len(cfg["props"])
    print(f"Config -> {out}")
    print(f"  {n_t} target(s)  ·  {n_c} collection(s)  ·  {n_b} breakpoint(s)  ·  {n_p} prop(s)")
    print("  Vérifier : les sélecteurs résolvent sur les deux DOMs (measure.py -> 'missing' sinon)")
    print("  Surcharger le champ 'maq' si la maquette utilise des classes différentes des classes DS")


if __name__ == "__main__":
    main()
