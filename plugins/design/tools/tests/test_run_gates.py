"""run-gates.py: an unusable configuration is an input error, exit 2, never a traceback."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import pytest

TOOLS = Path(__file__).resolve().parents[1]


@pytest.mark.parametrize("content", [b"\xff\xfe{}", b"{ not json", b"[]"])
def test_unreadable_config_exits_2(tmp_path, content):
    config = tmp_path / "gates.config.json"
    config.write_bytes(content)

    run = subprocess.run([sys.executable, str(TOOLS / "run-gates.py"), "--config", str(config)],
                         capture_output=True, text=True, env={**os.environ, "PYTHONUTF8": "1"})

    assert run.returncode == 2, run.stdout + run.stderr
    assert str(config) in run.stderr
    assert "Traceback" not in run.stderr


def test_a_pivot_report_outside_the_config_directory_is_refused(tmp_path):
    """The realizer's report is deleted before the command runs: an escaping path would let an
    agent-written config delete any file."""
    fixtures = TOOLS.parent / "skills" / "enforce" / "fixtures"
    base = tmp_path / "gates"
    shutil.copytree(fixtures, base)
    outside = tmp_path / "outside.json"
    outside.write_text('{"keep": true}', encoding="utf-8")
    config = base / "gates.escape.config.json"
    config.write_text(json.dumps({
        "contract": "utility",
        "linter": str(fixtures.parent / "adapters" / "lint-core.mjs"),
        "targets": ["utility-clean.html"],
        "pivotReports": [{"path": "../outside.json", "command": [sys.executable, "-c", "pass"]}],
    }), encoding="utf-8")

    run = subprocess.run([sys.executable, str(TOOLS / "run-gates.py"), "--config", str(config)],
                         capture_output=True, text=True, env={**os.environ, "PYTHONUTF8": "1"})

    assert run.returncode == 2, run.stdout + run.stderr
    assert "escapes the config directory" in run.stderr
    assert outside.read_text(encoding="utf-8") == '{"keep": true}'


def test_every_markup_target_is_linted_by_one_node_process(tmp_path):
    """The linter reads the contract once for all targets: one spawn, one verdict per file."""
    fixtures = TOOLS.parent / "skills" / "enforce" / "fixtures"
    counter = tmp_path / "spawns.txt"
    wrapper = tmp_path / "counting-linter.mjs"
    wrapper.write_text(
        "import { appendFileSync } from 'fs';\n"
        "import { pathToFileURL } from 'url';\n"
        f"appendFileSync({json.dumps(str(counter))}, 'x');\n"
        f"await import(pathToFileURL({json.dumps(str(fixtures.parent / 'adapters' / 'lint-core.mjs'))}).href);\n",
        encoding="utf-8")
    targets = ["utility-clean.html", "utility-dirty.html", "utility-var-fallback.html"]
    config = tmp_path / "gates.config.json"
    config.write_text(json.dumps({
        "contract": str(fixtures / "utility"),
        "linter": str(wrapper),
        "targets": [str(fixtures / t) for t in targets],
    }), encoding="utf-8")

    run = subprocess.run([sys.executable, str(TOOLS / "run-gates.py"), "--config", str(config)],
                         capture_output=True, text=True, env={**os.environ, "PYTHONUTF8": "1"})

    assert counter.read_text(encoding="utf-8") == "x", run.stdout + run.stderr
    assert run.returncode == 1, run.stdout + run.stderr
    assert "utility-dirty.html:" in run.stdout and "utility-var-fallback.html:" in run.stdout
    assert "utility-clean.html:" not in run.stdout
