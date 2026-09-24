"""migrate-contract.py: a minimal 1.x contract becomes a 2.x one that run-gates reads."""
from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

TOOLS = Path(__file__).resolve().parents[1]
FIXTURES = Path(__file__).resolve().parent / "fixtures"
ENV = {**os.environ, "PYTHONUTF8": "1"}
NOW = "2026-09-24T00:00:00+00:00"


def _run(script: str, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run([sys.executable, str(TOOLS / script), *args],
                          capture_output=True, text=True, env=ENV)


def _migrated(tmp_path: Path) -> Path:
    contract = tmp_path / "contract"
    shutil.copytree(FIXTURES / "contract-1x", contract)
    run = _run("migrate-contract.py", "--contract", str(contract), "--now", NOW)
    assert run.returncode == 0, run.stderr
    return contract


def test_release_carries_the_required_fields(tmp_path):
    contract = _migrated(tmp_path)
    release = json.loads((contract / "release.json").read_text(encoding="utf-8"))

    assert release["$format"] == "2.0"
    assert release["designSystem"] == {"version": "1.2.0"}
    assert set(release["artifacts"]) == {"tokens.json", "components.json", "policies.json",
                                         "oracle.json"}
    for entry in release["artifacts"].values():
        assert entry["version"] == "1.2.0"
        assert entry["sourceHash"].startswith("sha256:")
    assert release["charter"] == {"present": True, "path": "design-system.md", "version": "1.2.0"}
    assert release["provenance"] == {"producedBy": "migrate-contract.py", "producedAt": NOW,
                                     "from": "1.x contract"}
    assert release["status"] == "normalized"


def test_the_1x_contract_is_backed_up(tmp_path):
    contract = _migrated(tmp_path)
    backup = contract / ".contract-1x"
    for name in ("components.json", "tokens.json", "design-system.md"):
        assert (backup / name).read_bytes() == (FIXTURES / "contract-1x" / name).read_bytes()


def test_run_gates_reads_the_migrated_contract(tmp_path):
    contract = _migrated(tmp_path)
    config = tmp_path / "gates.json"
    config.write_text(json.dumps({"contract": contract.name, "targets": []}), encoding="utf-8")

    run = _run("run-gates.py", "--config", str(config))
    # A fresh migration is `normalized`, below the conformity threshold: run-gates reads it as a
    # 2.x contract (never 2 invalid, never 3 still 1.x) and withholds conformity with 4.
    assert run.returncode == 4, run.stdout + run.stderr
    assert 'status "normalized"' in run.stdout


def test_a_second_migration_is_a_no_op(tmp_path):
    contract = _migrated(tmp_path)
    before = (contract / "release.json").read_bytes()
    run = _run("migrate-contract.py", "--contract", str(contract), "--now", "2027-01-01T00:00:00+00:00")
    assert run.returncode == 0, run.stderr
    assert (contract / "release.json").read_bytes() == before


def test_a_leftover_backup_is_refused_and_kept(tmp_path):
    contract = tmp_path / "contract"
    shutil.copytree(FIXTURES / "contract-1x", contract)
    backup = contract / ".contract-1x"
    backup.mkdir()
    (backup / "components.json").write_text('{"only": "copy"}', encoding="utf-8")
    before = sorted((p.relative_to(contract), p.read_bytes()) for p in contract.rglob("*")
                    if p.is_file())

    run = _run("migrate-contract.py", "--contract", str(contract), "--now", NOW)

    assert run.returncode == 2, run.stdout + run.stderr
    assert ".contract-1x" in run.stderr
    after = sorted((p.relative_to(contract), p.read_bytes()) for p in contract.rglob("*")
                   if p.is_file())
    assert after == before


def test_no_temporary_file_is_left_behind(tmp_path):
    contract = _migrated(tmp_path)
    assert not list(contract.glob(".*.tmp"))
