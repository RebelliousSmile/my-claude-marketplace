"""contrast.py: known ratios, themes, alpha, and the exit codes of an empty comparison."""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
_spec = importlib.util.spec_from_file_location("design_contrast", ROOT / "contrast.py")
contrast = importlib.util.module_from_spec(_spec)
assert _spec.loader
_spec.loader.exec_module(contrast)


def _contract(tmp_path: Path, semantic: dict, themes: dict | None = None,
              components: dict | None = None) -> str:
    tokens: dict = {"color": {"semantic": {k: {"$value": v} for k, v in semantic.items()}}}
    if themes:
        tokens["themes"] = {name: {"color": {"semantic": {k: {"$value": v} for k, v in over.items()}}}
                            for name, over in themes.items()}
    (tmp_path / "tokens.json").write_text(json.dumps(tokens), encoding="utf-8")
    if components is not None:
        (tmp_path / "components.json").write_text(json.dumps(components), encoding="utf-8")
    return str(tmp_path)


def _ratios(report: dict) -> dict[str, float]:
    return {r["theme"]: r["ratio"] for r in report["results"]}


def test_black_on_white_is_21(tmp_path):
    code, report = contrast.run(_contract(tmp_path, {"text": "#000000", "background": "#ffffff"}))
    assert code == 0
    assert _ratios(report) == {"default": 21.0}


def test_grey_767676_on_white_just_holds_aa(tmp_path):
    code, report = contrast.run(_contract(tmp_path, {"text": "#767676", "background": "#ffffff"}))
    assert code == 0
    (result,) = report["results"]
    assert result["ratio"] == pytest.approx(4.54, abs=0.01)
    assert result["pass"] is True


def test_each_theme_is_evaluated_on_its_own_values(tmp_path):
    code, report = contrast.run(_contract(
        tmp_path, {"text": "#000000", "background": "#ffffff"},
        themes={"dark": {"text": "#767676", "background": "#000000"}}))
    assert code == 0
    ratios = _ratios(report)
    assert ratios["default"] == 21.0
    assert ratios["dark"] == pytest.approx(4.62, abs=0.01)


def test_translucent_foreground_is_composited_over_its_background(tmp_path):
    code, report = contrast.run(_contract(tmp_path, {"text": "#00000020", "background": "#ffffff"}))
    assert code == 0
    (result,) = report["results"]
    assert result["ratio"] == pytest.approx(1.33, abs=0.01)
    assert result["pass"] is False


def test_opaque_alpha_suffix_changes_nothing(tmp_path):
    code, report = contrast.run(_contract(tmp_path, {"text": "#000000ff", "background": "#ffffff"}))
    assert code == 0
    assert _ratios(report) == {"default": 21.0}


def test_translucent_background_is_invalid_input(tmp_path):
    code, report = contrast.run(_contract(tmp_path, {"text": "#000000", "background": "#ffffff80"}))
    assert (code, report) == (2, None)


def test_declared_pair_outside_semantic_is_compared(tmp_path):
    contract = _contract(tmp_path, {"ink": "#000000", "paper": "#ffffff"},
                         components={"components": {"Card": {
                             "foregrounds": ["color.semantic.ink"],
                             "backgrounds": ["color.semantic.paper"]}}})
    code, report = contrast.run(contract)
    assert code == 0
    (result,) = report["results"]
    assert (result["source"], result["component"], result["ratio"]) == ("declared", "Card", 21.0)


def test_nothing_to_compare_exits_3(tmp_path):
    code, report = contrast.run(_contract(tmp_path, {"ink": "#000000", "paper": "#ffffff"}))
    assert code == 3
    assert report["results"] == []
    assert report["coverage"]["unpaired"] == ["color.semantic.ink", "color.semantic.paper"]


def test_allow_unpaired_downgrades_3_to_0_and_says_so(tmp_path):
    code, report = contrast.run(_contract(tmp_path, {"ink": "#000000", "paper": "#ffffff"}),
                                allow_unpaired=True)
    assert code == 0
    assert report["results"] == []
    assert report["unpairedAllowed"] is True
