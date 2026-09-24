#!/usr/bin/env python3
"""Create or revoke a detached wireframe review receipt."""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from _common import atomic_json, sha256_hex
from wireframes_common import green, targets_artifact


def digest(path: Path) -> dict:
    return {"path": str(path.resolve()), "sha256": sha256_hex(path)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    accept = sub.add_parser("accept")
    for flag in ("artifact", "static-report", "rendered-report", "reviewer", "out"):
        accept.add_argument(f"--{flag}", required=True)
    revoke = sub.add_parser("revoke")
    revoke.add_argument("--receipt", required=True); revoke.add_argument("--out", required=True)
    args = parser.parse_args()
    try:
        if args.command == "accept":
            paths = [Path(args.artifact), Path(args.static_report), Path(args.rendered_report)]
            static, rendered = json.loads(paths[1].read_text(encoding="utf-8")), json.loads(paths[2].read_text(encoding="utf-8"))
            if not args.reviewer.strip(): raise ValueError("reviewer must be explicit")
            if not green(static, rendered): raise ValueError("static and rendered reports must both be green")
            if not targets_artifact(static, paths[0]) or not targets_artifact(rendered, paths[0]): raise ValueError("reports must target the exact artifact")
            receipt = {"schemaVersion": 1, "status": "accepted", "reviewer": args.reviewer.strip(), "reviewedAt": datetime.now(timezone.utc).isoformat(), "artifact": digest(paths[0]), "staticReport": digest(paths[1]), "renderedReport": digest(paths[2])}
            output = Path(args.out).resolve()
            if output in {p.resolve() for p in paths}: raise ValueError("receipt output must be distinct")
        else:
            receipt_path, output = Path(args.receipt).resolve(), Path(args.out).resolve()
            if receipt_path == output: raise ValueError("revocation output must be distinct from receipt")
            receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
            if receipt.get("status") != "accepted": raise ValueError("only an accepted receipt can be revoked")
            receipt["status"] = "revoked"
        atomic_json(output, receipt); print(output); return 0
    except (OSError, UnicodeError, json.JSONDecodeError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr); return 2


if __name__ == "__main__":
    raise SystemExit(main())
