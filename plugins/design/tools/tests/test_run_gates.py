"""run-gates.py: an unreadable configuration is an input error, exit 2, never a traceback."""
from __future__ import annotations

import os
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
