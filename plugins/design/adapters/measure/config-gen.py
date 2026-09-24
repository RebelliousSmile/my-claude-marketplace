#!/usr/bin/env python3
"""config-gen — génère un config oracle (measure.py) depuis le contrat design system.

Lit design/components.json + design/tokens.json + design/oracle.json et produit un config JSON
exploitable directement par measure.py. Élimine la construction manuelle du selector mapping
pour les composants déclarés dans le manifeste.

Usage:
  python config-gen.py \\
    --components design/components.json \\
    --tokens design/tokens.json \\
    --reference-url http://localhost:8080 \\
    --implementation-url http://localhost:8888 \\
    --page accueil \\
    --out aidd_docs/qa/fidelity/accueil.config.json

Vérifier le gate figé, sans URL ni navigateur :
  python config-gen.py --check --components design/components.json --tokens design/tokens.json

Le config produit dérive du contrat ; il ne se complète pas à la main :
  - Sélecteurs implémentation : classes BEM canoniques du manifeste.
  - Sélecteurs mockup         : figés par page dans oracle.json § pages (écrit par adjust).
    Sans § pages (contrat 2.x antérieur) : identiques à l'implémentation, avec avertissement.
  - Props                     : dérivées des groupes de tokens ; une cible qui déclare les siennes
    (oracle.json, racine ou élément) remplace la liste globale.
  - Breakpoints               : dérivés de tokens.breakpoint.* ou fallback mobile 375 + desktop 1440.
  - Hints oracle              : check_text et collections lus depuis oracle.json si présent.
  - Exclusions                : un élément { "skip": "<raison>" } n'est pas mesuré ; listé dans _excluded.

Seuls ajouts permis après génération : ledger (ids de deviations.json), coverage_ack,
authentification. Un sélecteur faux ou manquant se corrige dans oracle.json § pages via adjust.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
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
    {"name": "mobile",  "width": 375,  "height": 812,  "mockup_viewport": "mobile"},
    {"name": "desktop", "width": 1440, "height": 900,  "mockup_viewport": "desktop"},
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
    """Dérive les breakpoints depuis tokens.breakpoint.* ou fallback mobile+desktop.

    Invariant prouvé, non vérifié au runtime : `mockup_viewport ∈ {desktop, tablet, mobile}`.
    Toute clé `tokens.breakpoint.*` hors de `_BP_MAP` est ignorée (`:110-112`), le nom est
    pris dans `_BP_MAP` (`:121-122`), et le fallback est mobile+desktop (`:55-56`). L'ensemble
    est donc clos par construction — c'est exactement les trois échantillons device exposés
    par le harness (references/harness-contract.md § Accord measure / oracle)."""
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
                            "mockup_viewport": name})
        seen_names.add(name)

    if not breakpoints:
        return _DEFAULT_BREAKPOINTS
    breakpoints.sort(key=lambda b: _BP_ORDER.get(b["name"], 99))
    return breakpoints


def _dot_selector(cls: str) -> str:
    """Ajoute le préfixe '.' si absent."""
    return cls if cls.startswith(".") else f".{cls}"


class GateError(ValueError):
    """Entrée invalide, ou gate incomplet pour la page demandée (exit 2)."""


def _read_object(path: Path, name: str) -> dict:
    """Charge un artefact JSON dont la racine doit être un objet ; sinon GateError (exit 2)."""
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise GateError(f"{name} : la racine doit être un objet JSON")
    return data


def _require_objects(mapping, where: str, nullable: bool = False) -> dict:
    """`mapping` est un objet dont chaque valeur est un objet (ou null si `nullable`)."""
    if not isinstance(mapping, dict):
        raise GateError(f"{where} : objet attendu")
    for key, value in mapping.items():
        if not (isinstance(value, dict) or (nullable and value is None)):
            raise GateError(f"{where}.{key} : objet attendu")
    return mapping


def _check_shape(components: dict, oracle: dict) -> None:
    """Valide la forme des objets que la dérivation parcourt, avant de les parcourir."""
    for name, comp in _require_objects(components.get("components", {}),
                                       "components.json § components").items():
        if not isinstance(comp.get("elements", {}), dict):
            raise GateError(f"components.json § components.{name}.elements : objet attendu")
    for name, hint in _require_objects(oracle.get("components", {}),
                                       "oracle.json § components").items():
        _require_objects(hint.get("elements", {}), f"oracle.json § components.{name}.elements")
    raw_pages = oracle.get("pages")
    pages = _require_objects({} if raw_pages is None else raw_pages, "oracle.json § pages",
                             nullable=True)
    for page, page_def in pages.items():
        _require_objects((page_def or {}).get("components", {}),
                         f"oracle.json § pages.{page}.components", nullable=True)


def _is_skip(sel) -> bool:
    return isinstance(sel, dict) and bool(sel.get("skip"))


def _is_selector(sel) -> bool:
    return isinstance(sel, str) and bool(sel.strip())


def _page_components(oracle: dict, page: str) -> dict:
    pages = oracle.get("pages", {})
    if page not in pages:
        raise GateError(f"page '{page}' absente de oracle.json § pages "
                        f"(pages connues : {', '.join(sorted(pages)) or 'aucune'})")
    placed = (pages[page] or {}).get("components", {})
    if not placed:
        raise GateError(f"page '{page}' sans composant dans oracle.json § pages (lancer --check)")
    return placed


def _derive_targets_and_collections(
    components: dict,
    oracle_hints: dict,
    page_map: dict | None = None,
) -> tuple[list[dict], list[dict], list[dict]]:
    """Dérive targets, collections et exclusions depuis components.json + oracle.json.

    `page_map` = oracle.json § pages.<page>.components : seuls ces composants sont dérivés, et le
    côté mockup prend le sélecteur figé. Absent : tous les composants, mockup = implémentation."""
    targets: list[dict] = []
    collections: list[dict] = []
    excluded: list[dict] = []
    all_comps = components.get("components", {})

    for comp_name in (list(page_map) if page_map is not None else list(all_comps)):
        if comp_name not in all_comps:
            raise GateError(f"composant '{comp_name}' absent de components.json")
        comp = all_comps[comp_name]
        base = comp.get("base", comp_name)
        oracle = oracle_hints.get(comp_name, {})
        oracle_elems = oracle.get("elements", {})
        placed = (page_map[comp_name] or {}) if page_map is not None else None

        def mockup_of(frozen, impl_sel: str, what: str) -> str:
            if placed is None:
                return impl_sel
            if not _is_selector(frozen):
                raise GateError(f"{comp_name} / {what} : aucun sélecteur maquette (lancer --check)")
            return frozen

        # Target racine du composant (élément de layout — pas de check_text par défaut)
        root_sel = _dot_selector(base)
        root: dict = {"name": comp_name,
                      "mockup": mockup_of(placed.get("root") if placed is not None else None,
                                          root_sel, "root"),
                      "implementation": root_sel}
        if oracle.get("props"):
            root["props"] = oracle["props"]
        targets.append(root)

        # Targets par élément BEM
        frozen_elems = placed.get("elements", {}) if placed is not None else {}
        for elem_label, elem_class in comp.get("elements", {}).items():
            frozen = frozen_elems.get(elem_label)
            if _is_skip(frozen):
                excluded.append({"component": comp_name, "element": elem_label,
                                 "reason": frozen["skip"]})
                continue
            hint = oracle_elems.get(elem_label, {})
            sel = _dot_selector(elem_class)
            target: dict = {
                "name": f"{comp_name} · {elem_label}",
                "mockup": mockup_of(frozen, sel, elem_label),
                "implementation": sel,
            }
            if hint.get("check_text"):
                target["check_text"] = True
            if hint.get("props"):
                target["props"] = hint["props"]
            targets.append(target)

        # Collections depuis oracle.collections
        frozen_colls = placed.get("collections", {}) if placed is not None else {}
        for coll in oracle.get("collections", []):
            item_sel = _dot_selector(coll.get("item_selector", ""))
            coll_name = coll.get("name", f"{comp_name} · items")
            entry: dict = {
                "name": coll_name,
                "mockup": mockup_of(frozen_colls.get(coll_name), item_sel, f"collection {coll_name}"),
                "implementation": item_sel,
            }
            if coll.get("ack"):
                entry["ack"] = coll["ack"]
            collections.append(entry)

    return targets, collections, excluded


def check_gate(components: dict, oracle: dict) -> dict:
    """Vérification statique du gate figé : chaque page, chaque composant placé, chaque élément.

    Retourne {defects, excluded, unplaced}. Défaut : pas de § pages, page sans composant,
    composant inconnu, racine sans sélecteur, élément sans sélecteur ni skip, collection sans
    sélecteur, libellé d'élément ou de collection inconnu du contrat."""
    all_comps = components.get("components", {})
    hints = oracle.get("components", {})
    pages = oracle.get("pages") or {}
    defects: list[str] = [] if pages else ["oracle.json § pages absent ou vide"]
    excluded: list[dict] = []
    placed_anywhere: set[str] = set()
    for page, page_def in pages.items():
        placed = (page_def or {}).get("components", {})
        if not placed:
            defects.append(f"{page} : aucun composant")
        for comp_name, entry in placed.items():
            where = f"{page} / {comp_name}"
            if comp_name not in all_comps:
                defects.append(f"{where} : composant inconnu de components.json")
                continue
            placed_anywhere.add(comp_name)
            entry = entry or {}
            if not _is_selector(entry.get("root")):
                defects.append(f"{where} / root : aucun sélecteur maquette")
            declared = all_comps[comp_name].get("elements", {})
            frozen = entry.get("elements", {})
            for label in declared:
                sel = frozen.get(label)
                if _is_skip(sel):
                    excluded.append({"page": page, "component": comp_name, "element": label,
                                     "reason": sel["skip"]})
                elif not _is_selector(sel):
                    defects.append(f"{where} / {label} : aucun sélecteur maquette ni skip")
            defects += [f"{where} / {label} : élément inconnu de components.json"
                        for label in frozen if label not in declared]
            coll_names = [c.get("name") for c in hints.get(comp_name, {}).get("collections", [])]
            frozen_colls = entry.get("collections", {})
            defects += [f"{where} / collection {name} : aucun sélecteur maquette"
                        for name in coll_names if not _is_selector(frozen_colls.get(name))]
            defects += [f"{where} / collection {name} : collection inconnue de oracle.json"
                        for name in frozen_colls if name not in coll_names]
    unplaced = [c for c in all_comps if c not in placed_anywhere]
    return {"defects": defects, "excluded": excluded, "unplaced": unplaced}


def _css_rules(text: str):
    """Yield (selector, declaration-body), descending through media/layer/supports blocks."""
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    cursor = 0
    while cursor < len(text):
        opening = text.find("{", cursor)
        if opening < 0:
            return
        header = text[cursor:opening].strip()
        depth, closing = 1, opening + 1
        while closing < len(text) and depth:
            depth += (text[closing] == "{") - (text[closing] == "}")
            closing += 1
        if depth:
            return
        body = text[opening + 1:closing - 1]
        if header.startswith("@"):
            yield from _css_rules(body)
        elif header:
            yield header, body
        cursor = closing


def _declarations(body: str) -> list[str]:
    props = []
    for declaration in body.split(";"):
        name, separator, _ = declaration.partition(":")
        name = name.strip().lower()
        if separator and name and not name.startswith("--") and re.fullmatch(r"[a-z-]+", name):
            props.append(name)
    return props


def _camel_to_kebab(value: str) -> str:
    return re.sub(r"(?<!^)([A-Z])", r"-\1", value).lower()


def _derive_ownership_targets(components: dict, oracle_hints: dict,
                              stylesheets: list[str], only: list[str] | None = None) -> list[dict]:
    """Derive proof targets from declarations actually present in DS/platform binding sheets.
    `only` restricts them to the components placed on the requested page."""
    classes: dict[str, tuple[str, set[str]]] = {}
    for comp_name, comp in components.get("components", {}).items():
        if only is not None and comp_name not in only:
            continue
        base = comp.get("base", comp_name).lstrip(".")
        root_props = {_camel_to_kebab(p) for p in oracle_hints.get(comp_name, {}).get("props", [])}
        classes[base] = (comp_name, root_props)
        hints = oracle_hints.get(comp_name, {}).get("elements", {})
        for label, cls in comp.get("elements", {}).items():
            hinted = {_camel_to_kebab(p) for p in hints.get(label, {}).get("props", [])}
            classes[str(cls).lstrip(".")] = (f"{comp_name} · {label}", hinted)

    found: dict[tuple[str, str, str], dict] = {}
    seen_classes: set[str] = set()
    sources = [Path(path).name for path in stylesheets]
    for stylesheet in stylesheets:
        text = Path(stylesheet).read_text(encoding="utf-8")
        for selector_group, body in _css_rules(text):
            declared = _declarations(body)
            for selector in (part.strip() for part in selector_group.split(",")):
                for cls, (label, hinted) in classes.items():
                    if not re.search(rf"(?<![\w-])\.{re.escape(cls)}(?![\w-])", selector):
                        continue
                    seen_classes.add(cls)
                    props = [prop for prop in declared if not hinted or prop in hinted]
                    for prop in props:
                        key = (cls, selector, prop)
                        row = found.setdefault(key, {"name": label, "selector": selector,
                                                     "class": cls, "prop": prop, "sources": []})
                        source = Path(stylesheet).name
                        if source not in row["sources"]:
                            row["sources"].append(source)
    # One property can require alternative selectors across platform surfaces (notably a
    # navigation-link class on the li in front and on the anchor in the editor). Aggregate those
    # alternatives into one query-selector list so an absent variant does not become a false gap.
    merged: dict[tuple[str, str], dict] = {}
    for row in found.values():
        if not row.get("prop"):
            continue
        key = (row["class"], row["prop"])
        target = merged.setdefault(key, {**row, "selector": "", "sources": []})
        selectors = [part.strip() for part in target["selector"].split(",") if part.strip()]
        if row["selector"] not in selectors:
            selectors.append(row["selector"])
        target["selector"] = ", ".join(selectors)
        target["sources"] = list(dict.fromkeys(target["sources"] + row["sources"]))

    for cls, (label, _) in classes.items():
        if cls not in seen_classes:
            merged[(cls, "")] = {
                "name": label, "selector": f".{cls}", "class": cls, "prop": None,
                "sources": sources, "unrealized_reason": "DS class has no inspectable declaration",
            }
    return list(merged.values())


def _load_oracle(components_path: str, oracle_path: str | None) -> dict:
    # Les hints de mesure vivent dans oracle.json, artefact frère de components.json
    # (cf. references/contract-schema.md). Par défaut, le frère du manifeste ; absent,
    # les targets se dérivent de la seule anatomie, sans check_text ni collections.
    oracle_file = Path(oracle_path) if oracle_path else Path(components_path).with_name("oracle.json")
    if oracle_file.is_file():
        return _read_object(oracle_file, "oracle.json")
    return {}


def generate(
    components_path: str,
    tokens_path: str,
    reference_url: str,
    implementation_url: str | None,
    page: str | None = None,
    oracle_path: str | None = None,
    ownership_stylesheets: list[str] | None = None,
    editor_url: str | None = None,
) -> dict:
    components = _read_object(components_path, "components.json")
    tokens = _read_object(tokens_path, "tokens.json")
    oracle = _load_oracle(components_path, oracle_path)
    _check_shape(components, oracle)
    oracle_hints: dict = oracle.get("components", {})

    # Gate figé : la page choisit les composants et porte le sélecteur maquette de chacun.
    page_map = None
    if oracle.get("pages"):
        if not page:
            raise GateError("oracle.json déclare § pages : --page est requis")
        page_map = _page_components(oracle, page)
    else:
        print("WARNING: oracle.json has no 'pages' -- mockup selectors default to DS classes; "
              "re-freeze with adjust to pin them", file=sys.stderr)

    props = _derive_props(tokens)
    breakpoints = _derive_breakpoints(tokens)
    targets, collections, excluded = _derive_targets_and_collections(
        components, oracle_hints, page_map)

    cfg: dict = {
        "_generated_by": ("config-gen.py — derived from the frozen contract, do not edit selectors"
                          if page_map is not None else "config-gen.py — review selectors before use"),
        "reference_url": reference_url,
        "implementation_url": implementation_url,
        "breakpoints": breakpoints,
        "props": props,
        "targets": targets,
        "headings_sel": {"mockup": "h1, h2, h3", "implementation": "h1, h2, h3"},
    }
    if page:
        cfg["reference_page"] = page
    if collections:
        cfg["collections"] = collections
    if excluded:
        cfg["_excluded"] = excluded
    if ownership_stylesheets:
        if not implementation_url:
            raise GateError("--ownership-stylesheet requiert --implementation-url")
        cfg["ownership"] = {
            "surfaces": [
                {"name": "front", "url": implementation_url},
                {"name": "editor", "url": editor_url or implementation_url.rstrip("/") + "/wp-admin/site-editor.php",
                 "frame_selector": "iframe[name=editor-canvas]", "requires_auth": True,
                 "storage_state_env": "WP_EDITOR_STORAGE_STATE", "auth_hook_env": "WP_EDITOR_AUTH_HOOK"},
            ],
            "targets": _derive_ownership_targets(
                components, oracle_hints, ownership_stylesheets,
                list(page_map) if page_map is not None else None),
        }
    return cfg


def run_check(components_path: str, oracle_path: str | None) -> int:
    components = _read_object(components_path, "components.json")
    oracle = _load_oracle(components_path, oracle_path)
    _check_shape(components, oracle)
    report = check_gate(components, oracle)
    for d in report["defects"]:
        print(f"DEFECT   {d}")
    for e in report["excluded"]:
        print(f"SKIP     {e['page']} / {e['component']} / {e['element']} -- {e['reason']}")
    for c in report["unplaced"]:
        print(f"UNPLACED {c} -- on no page, covered by lint only")
    status = "INCOMPLETE" if report["defects"] else "COMPLETE"
    print(f"== fidelity gate {status}: {len(report['defects'])} defect(s), "
          f"{len(report['excluded'])} skip(s), {len(report['unplaced'])} unplaced ==")
    return 1 if report["defects"] else 0


def main():
    ap = argparse.ArgumentParser(
        description="Génère un config measure.py depuis le contrat design system (components.json + tokens.json + oracle.json)."
    )
    ap.add_argument("--components", required=True,
                    help="Chemin vers design/components.json")
    ap.add_argument("--tokens", required=True,
                    help="Chemin vers design/tokens.json")
    ap.add_argument("--oracle", default=None,
                    help="Chemin vers design/oracle.json (défaut : frère de --components)")
    ap.add_argument("--check", action="store_true",
                    help="Vérifie le gate figé (oracle.json § pages) sans URL : exit 0 complet, 1 défauts, 2 entrée invalide")
    # Deux rôles, jamais deux plateformes : la référence est ce qui fait foi, l'implémentation
    # est ce qui est mesuré contre elle.
    ap.add_argument("--reference-url", default=None, dest="reference_url",
                    help="URL de la référence qui fait foi (servie en HTTP) ; requis hors --check")
    ap.add_argument("--implementation-url", default=None, dest="implementation_url",
                    help="URL de l'implémentation ; absente, config pour Mode A --side mockup seulement (gel)")
    ap.add_argument("--page", default=None,
                    help="Clé setPage du harness (window.setPage) = clé de oracle.json § pages")
    ap.add_argument("--ownership-stylesheet", action="append", default=[],
                    help="Feuille DS ou fse-bindings.css à inspecter (répétable); active la preuve front+éditeur")
    ap.add_argument("--editor-url", default=None,
                    help="URL de l’éditeur FSE (défaut: <implementation-url>/wp-admin/site-editor.php)")
    ap.add_argument("--out", default=None,
                    help="Chemin de sortie du config JSON (ex. aidd_docs/qa/fidelity/accueil.config.json) ; requis hors --check")
    args = ap.parse_args()

    try:
        if args.check:
            sys.exit(run_check(args.components, args.oracle))
        missing = [flag for flag, value in (("--reference-url", args.reference_url),
                                            ("--out", args.out)) if not value]
        if missing:
            ap.error(f"{', '.join(missing)} requis hors --check")
        cfg = generate(args.components, args.tokens,
                       args.reference_url, args.implementation_url, args.page, args.oracle,
                       args.ownership_stylesheet, args.editor_url)
    except (OSError, ValueError) as exc:
        print(f"config-gen error: {exc}", file=sys.stderr)
        sys.exit(2)

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(cfg, indent=2, ensure_ascii=False), encoding="utf-8")

    n_t = len(cfg["targets"])
    n_c = len(cfg.get("collections", []))
    n_b = len(cfg["breakpoints"])
    n_p = len(cfg["props"])
    print(f"Config -> {out}")
    n_x = len(cfg.get("_excluded", []))
    print(f"  {n_t} target(s) / {n_c} collection(s) / {n_b} breakpoint(s) / {n_p} prop(s) / {n_x} skip(s)")
    print("  A 'missing' target is a contract defect: fix oracle.json pages via adjust, never this file")


if __name__ == "__main__":
    main()
