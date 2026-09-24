#!/usr/bin/env python3
"""Unit tests for the colour normaliser introduced in design 2.7.0 (measure.py).

Run:  python -m pytest tests/test_color_norm.py -q
  or: python tests/test_color_norm.py     (no pytest required)

The contract under test, in one sentence: the oracle must stop reporting two spellings of the same
colour as a difference, WITHOUT gaining any tolerance for colours that genuinely differ.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "_shared"))

from colors import normalize_color as _normalize_color, split_top_level as _split_top_level  # noqa: E402
from measure import COLOR_PROPS, _color_match  # noqa: E402


# --- the pair that motivated the change -------------------------------------------------------

def test_the_serialization_artefact_is_absorbed():
    """The exact pair measured in Chromium on site-footer, both directions of the comparison."""
    a = "rgba(255, 255, 255, 0.7)"
    b = "color(srgb 1 1 1 / 0.7)"
    assert _normalize_color(a) == _normalize_color(b)
    assert _color_match("color", a, b) is True
    assert _color_match("color", b, a) is True
    assert _color_match("borderColor", a, b) is True


def test_the_other_three_pairs_seen_in_the_reports():
    for a, b in [
        ("rgba(255, 255, 255, 0.4)", "color(srgb 1 1 1 / 0.4)"),
        ("rgba(255, 255, 255, 0.12)", "color(srgb 1 1 1 / 0.12)"),
        ("rgb(232, 155, 60)", "rgb(232, 155, 60)"),
    ]:
        assert _color_match("color", a, b) is True, (a, b)


# --- negative cases: the normaliser must NOT be a tolerance -----------------------------------

def test_near_identical_colours_still_differ():
    """#FFFFFF vs #FFFFEE — one channel apart. A fuzzy comparison would call these equal."""
    assert _normalize_color("#FFFFFF") != _normalize_color("#FFFFEE")
    assert _color_match("color", "#FFFFFF", "#FFFFEE") is False
    # and against the functional spellings of the same two colours
    assert _color_match("color", "rgb(255, 255, 255)", "rgb(255, 255, 238)") is False
    assert _color_match("color", "color(srgb 1 1 1)", "#FFFFEE") is False


def test_near_identical_alpha_still_differs():
    """0.7 vs 0.71 — 4-decimal alpha must keep them apart."""
    assert _normalize_color("rgba(0, 0, 0, 0.7)") != _normalize_color("rgba(0, 0, 0, 0.71)")
    assert _color_match("color", "rgba(0, 0, 0, 0.7)", "rgba(0, 0, 0, 0.71)") is False
    assert _color_match("color", "rgba(255, 255, 255, 0.7)", "color(srgb 1 1 1 / 0.71)") is False


def test_one_channel_off_by_one_still_differs():
    assert _color_match("color", "rgb(232, 155, 60)", "rgb(232, 155, 61)") is False


# --- unparseable values fall back to string equality, never to a match ------------------------

def test_garbage_returns_none():
    for junk in ["", "   ", "not-a-colour", "rgb(", "url(#grad)", "linear-gradient(red, blue)",
                 "rgb(a, b, c)", "#12345", "color(srgb 1 1)"]:
        assert _normalize_color(junk) is None, junk


def test_unparseable_falls_back_to_string_equality_not_to_true():
    """The load-bearing safety property: an unparseable value is compared as a string."""
    assert _color_match("color", "linear-gradient(red, blue)", "linear-gradient(red, blue)") is True
    assert _color_match("color", "linear-gradient(red, blue)", "linear-gradient(red, green)") is False
    # one side parseable, the other not -> string equality -> False, NOT a silent match
    assert _color_match("color", "rgb(255, 0, 0)", "not-a-colour") is False
    assert _color_match("color", "not-a-colour", "rgb(255, 0, 0)") is False


def test_unsupported_colour_spaces_are_not_folded():
    """oklch/lab/display-p3 return None rather than a wrong conversion (recorded limitation)."""
    for v in ["oklch(0.7 0.1 200)", "lab(50% 40 59.5)", "color(display-p3 1 1 1)", "hsl(0, 100%, 50%)"]:
        assert _normalize_color(v) is None, v
    # they therefore compare as strings, which is a false diff at worst, never a false match
    assert _color_match("color", "oklch(0.7 0.1 200)", "oklch(0.7 0.1 200)") is True
    assert _color_match("color", "oklch(0.7 0.1 200)", "rgb(0, 128, 128)") is False


# --- the allow-list: non-colour properties keep raw string equality ---------------------------

def test_only_color_props_are_normalized():
    a, b = "rgba(255, 255, 255, 0.7)", "color(srgb 1 1 1 / 0.7)"
    for p in sorted(COLOR_PROPS):
        assert _color_match(p, a, b) is True, p
    for p in ["fontSize", "fontWeight", "letterSpacing", "boxShadow", "background", "borderRadius"]:
        assert _color_match(p, a, b) is False, p


def test_allow_list_membership_is_exactly_the_declared_colour_properties():
    assert COLOR_PROPS == frozenset({
        "color", "backgroundColor", "borderColor", "borderTopColor", "borderRightColor",
        "borderBottomColor", "borderLeftColor", "outlineColor", "textDecorationColor",
        "fill", "stroke",
    })


# --- shorthand values (borderColor carries up to four colours) --------------------------------

def test_shorthand_three_colours_from_the_live_reports():
    a = "rgba(255, 255, 255, 0.7) rgba(255, 255, 255, 0.7) rgba(255, 255, 255, 0.12)"
    b = "color(srgb 1 1 1 / 0.7) color(srgb 1 1 1 / 0.7) color(srgb 1 1 1 / 0.12)"
    assert _color_match("borderColor", a, b) is True

    a2 = "rgb(232, 155, 60) rgba(255, 255, 255, 0.7) rgba(255, 255, 255, 0.7)"
    b2 = "rgb(232, 155, 60) color(srgb 1 1 1 / 0.7) color(srgb 1 1 1 / 0.7)"
    assert _color_match("borderColor", a2, b2) is True


def test_shorthand_differing_in_one_component_still_differs():
    a = "rgb(232, 155, 60) rgba(255, 255, 255, 0.7) rgba(255, 255, 255, 0.7)"
    b = "rgb(232, 155, 60) color(srgb 1 1 1 / 0.7) color(srgb 1 1 1 / 0.12)"
    assert _color_match("borderColor", a, b) is False


def test_shorthand_arity_is_significant():
    """Three colours is not the same declaration as one, even if the first matches."""
    assert _color_match("borderColor",
                        "rgba(255, 255, 255, 0.7)",
                        "color(srgb 1 1 1 / 0.7) color(srgb 1 1 1 / 0.7) color(srgb 1 1 1 / 0.7)") is False


def test_shorthand_with_one_unparseable_component_is_none():
    assert _normalize_color("rgb(0, 0, 0) oklch(0.7 0.1 200)") is None


def test_split_top_level_keeps_parenthesised_groups_intact():
    """Only top-level whitespace splits; the spaces and commas INSIDE rgba(…) are preserved."""
    assert _split_top_level("rgba(255, 255, 255, 0.7) rgb(1, 2, 3)") == [
        "rgba(255, 255, 255, 0.7)", "rgb(1, 2, 3)",
    ]
    assert _split_top_level("color(srgb 1 1 1 / 0.7)") == ["color(srgb 1 1 1 / 0.7)"]
    assert len(_split_top_level(
        "rgb(232, 155, 60) rgba(255, 255, 255, 0.7) rgba(255, 255, 255, 0.7)")) == 3


# --- accepted spellings -----------------------------------------------------------------------

def test_hex_forms():
    assert _normalize_color("#fff") == _normalize_color("#FFFFFF") == "rgba(255, 255, 255, 1)"
    assert _normalize_color("#000000") == "rgba(0, 0, 0, 1)"
    # 4-digit shorthand doubles each digit: #fff8 is #ffffff88, NOT #ffffff80.
    assert _normalize_color("#fff8") == _normalize_color("#ffffff88") == "rgba(255, 255, 255, 0.5333)"
    assert _normalize_color("#FFFFFF80") == "rgba(255, 255, 255, 0.502)"
    assert _normalize_color("#FFFFFF80") != _normalize_color("#fff8")


def test_keywords():
    assert _normalize_color("transparent") == "rgba(0, 0, 0, 0)"
    assert _color_match("color", "transparent", "rgba(0, 0, 0, 0)") is True
    assert _normalize_color("currentcolor") == "currentcolor"
    assert _color_match("color", "currentColor", "currentcolor") is True
    assert _color_match("color", "transparent", "rgba(0, 0, 0, 1)") is False


def test_modern_space_separated_rgb_syntax():
    assert _color_match("color", "rgb(255 255 255 / 0.7)", "rgba(255, 255, 255, 0.7)") is True
    assert _color_match("color", "rgb(100% 100% 100%)", "rgb(255, 255, 255)") is True


def test_alpha_as_percentage():
    assert _color_match("color", "rgba(0, 0, 0, 50%)", "rgba(0, 0, 0, 0.5)") is True


def test_non_string_input_is_none():
    assert _normalize_color(None) is None
    assert _normalize_color(42) is None


if __name__ == "__main__":
    failed = 0
    tests = [(n, o) for n, o in sorted(globals().items())
             if n.startswith("test_") and callable(o)]
    for name, fn in tests:
        try:
            fn()
            print(f"  PASS  {name}")
        except AssertionError as exc:
            failed += 1
            print(f"  FAIL  {name}: {exc}")
    print(f"\n{len(tests) - failed}/{len(tests)} passed")
    sys.exit(1 if failed else 0)
