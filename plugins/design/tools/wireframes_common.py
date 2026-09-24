"""What review and handoff both read from the wireframe lint reports."""
from __future__ import annotations

from pathlib import Path


def green(static: dict, rendered: dict) -> bool:
    return (static.get("summary", {}).get("valid") is True
            and rendered.get("static", {}).get("status") == "passed"
            and rendered.get("rendered", {}).get("status") == "passed"
            and rendered.get("summary", {}).get("validCandidate") is True)


def targets_artifact(report: dict, artifact: Path) -> bool:
    try:
        return Path(report["file"]).resolve() == artifact.resolve()
    except (KeyError, TypeError):
        return False
