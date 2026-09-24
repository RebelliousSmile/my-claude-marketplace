"""An unusable input exits 2 with a message naming it: never 1 (a violation), never a traceback.

Every case fails before a browser would start, so none of them needs Playwright.
"""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
ENV = {**os.environ, "PYTHONUTF8": "1"}
VALID = {"reference_url": "mockup.html", "implementation_url": "impl.html",
         "props": ["color"], "targets": [{"name": "t", "mockup": ".a", "implementation": ".a"}],
         "breakpoints": [{"name": "desktop", "width": 320, "height": 240}]}


def _run(script: str, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run([sys.executable, str(ROOT / script), *args],
                          capture_output=True, text=True, env=ENV)


def _config(tmp_path: Path, content) -> Path:
    path = tmp_path / "config.json"
    if isinstance(content, bytes):
        path.write_bytes(content)
    else:
        path.write_text(content if isinstance(content, str) else json.dumps(content),
                        encoding="utf-8")
    return path


def _without(key: str) -> dict:
    return {k: v for k, v in VALID.items() if k != key}


CASES = {
    "absent": None,
    "invalid-json": "{ not json",
    "not-utf8": b"\xff\xfe{}",
    "root-array": [],
    "targets-missing": _without("targets"),
    "targets-wrong-type": {**VALID, "targets": {"t": ".a"}},
    "target-without-name": {**VALID, "targets": [{"mockup": ".a"}]},
    "breakpoints-missing": _without("breakpoints"),
    "breakpoint-width-string": {**VALID, "breakpoints": [{"name": "d", "width": "320", "height": 240}]},
}


def _invocation(script: str, config: Path, tmp_path: Path) -> list[str]:
    if script == "measure.py":
        return ["--config", str(config), "--out", str(tmp_path / "report.json"),
                "--ledger-registry", str(tmp_path / "deviations.json")]
    return ["--config", str(config), "--out", str(tmp_path / "shots")]


@pytest.mark.parametrize("script", ["measure.py", "screenshot.py"])
@pytest.mark.parametrize("case", list(CASES))
def test_bad_config_exits_2(tmp_path, script, case):
    content = CASES[case]
    config = tmp_path / "absent.json" if content is None else _config(tmp_path, content)

    run = _run(script, *_invocation(script, config, tmp_path))

    assert run.returncode == 2, run.stdout + run.stderr
    assert "config error" in run.stderr
    assert "Traceback" not in run.stderr


@pytest.mark.parametrize("components", [[], {"components": []}, {"components": {"btn": []}},
                                        {"components": {"btn": {"elements": []}}}])
def test_config_gen_refuses_a_malformed_components_json(tmp_path, components):
    (tmp_path / "components.json").write_text(json.dumps(components), encoding="utf-8")
    (tmp_path / "tokens.json").write_text("{}", encoding="utf-8")

    run = _run("config-gen.py", "--components", str(tmp_path / "components.json"),
               "--tokens", str(tmp_path / "tokens.json"), "--check")

    assert run.returncode == 2, run.stdout + run.stderr
    assert "config-gen error" in run.stderr
    assert "Traceback" not in run.stderr


@pytest.mark.parametrize("oracle", [[], {"components": {"btn": "x"}}, {"pages": []},
                                    {"pages": {"home": {"components": []}}},
                                    {"components": {"btn": {"elements": {"label": 1}}}}])
def test_config_gen_refuses_a_malformed_oracle_json(tmp_path, oracle):
    (tmp_path / "components.json").write_text(json.dumps({"components": {}}), encoding="utf-8")
    (tmp_path / "oracle.json").write_text(json.dumps(oracle), encoding="utf-8")
    (tmp_path / "tokens.json").write_text("{}", encoding="utf-8")

    run = _run("config-gen.py", "--components", str(tmp_path / "components.json"),
               "--tokens", str(tmp_path / "tokens.json"), "--check")

    assert run.returncode == 2, run.stdout + run.stderr
    assert "Traceback" not in run.stderr
