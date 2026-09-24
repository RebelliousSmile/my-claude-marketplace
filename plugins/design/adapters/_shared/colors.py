"""Colour parsing and `{a.b}` alias resolution, shared by measure, contrast and generate.

One parser, so a colour the oracle folds is a colour the contrast gate reads, and one alias walk,
so a token resolves the same way wherever it is emitted or checked.
"""
from __future__ import annotations

import re

ALIAS_RE = re.compile(r"^\{([^}]+)\}$")

_NAMED_COLORS = {
    "transparent": (0, 0, 0, 0.0),
    "black": (0, 0, 0, 1.0),
    "white": (255, 255, 255, 1.0),
}

_RE_FUNC = re.compile(r"^(rgba?|color)\((.*)\)$", re.IGNORECASE | re.DOTALL)
_RE_HEX = re.compile(r"^#([0-9a-f]{3,8})$", re.IGNORECASE)


def split_top_level(value: str) -> list[str]:
    """Split a computed value on top-level whitespace, keeping parenthesised groups intact.

    `borderColor` serialises as a shorthand of up to four colours, and each of those may itself be
    `rgba(255, 255, 255, 0.7)` — full of spaces and commas. A naive split would shred it.
    """
    out, depth, cur = [], 0, []
    for ch in value:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth = max(0, depth - 1)
        if depth == 0 and ch.isspace():
            if cur:
                out.append("".join(cur))
                cur = []
            continue
        cur.append(ch)
    if cur:
        out.append("".join(cur))
    return out


def _chan(tok: str, scale: float) -> float | None:
    """One colour channel: a number, or a percentage of `scale`. None if it is neither."""
    tok = tok.strip()
    if not tok:
        return None
    try:
        if tok.endswith("%"):
            return float(tok[:-1]) * scale / 100.0
        return float(tok)
    except ValueError:
        return None


def _alpha(tok: str) -> float | None:
    """Alpha as a 0-1 float; accepts `0.7` and `70%`."""
    a = _chan(tok, 1.0)
    return None if a is None else max(0.0, min(1.0, a))


def normalize_one(value: str) -> str | None:
    """Canonicalise a single colour to `rgba(r, g, b, a)`; None when unparseable.

    Handles `rgb()`/`rgba()` (comma or space separated), `color(srgb r g b / a)`, `#rgb`/`#rgba`/
    `#rrggbb`/`#rrggbbaa`, and the `transparent`/`currentcolor` keywords. Channels are rounded to
    integers 0-255 and alpha to 4 decimals, so this is an exact canonical form and never a
    tolerance: `#FFFFFF` and `#FFFFEE` normalise to different strings, as do alpha 0.7 and 0.71.

    LIMITATION: only the sRGB space folds. `color(display-p3 …)`, `lab()`, `lch()`, `oklab()`,
    `oklch()` and `hsl()` are NOT converted — they return None and the caller falls back to string
    equality, which is a false diff at worst, never a false match. `color-mix()` never reaches here:
    the browser has already resolved it by the time getComputedStyle reports it (in srgb it
    serialises as `color(srgb …)`, which is exactly the artefact this function exists to absorb).
    """
    v = value.strip()
    if not v:
        return None
    low = v.lower()

    if low == "currentcolor":
        return "currentcolor"
    if low in _NAMED_COLORS:
        r, g, b, a = _NAMED_COLORS[low]
        return f"rgba({r}, {g}, {b}, {round(a, 4):g})"

    m = _RE_HEX.match(v)
    if m:
        h = m.group(1)
        if len(h) in (3, 4):
            h = "".join(c * 2 for c in h)
        if len(h) not in (6, 8):
            return None
        r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
        a = int(h[6:8], 16) / 255.0 if len(h) == 8 else 1.0
        return f"rgba({r}, {g}, {b}, {round(a, 4):g})"

    m = _RE_FUNC.match(v)
    if not m:
        return None
    fn, body = m.group(1).lower(), m.group(2)

    # Alpha is after a slash in the modern syntax, or the 4th comma-separated argument.
    alpha_tok = None
    if "/" in body:
        body, _, alpha_tok = body.partition("/")

    parts = [p for p in re.split(r"[,\s]+", body.strip()) if p]

    if fn == "color":
        if not parts or parts[0].lower() != "srgb":
            return None          # display-p3, lab, … deliberately not folded
        parts = parts[1:]
    elif len(parts) == 4 and alpha_tok is None:
        alpha_tok = parts[3]
        parts = parts[:3]

    if len(parts) != 3:
        return None

    chans = []
    for p in parts:
        c = _chan(p, 255.0)
        if c is None:
            return None
        # color(srgb …) is 0-1 unless written as a percentage; rgb() is already 0-255.
        if fn == "color" and not p.strip().endswith("%"):
            c *= 255.0
        chans.append(max(0, min(255, int(round(c)))))

    a = 1.0 if alpha_tok is None else _alpha(alpha_tok)
    if a is None:
        return None
    return f"rgba({chans[0]}, {chans[1]}, {chans[2]}, {round(a, 4):g})"


def normalize_color(value: str) -> str | None:
    """Canonicalise a whole computed colour value, shorthand included; None when unparseable.

    `borderColor` may carry 1-4 colours. Every component must parse, or the whole value is None and
    the caller keeps string equality — a value we do not fully understand is never declared a match.
    """
    if not isinstance(value, str):
        return None
    toks = split_top_level(value.strip())
    if not toks:
        return None
    normed = [normalize_one(t) for t in toks]
    if any(n is None for n in normed):
        return None
    return " ".join(normed)


def to_rgba(value) -> tuple[int, int, int, float]:
    """One colour, any spelling normalize_one folds, as channels plus alpha in [0, 1]."""
    canon = normalize_one(value) if isinstance(value, str) else None
    if canon is None or canon == "currentcolor":
        raise ValueError(f"not an sRGB color: {value}")
    r, g, b, a = canon[len("rgba("):-1].split(", ")
    return int(r), int(g), int(b), float(a)


def alias_target(value) -> str | None:
    """The dotted path of a `{a.b}` alias, or None for a literal."""
    match = ALIAS_RE.match(value.strip()) if isinstance(value, str) else None
    return match.group(1) if match else None


def resolve_alias(tree: dict, value, seen: tuple = ()) -> tuple:
    """Follow alias chains to a literal $value. Returns (value, error); error names the cycle or
    the dangling path, and value is then None."""
    target = alias_target(value)
    if target is None:
        return value, None
    if target in seen:
        return None, "alias cycle: " + " -> ".join(seen + (target,))
    node = tree
    for segment in target.split("."):
        if not isinstance(node, dict) or segment not in node:
            return None, f"{target} (no such path)"
        node = node[segment]
    if not isinstance(node, dict) or "$value" not in node:
        return None, f"{target} (not a token)"
    return resolve_alias(tree, node["$value"], seen + (target,))
