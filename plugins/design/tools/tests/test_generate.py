"""generate.py: a minimal 2.x contract renders byte-for-byte the versioned snapshot."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

TOOLS = Path(__file__).resolve().parents[1]
FIXTURES = Path(__file__).resolve().parent / "fixtures"
EXPECTED = FIXTURES / "generate-expected"


def _generate(contract: Path, out: Path, *extra: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        [sys.executable, str(TOOLS / "generate.py"), "--contract", str(contract), "--out", str(out),
         *extra],
        capture_output=True, text=True, env={**os.environ, "PYTHONUTF8": "1"})


def _contract(tmp_path: Path) -> Path:
    contract = tmp_path / "contract"
    shutil.copytree(FIXTURES / "contract-2x", contract)
    return contract


def test_output_matches_the_snapshot(tmp_path):
    contract, out = _contract(tmp_path), tmp_path / "out"
    run = _generate(contract, out)
    assert run.returncode == 0, run.stderr

    expected = sorted(p.relative_to(EXPECTED) for p in EXPECTED.rglob("*") if p.is_file())
    produced = sorted(p.relative_to(out) for p in out.rglob("*") if p.is_file())
    assert produced == expected
    for rel in expected:
        assert (out / rel).read_bytes() == (EXPECTED / rel).read_bytes(), f"{rel} drifted from the snapshot"


def test_generation_is_recorded_and_check_holds(tmp_path):
    contract, out = _contract(tmp_path), tmp_path / "out"
    assert _generate(contract, out).returncode == 0

    release = json.loads((contract / "release.json").read_text(encoding="utf-8"))
    assert set(release["generated"]) == {"adapters/tokens.css"}
    assert set(release["generated"]["adapters/tokens.css"]["sources"]) == {"tokens.json"}
    assert _generate(contract, out, "--check").returncode == 0


def test_hand_edit_is_a_drift(tmp_path):
    contract, out = _contract(tmp_path), tmp_path / "out"
    assert _generate(contract, out).returncode == 0
    css = out / "adapters" / "tokens.css"
    css.write_text(css.read_text(encoding="utf-8") + "/* edited */\n", encoding="utf-8", newline="\n")

    run = _generate(contract, out, "--check")
    assert run.returncode == 1
    assert "hand-edited" in run.stderr


def _edit(path: Path, change) -> None:
    value = json.loads(path.read_text(encoding="utf-8"))
    change(value)
    path.write_text(json.dumps(value), encoding="utf-8")


@pytest.mark.parametrize("artifact", ["../escaped.css", "adapters/../../escaped.css", "ABSOLUTE"])
def test_an_artifact_outside_out_is_refused_and_nothing_is_written(tmp_path, artifact):
    contract, out = _contract(tmp_path), tmp_path / "out"
    target = str(tmp_path / "escaped.css") if artifact == "ABSOLUTE" else artifact
    _edit(contract / "policies.json", lambda p: p["adapters"].append({"artifact": target, "consumer": "stylesheet"}))

    run = _generate(contract, out)

    assert run.returncode == 2, run.stdout + run.stderr
    assert not (tmp_path / "escaped.css").exists()
    assert not out.exists()


def test_a_theme_name_that_is_not_a_slug_is_refused(tmp_path):
    contract, out = _contract(tmp_path), tmp_path / "out"
    _edit(contract / "tokens.json", lambda t: t.setdefault("themes", {}).update(
        {'dark"] body { color: red } [x="': {"color": {"semantic": {"surface": {"$value": "#000000"}}}}}))

    run = _generate(contract, out)

    assert run.returncode == 2, run.stdout + run.stderr
    assert "not a slug" in run.stderr
    assert not out.exists()


@pytest.mark.parametrize("value", ["#fff; } body { display: none", "1rem</style><script>x()</script>"])
def test_a_token_value_that_breaks_out_of_its_declaration_is_refused(tmp_path, value):
    contract, out = _contract(tmp_path), tmp_path / "out"
    _edit(contract / "tokens.json", lambda t: t["color"]["semantic"]["surface"].update({"$value": value}))

    run = _generate(contract, out)

    assert run.returncode == 2, run.stdout + run.stderr
    assert "color.semantic.surface" in run.stderr
    assert not out.exists()
