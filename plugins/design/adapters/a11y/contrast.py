#!/usr/bin/env python3
"""contrast.py — WCAG contrast of a contract's semantic colors, per theme.

Computed from resolved token values only: no rendering, no browser, no markup. The same
`tokens.json` always yields the same verdict, so two runs produce byte-identical output — the
property the maturity status depends on (`references/maturity-status.md`).

What it pairs comes from two sources, in this order of authority:

1. **Declared** — `components.json § .foregrounds × .backgrounds`. A colour carries text because
   a component states it does. Both sides are free token paths, so `color.brand.primary` or
   `color.domain.claimed` are paired exactly like anything else. This is the only source that
   knows a *use*.
2. **Role-inferred** — under `color.semantic` only, a foreground role (`text`, `foreground`,
   `on-*`) against a surface role (`background`, `surface`, `base`). A convenience for contracts
   that declare no pairing, and a weak one: it reads names, not uses. A declared pair is never
   re-emitted as inferred.

Each pair is evaluated on the base tree (`default` theme) and on every `themes.<name>` overlay
(`references/token-schema.md § Modes / themes`), aliases resolved within the theme they belong to.

Two limits:

1. **No rendering, no browser, no markup.** Anything that recomposes a colour at paint time is
   invisible here — `opacity`, `color-mix`, a translucent overlay, a gradient. `color: ink`
   with `opacity: .55` uses a legal token and passes every static gate while failing AA on the
   screen. Only a rendering gate catches that class.
2. **It compares what the contract declares, and nothing else.** A colour no component pairs
   and no role name matches is never tested. So a clean verdict means one of two very different
   things, and **they must never be confused**: every pair was compared and held, or nothing was
   found to compare. This tool always reports which one it is, and refuses to exit 0 on the
   second. A gate that passes for want of anything to look at is worse than an absent gate: it
   manufactures confidence.

Every run therefore carries its own coverage — how many colour leaves the contract declares,
how many were paired, and every leaf that was not, with the branch it came from. Unpaired is
not the same as safe; it is unexamined, and the report says so in those terms.

Usage:  python contrast.py --contract <dir> [--json] [--allow-unpaired]
Exit:   0  computed, at least one pair compared (verdicts on stdout)
        2  unusable contract: no tokens.json, unparsable, dangling path, alias cycle,
           translucent background (what shows through it is unknown)
        3  read, but nothing to compare: no component declares `.foregrounds`, and no role name
           matched under `color.semantic`. Not a pass — the contract declares colours this tool
           has no way to reach. Fixed by declaring the pairing, not by renaming tokens.

`--allow-unpaired` downgrades exit 3 to 0 for a caller that has recorded a derogation. It changes
the code and nothing else: the report still carries `unpairedAllowed: true` and the same empty
coverage, so the waiver is legible in the artefact and not just in the shell that produced it.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "_shared"))
from colors import resolve_alias, to_rgba  # noqa: E402

TOKENS_FILE = "tokens.json"
COMPONENTS_FILE = "components.json"
AA = 4.5  # WCAG 2.x AA, normal text
DEFAULT_THEME = "default"

_FG_ROLE = re.compile(r"^(text|foreground|on[-A-Z])")
_SURFACE_ROLE = re.compile(r"^(background|surface|base)$")


def is_token(node) -> bool:
    return isinstance(node, dict) and "$value" in node


def deep_merge(base, overlay):
    """Overlay wins on `$value`; base keeps every path the overlay does not re-declare."""
    if is_token(base) or is_token(overlay):
        merged = dict(base) if isinstance(base, dict) else {}
        if isinstance(overlay, dict):
            merged.update(overlay)
        return merged
    result = {k: _copy(v) for k, v in base.items()}
    for key, value in (overlay or {}).items():
        result[key] = deep_merge(result[key], value) if key in result else _copy(value)
    return result


def _copy(node):
    return {k: _copy(v) for k, v in node.items()} if isinstance(node, dict) else node


def lookup(tree: dict, dotted: str):
    node = tree
    for part in dotted.split("."):
        if not isinstance(node, dict) or part not in node:
            raise KeyError(dotted)
        node = node[part]
    return node


def resolve(tree: dict, raw: str) -> str:
    """Follow `{a.b.c}` aliases within one theme's tree until a literal, guarding cycles."""
    value, error = resolve_alias(tree, raw)
    if error is not None:
        raise ValueError(error)
    if not isinstance(value, str):
        raise ValueError(f"alias resolves to a non-string value: {raw}")
    return value


def over(fg: tuple[int, int, int, float], bg: tuple[int, int, int]) -> tuple[float, float, float]:
    """Source-over compositing of a translucent foreground on an opaque background.

    Dropping the alpha instead would read `#00000020` on white as pure black, 21:1, while the
    screen shows a faint grey: a false pass.
    """
    a = fg[3]
    return tuple(a * f + (1 - a) * b for f, b in zip(fg[:3], bg))


def _linear(channel: float) -> float:
    c = channel / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def luminance(rgb: tuple[float, float, float]) -> float:
    r, g, b = (_linear(c) for c in rgb)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg: tuple[float, float, float], bg: tuple[float, float, float]) -> float:
    hi, lo = sorted((luminance(fg), luminance(bg)), reverse=True)
    return (hi + 0.05) / (lo + 0.05)


def semantic_leaves(tree: dict) -> dict[str, dict]:
    node = (tree.get("color") or {}).get("semantic") or {}
    return {name: leaf for name, leaf in node.items() if is_token(leaf)}


def color_leaves(tree: dict) -> list[str]:
    """Every colour leaf the contract declares, dotted from `color`, sorted.

    The denominator of coverage. Walked on the base tree: a theme overlays values on paths the
    base already declares, so it changes what a pair is worth, never how many there are.
    """
    found: list[str] = []

    def walk(node, path: str) -> None:
        if is_token(node):
            found.append(path)
            return
        if isinstance(node, dict):
            for key in sorted(node):
                walk(node[key], f"{path}.{key}")

    walk(tree.get("color") or {}, "color")
    return sorted(found)


def coverage(tree: dict, paired: set[str]) -> dict:
    """What was compared, and — the part that matters — what was not even looked at.

    An unpaired colour is not a colour that held; it is a colour no pair was ever built from,
    most often because it lives outside `color.semantic` or because its name matches no role.
    Grouped by branch, so the shape of the blind spot reads at a glance.
    """
    declared = color_leaves(tree)
    unpaired = [leaf for leaf in declared if leaf not in paired]
    branches: dict[str, int] = {}
    for leaf in unpaired:
        parts = leaf.split(".")
        branch = parts[1] if len(parts) > 2 else "(direct)"
        branches[branch] = branches.get(branch, 0) + 1
    return {
        "declared": len(declared),
        "paired": len(paired),
        "unpaired": unpaired,
        "unpairedByBranch": dict(sorted(branches.items())),
    }


def declared_pairs(components: dict) -> list[tuple[str, str, str]]:
    """`(component, foreground, background)` for every pair a component declares.

    The authoritative source: a colour carries text because a component says it does, not
    because its name looks like a role. `.foregrounds` × `.backgrounds`, both token paths,
    both free to point anywhere under `color.*` — `color.brand`, `color.domain`, wherever the
    contract put them (`adjust/references/manifest-schema.md § Champs`).
    """
    pairs: list[tuple[str, str, str]] = []
    for name in sorted(components.get("components") or {}):
        node = (components["components"] or {})[name] or {}
        for fg in sorted(node.get("foregrounds") or []):
            for bg in sorted(node.get("backgrounds") or []):
                pairs.append((name, fg, bg))
    return pairs


def value_at(tree: dict, dotted: str) -> str:
    leaf = lookup(tree, dotted)
    if not is_token(leaf):
        raise ValueError(f"{dotted}: not a token (no $value)")
    return resolve(tree, leaf["$value"])


def evaluate(tokens: dict, components: dict | None = None) -> list[dict]:
    base = {k: v for k, v in tokens.items() if k != "themes"}
    themes = {DEFAULT_THEME: base}
    for name in sorted(tokens.get("themes") or {}):
        themes[name] = deep_merge(base, tokens["themes"][name])
    declared = declared_pairs(components or {})

    results: list[dict] = []
    for theme in sorted(themes):  # default sorts before named themes it never collides with
        tree = themes[theme]
        # Declared first: what a component states beats what a name suggests.
        for component, fg, bg in declared:
            results.append(_pair(theme, "declared", fg, bg, tree, component))
        leaves = semantic_leaves(tree)
        seen = {(fg, bg) for _, fg, bg in declared}
        for fg in sorted(n for n in leaves if _FG_ROLE.match(n)):
            for bg in sorted(n for n in leaves if _SURFACE_ROLE.match(n)):
                paths = (f"color.semantic.{fg}", f"color.semantic.{bg}")
                if paths not in seen:  # a declared pair is not re-emitted as inferred
                    results.append(_pair(theme, "role", *paths, tree, None))
    return results


def _pair(theme: str, source: str, fg: str, bg: str, tree: dict, component: str | None) -> dict:
    fg_value, bg_value = value_at(tree, fg), value_at(tree, bg)
    fg_rgba, bg_rgba = to_rgba(fg_value), to_rgba(bg_value)
    if bg_rgba[3] < 1:
        # What shows through a translucent background is not in the contract: no ratio is honest.
        raise ValueError(f"[{theme}] {fg} on {bg}: background {bg_value} is translucent; "
                         "the colour beneath it is unknown, so the contrast cannot be computed")
    r = ratio(over(fg_rgba, bg_rgba[:3]), bg_rgba[:3])
    return {
        "theme": theme,
        "source": source,          # `declared` — a component says so; `role` — the name suggests it
        "component": component,
        "foreground": fg,
        "background": bg,
        "fgValue": fg_value,
        "bgValue": bg_value,
        "ratio": round(r, 2),
        "pass": r >= AA,
    }


def run(contract: str, allow_unpaired: bool = False) -> tuple[int, dict | None]:
    tokens_path = Path(contract) / TOKENS_FILE
    if not tokens_path.is_file():
        print(f"{tokens_path}: not found; a contract declares tokens.json.", file=sys.stderr)
        return 2, None
    try:
        tokens = json.loads(tokens_path.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        print(f"{tokens_path}: unreadable — {exc}", file=sys.stderr)
        return 2, None
    components: dict = {}
    components_path = Path(contract) / COMPONENTS_FILE
    if components_path.is_file():  # absent in utility-first contracts; not an error
        try:
            components = json.loads(components_path.read_text(encoding="utf-8"))
        except (OSError, ValueError) as exc:
            print(f"{components_path}: unreadable — {exc}", file=sys.stderr)
            return 2, None
    try:
        results = evaluate(tokens, components)
    except (KeyError, ValueError) as exc:
        print(f"{tokens_path}: {exc}", file=sys.stderr)
        return 2, None
    base = {k: v for k, v in tokens.items() if k != "themes"}
    paired = {r[side] for r in results for side in ("foreground", "background")}
    report = {"contract": contract, "aa": AA, "results": results,
              "coverage": coverage(base, paired), "unpairedAllowed": allow_unpaired}
    # Nothing compared is not a clean bill: the contract declares colours out of this tool's reach.
    return (0 if results or allow_unpaired else 3), report


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="WCAG contrast of a contract, per theme.")
    parser.add_argument("--contract", required=True, metavar="DIR", help="contract directory")
    parser.add_argument("--json", action="store_true", help="emit the machine-readable report")
    parser.add_argument("--allow-unpaired", action="store_true",
                        help="downgrade exit 3 to 0; the report still says nothing was compared")
    args = parser.parse_args(argv)
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(encoding="utf-8", errors="replace")

    code, report = run(args.contract, args.allow_unpaired)
    if report is None:
        return code
    if args.json:
        # sort_keys makes every dict key order fixed, results are already sorted: byte-identical.
        print(json.dumps(report, indent=2, sort_keys=True, ensure_ascii=True))
    else:
        for r in report["results"]:
            verdict = "PASS" if r["pass"] else "FAIL"
            origin = r["component"] if r["source"] == "declared" else "(role)"
            print(f"{verdict} {r['theme']:10} {origin:18} {r['foreground']} on "
                  f"{r['background']} = {r['ratio']} (AA {AA})")
        cov = report["coverage"]
        if report["results"]:
            print(f"{sum(r['pass'] for r in report['results'])}/{len(report['results'])} pass")
        else:
            print("NOTHING COMPARED — no component declares `.foregrounds`, and no "
                  "foreground/surface role name matched under color.semantic.")
        # The coverage line is not a footnote: it says whether the verdict above means anything.
        print(f"coverage: {cov['paired']}/{cov['declared']} color leaves paired"
              + (" — unpaired by branch: "
                 + ", ".join(f"{b} {n}" for b, n in cov["unpairedByBranch"].items())
                 if cov["unpaired"] else ""))
    return code


if __name__ == "__main__":
    sys.exit(main())
