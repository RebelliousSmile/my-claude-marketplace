"""Helpers shared by the design tools and adapters.

Not imported by run-gates.py, status.py and migrate-contract.py: those three are copied alone
into a project's design/lint/, where this module does not exist. Their local copies are the
price of that portability, and design-behave fails if one of them starts importing it.

Adapters outside tools/ import it after putting tools/ on sys.path.
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import tempfile
from pathlib import Path
from typing import NoReturn


def fail(message: str) -> int:
    """Print to stderr and return the invocation/invalid-artifact code (2)."""
    print(message, file=sys.stderr)
    return 2


def abort(message: str) -> NoReturn:
    """fail(), for a caller that stops on the spot."""
    raise SystemExit(fail(f"Error: {message}"))


def shape_of(value) -> str:
    if value is None:
        return "null"
    return {dict: "an object", list: "an array", str: "a string",
            bool: "a boolean", int: "a number", float: "a number"}.get(
        type(value), f"a {type(value).__name__}")


def fail_shape(path: Path, field: str, expected: str, got) -> int:
    """A structurally invalid artifact is an environment error, never a drift.

    Name the artifact, the field and the value, and never let an exception reach the user.
    An emission over a malformed source would write files that look generated and carry
    nothing the contract declares.
    """
    seen = json.dumps(got, ensure_ascii=False)
    if len(seen) > 120:
        seen = seen[:117] + "..."
    return fail(f"{path.name} {field} is {shape_of(got)}, expected {expected}: {path.resolve()}\n"
                f"  Got: {seen}\n"
                "  The emission derives from this field. Fix the artifact, or re-run its generator.")


def sha256_hex(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def sha256(path: Path) -> str:
    """The digest as release.json records it."""
    return "sha256:" + sha256_hex(path)


def read_json(path: Path, required: bool = True):
    """Parse an artifact. Returns (value, code); code is None on success. Never raises.

    Absent: an error when required, (None, None) otherwise. Unreadable: always an error.
    """
    if not path.is_file():
        return None, (fail(f"Missing artifact: {path.resolve()}") if required else None)
    try:
        return json.loads(path.read_text(encoding="utf-8")), None
    except (OSError, ValueError) as exc:  # UnicodeDecodeError and JSONDecodeError are ValueErrors
        return None, fail(f"Unreadable {path.name}: {exc}\n  {path.resolve()}")


def atomic_write(path: Path, text: str) -> None:
    """Write through a sibling temporary file and os.replace, in LF: an interrupted run leaves
    the previous file whole, never a truncated one."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(text)
        os.replace(tmp, path)
    except BaseException:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def atomic_json(path: Path, value) -> None:
    atomic_write(path, json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n")
