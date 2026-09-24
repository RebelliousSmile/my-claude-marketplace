"""Regression tests: per-target props replace the global list in measure.py."""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
FIXTURE = Path(__file__).resolve().parent / "fixtures" / "per-target-props"


def _run(config: Path, out: Path, *extra: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(ROOT / "measure.py"), "--config", str(config),
         "--ledger-registry", str(FIXTURE / "deviations.json"), "--out", str(out), *extra],
        capture_output=True, text=True, encoding="utf-8", errors="replace")


def _config(tmp_path: Path, **overrides) -> Path:
    cfg = json.loads((FIXTURE / "config.json").read_text(encoding="utf-8"))
    cfg.update(overrides)
    cfg["reference_url"] = (FIXTURE / "mockup.html").as_uri()
    cfg["implementation_url"] = (FIXTURE / "impl.html").as_uri()
    path = tmp_path / "config.json"
    path.write_text(json.dumps(cfg), encoding="utf-8")
    return path


@pytest.mark.browser
def test_target_props_replace_global_list(tmp_path):
    out = tmp_path / "report.json"
    result = _run(_config(tmp_path), out)
    assert result.returncode in (0, 1), result.stderr
    rows = json.loads(out.read_text(encoding="utf-8"))["breakpoints"]["desktop"]

    grid = {r["prop"] for r in rows if r["element"] == "Grid · root"}
    assert grid == {"display", "gridTemplateColumns"}
    assert not any(r["match"] for r in rows if r["element"] == "Grid · root")

    title = {r["prop"] for r in rows if r["element"] == "Title"}
    assert title == {"fontSize", "color"}


@pytest.mark.browser
def test_mode_a_extracts_target_props_on_mockup_side(tmp_path):
    out = tmp_path / "report.json"
    result = _run(_config(tmp_path, implementation_url=None), out, "--mode", "A", "--side", "mockup")
    assert result.returncode == 0, result.stderr
    rows = json.loads(out.read_text(encoding="utf-8"))["breakpoints"]["desktop"]
    values = {r["element"]: r["values"] for r in rows}
    assert set(values["Grid · root"]) == {"display", "gridTemplateColumns"}
    assert values["Grid · root"]["display"] == "grid"


def test_target_without_any_props_exits_2(tmp_path):
    out = tmp_path / "report.json"
    result = _run(_config(tmp_path, props=[]), out)
    assert result.returncode == 2
    assert "Title" in result.stderr
    assert "Grid · root" not in result.stderr
    assert not out.exists()
