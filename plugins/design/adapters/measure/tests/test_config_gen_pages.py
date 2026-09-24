"""Regression tests: config-gen derives the fidelity gate per page from oracle.json § pages."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
FIXTURE = Path(__file__).resolve().parent / "fixtures" / "contract-pages"
ENV = {**os.environ, "PYTHONUTF8": "1"}


def _gen(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(ROOT / "config-gen.py"),
         "--components", str(FIXTURE / "components.json"),
         "--tokens", str(FIXTURE / "tokens.json"), *args],
        capture_output=True, text=True, encoding="utf-8", errors="replace", env=ENV)


def _config(tmp_path: Path, page: str, *extra: str, oracle: str = "oracle.json") -> dict:
    out = tmp_path / f"{page}.config.json"
    result = _gen("--oracle", str(FIXTURE / oracle), "--page", page,
                  "--reference-url", (FIXTURE / "mockup.html").as_uri(), "--out", str(out), *extra)
    assert result.returncode == 0, result.stderr
    return json.loads(out.read_text(encoding="utf-8"))


def test_page_keeps_only_its_components(tmp_path):
    names = {t["name"] for t in _config(tmp_path, "a")["targets"]}
    assert names == {"header", "header · logo", "card", "card · title", "card · body"}
    assert not any(n.startswith(("footer", "promo")) for n in names)


def test_mockup_side_is_the_frozen_selector(tmp_path):
    cfg = _config(tmp_path, "a")
    by_name = {t["name"]: t for t in cfg["targets"]}
    assert by_name["card"] == {"name": "card", "mockup": ".tile", "implementation": ".card",
                               "props": ["display", "gap"]}
    assert by_name["card · title"]["mockup"] == ".tile h3"
    assert by_name["card · title"]["implementation"] == ".card__title"
    assert by_name["card · title"]["props"] == ["fontSize"]
    assert cfg["collections"] == [{"name": "cards", "mockup": ".tile", "implementation": ".card"}]
    assert cfg["_excluded"] == [{"component": "header", "element": "nav",
                                 "reason": "mockup nav is a flat image"}]


def test_unknown_page_exits_2(tmp_path):
    result = _gen("--oracle", str(FIXTURE / "oracle.json"), "--page", "zzz",
                  "--reference-url", "http://ref.test", "--out", str(tmp_path / "x.json"))
    assert result.returncode == 2
    assert "zzz" in result.stderr


def test_legacy_oracle_without_pages_is_unchanged(tmp_path):
    out = tmp_path / "legacy.json"
    result = _gen("--oracle", str(FIXTURE / "oracle-legacy.json"), "--page", "a",
                  "--reference-url", "http://ref.test", "--implementation-url", "http://impl.test",
                  "--out", str(out))
    assert result.returncode == 0, result.stderr
    assert "pages" in result.stderr
    expected = json.loads((FIXTURE / "expected-legacy.config.json").read_text(encoding="utf-8"))
    assert json.loads(out.read_text(encoding="utf-8")) == expected


def test_ownership_targets_follow_the_page(tmp_path):
    sheet = tmp_path / "ds.css"
    sheet.write_text(".site-header { gap: 1rem; } .card { gap: 2rem; } "
                     ".site-footer { gap: 3rem; }", encoding="utf-8")
    cfg = _config(tmp_path, "a", "--implementation-url", "http://impl.test",
                  "--ownership-stylesheet", str(sheet))
    classes = {t["class"] for t in cfg["ownership"]["targets"]}
    assert "site-footer" not in classes and "promo" not in classes
    assert {"site-header", "card"} <= classes


@pytest.mark.browser
def test_mockup_only_config_runs_in_mode_a(tmp_path):
    cfg_path = tmp_path / "a.config.json"
    cfg = _config(tmp_path, "a")
    assert cfg["implementation_url"] is None
    cfg_path.write_text(json.dumps(cfg), encoding="utf-8")
    ledger = tmp_path / "deviations.json"
    ledger.write_text('{"active": []}', encoding="utf-8")
    out = tmp_path / "report.json"
    result = subprocess.run(
        [sys.executable, str(ROOT / "measure.py"), "--config", str(cfg_path), "--mode", "A",
         "--side", "mockup", "--ledger-registry", str(ledger), "--out", str(out)],
        capture_output=True, text=True, encoding="utf-8", errors="replace", env=ENV)
    assert result.returncode == 0, result.stderr
    assert "missing" not in out.read_text(encoding="utf-8")


def test_check_complete_reports_skip_and_unplaced():
    result = _gen("--check", "--oracle", str(FIXTURE / "oracle.json"))
    assert result.returncode == 0, result.stdout + result.stderr
    assert "a / header / nav -- mockup nav is a flat image" in result.stdout
    assert "UNPLACED promo" in result.stdout
    banner = result.stdout.strip().splitlines()[-1]
    assert banner.isascii() and "COMPLETE" in banner


def test_check_incomplete_names_each_defect():
    result = _gen("--check", "--oracle", str(FIXTURE / "oracle-incomplete.json"))
    assert result.returncode == 1
    for defect in ("a / header / root : aucun sélecteur maquette",
                   "a / card / body : aucun sélecteur maquette ni skip",
                   "a / card / collection cards : aucun sélecteur maquette",
                   "a / ghost : composant inconnu de components.json",
                   "b : aucun composant"):
        assert defect in result.stdout, result.stdout


def test_check_without_pages_is_a_defect():
    result = _gen("--check", "--oracle", str(FIXTURE / "oracle-legacy.json"))
    assert result.returncode == 1
    assert "pages absent" in result.stdout


def _oracle_copy(tmp_path: Path, mutate) -> Path:
    oracle = json.loads((FIXTURE / "oracle.json").read_text(encoding="utf-8"))
    mutate(oracle)
    path = tmp_path / "oracle.json"
    path.write_text(json.dumps(oracle), encoding="utf-8")
    return path


def test_check_and_page_agree_on_a_non_selector_collection(tmp_path):
    def skip_collection(oracle):
        oracle["pages"]["a"]["components"]["card"]["collections"]["cards"] = {"skip": "x"}
    oracle = _oracle_copy(tmp_path, skip_collection)
    result = _gen("--check", "--oracle", str(oracle))
    assert result.returncode == 1
    assert "a / card / collection cards : aucun sélecteur maquette" in result.stdout


def test_null_page_is_invalid_input(tmp_path):
    def null_page(oracle):
        oracle["pages"]["a"] = None
    oracle = _oracle_copy(tmp_path, null_page)
    result = _gen("--oracle", str(oracle), "--page", "a", "--reference-url", "http://x",
                  "--out", str(tmp_path / "a.config.json"))
    assert result.returncode == 2, result.stderr
    assert "Traceback" not in result.stderr
