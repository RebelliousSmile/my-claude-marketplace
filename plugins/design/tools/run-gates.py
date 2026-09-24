#!/usr/bin/env python3
"""run-gates.py - aggregation runner for the enforcement of one contract.

Routes, never evaluates. Every rule is realized by someone else: the markup rules by
`skills/enforce/adapters/lint-core.mjs`, the others by a `sc-<language>:design-bridge`
pivot that writes back a report. This runner reads the contract, invokes the realizers it
can invoke, collects the reports of those it cannot, and returns one exit code whatever the
call site. It reads no target file and matches no pattern of its own.

A rule with no realizer is not silently dropped: it is listed as unrealized with its
priority. Missing P0/P1 evidence blocks; missing P2 integration only warns.

Registry of enforcement types:  references/enforcement-registry.md
Configuration:                  references/gate-config-schema.md

Prerequisite: Python 3.10+ to start this runner at all, Node.js 18+ for it to invoke the
portable linter. Both are stated in skills/enforce/references/gate-wiring.md.

The runner also opposes the contract's maturity: conformity may only be asserted at or
above `THRESHOLD` (references/maturity-status.md). Below it, the report still lists every
violation the linter and the pivots found, but the run cannot claim conformity — it names
the path that would raise the status and returns 4. The threshold has one executable source,
the `THRESHOLD` constant of `tools/status.py`, imported here rather than restated.

Usage:  python run-gates.py --config <file>
Exit:   0  no violation, and the contract is at or above the conformity threshold
        1  at least one violation, from the linter or from a pivot report
        2  invocation or environment error: unreadable configuration, unknown enforcement
           type, required runtime absent
        3  the contract is in 1.x format - migrate it first (tools/migrate-contract.py)
        4  the contract sits below the conformity threshold: conformity is not asserted, the
           violations are still reported, and the path that raises the status is named
"""
from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path

# The status computation lives in one place. run-gates imports THRESHOLD and the compute
# path from it rather than repeating either the literal or the ladder logic.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from status import THRESHOLD, ContractReadError, compute, meets_threshold, observe  # noqa: E402

POLICIES = "policies.json"
RELEASE = "release.json"

# Mirrors references/enforcement-registry.md. The value is who realizes the type; None is
# the marker itself. A type absent from this table is a decision the runner refuses to make.
REALIZER = {
    "markup": "lint-core",
    "stylesheet": "pivot",
    "source-graph": "pivot",
    "stored-content": "pivot",
    "platform-config": "pivot",
    "unrealized": None,
}


class GateError(Exception):
    """A run that cannot go on, carrying the exit code it must produce.

    The runner has one caller-visible contract: an exit code. Raising rather than threading
    `int | None` through every helper keeps each step readable and keeps the code that ends
    the run next to the reason it ends — the message is printed at the raise site, so a new
    failure path cannot forget to say why.
    """

    def __init__(self, code: int) -> None:
        super().__init__(f"gate run aborted with exit {code}")
        self.code = code


def abort(message: str, code: int = 2) -> GateError:
    """Print the diagnosis and build the error to raise. `raise abort(...)` reads as one step."""
    print(message, file=sys.stderr)
    return GateError(code)


def read_json(path: Path):
    """None for an absent file, the caller names what it means; any other unreadable file -
    permission, directory, bad encoding, bad JSON - is an input error, exit 2."""
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        return None
    except (OSError, ValueError) as exc:
        raise abort(f"{path}: unreadable JSON - {exc}") from exc


def expand(base: Path, patterns) -> list[Path]:
    """Glob relative to the configuration file. A literal path is kept as written, so a
    missing target is reported by name instead of vanishing from an empty match."""
    found: list[Path] = []
    for pattern in patterns:
        if any(ch in pattern for ch in "*?["):
            found.extend(sorted(base.glob(pattern)))
        else:
            found.append(base / pattern)
    return found


def read_config(config_path: Path) -> dict:
    config = read_json(config_path)
    if config is None:
        raise abort(f"Configuration not found: {config_path}")
    if not isinstance(config, dict):
        raise abort(f"{config_path}: expected an object at the root.")
    return config


def resolve_contract(config: dict, config_path: Path) -> Path:
    """Locate the contract and refuse a 1.x one before any realizer is invoked."""
    contract_dir = (config_path.parent / config.get("contract", ".")).resolve()
    if not contract_dir.is_dir():
        raise abort(f"{config_path}: contract directory not found: {contract_dir}")
    if not (contract_dir / RELEASE).is_file():
        raise abort(f"CONTRACT {contract_dir}\n"
                    f"  {RELEASE} absent - contract in 1.x format.\n"
                    f"  Migrate it: python tools/migrate-contract.py --contract {contract_dir}",
                    code=3)
    return contract_dir


def type_rules(contract_dir: Path) -> list[tuple[str, str, str]]:
    """Type every declared rule before invoking anything: an untyped rule makes the whole run
    meaningless, and finding that out after half the targets were linted helps nobody."""
    policies = read_json(contract_dir / POLICIES)
    if policies is None:
        raise abort(f"{contract_dir / POLICIES}: not found, the contract declares it.")

    if not isinstance(policies, dict):
        raise abort(f"{contract_dir / POLICIES}: expected an object at the root.")
    usage = policies.get("usage") or {}
    if not isinstance(usage, dict) or not isinstance(usage.get("rules") or [], list):
        raise abort(f"{contract_dir / POLICIES}: `usage.rules` must be an array.")

    typed: list[tuple[str, str, str]] = []
    seen_ids: set[str] = set()
    for index, rule in enumerate(usage.get("rules") or []):
        if not isinstance(rule, dict):
            raise abort(f"{contract_dir / POLICIES}: usage.rules[{index}] must be an object.")
        rule_id = rule.get("id") or f"usage.rules[{index}]"
        if not isinstance(rule_id, str):
            raise abort(f"{contract_dir / POLICIES}: usage.rules[{index}].id must be a string.")
        if rule_id in seen_ids:
            raise abort(f'{contract_dir / POLICIES}: duplicate rule id "{rule_id}".')
        seen_ids.add(rule_id)
        kind = rule.get("enforcement")
        priority = rule.get("priority", "P1")
        if kind not in REALIZER:
            raise abort(f"{contract_dir / POLICIES}: rule \"{rule_id}\" declares "
                        f"enforcement {kind or 'nothing'}, outside the registry.\n"
                        f"  Allowed: {', '.join(sorted(REALIZER))}\n"
                        f"  See references/enforcement-registry.md")
        if priority not in {"P0", "P1", "P2"}:
            raise abort(f'{contract_dir / POLICIES}: rule "{rule_id}" declares unknown '
                        f'priority {priority}; allowed: P0, P1, P2.')
        typed.append((rule_id, kind, priority))
    return typed


def collect_targets(config: dict, config_path: Path) -> list[Path]:
    targets = expand(config_path.parent, config.get("targets") or [])
    missing = [t for t in targets if not t.is_file()]
    if missing:
        raise abort(f"{config_path}: target(s) not found: "
                    + ", ".join(str(m) for m in missing))
    return targets


def lint_markup(config: dict, config_path: Path, contract_dir: Path,
                targets: list[Path]) -> tuple[list[str], set[str]]:
    """Run the portable linter over every target. Returns its violations and the markup rules
    it reports having realized."""
    violations: list[str] = []
    realized: set[str] = set()
    if not targets:
        return violations, realized

    base = config_path.parent
    linter = (base / config.get("linter", "")).resolve() if config.get("linter") else None
    if linter is None or not linter.is_file():
        raise abort(f"{config_path}: `linter` must point at the portable linter; "
                    f"got {config.get('linter') or 'nothing'}.")
    if shutil.which("node") is None:
        raise abort("Node.js not found on PATH. The runner invokes the portable linter "
                    "with it; without Node no markup rule can be realized.\n"
                    "  Install Node.js 18+, or remove the markup targets from "
                    f"{config_path}.")

    for target in targets:
        argv = ["node", str(linter), str(target), "--contract", str(contract_dir), "--json"]
        if config.get("strict"):
            argv.append("--strict")
        proc = subprocess.run(argv, capture_output=True, text=True, encoding="utf-8")
        if proc.returncode in (2, 3):
            # The linter already diagnosed it; its code is the run's code.
            sys.stderr.write(proc.stderr)
            raise GateError(proc.returncode)
        if proc.returncode not in (0, 1):
            raise abort(f"{target}: linter returned unsupported exit {proc.returncode}; "
                        "allowed protocol exits are 0, 1, 2 and 3.")
        try:
            report = json.loads(proc.stdout) if proc.stdout.strip() else {}
        except json.JSONDecodeError as exc:
            raise abort(f"{target}: linter returned invalid JSON: {exc}")
        if not isinstance(report, dict):
            raise abort(f"{target}: linter JSON root must be an object.")
        report_realized = report.get("realized") or []
        report_errors = report.get("errors") or []
        if (not isinstance(report_realized, list)
                or not all(isinstance(item, str) for item in report_realized)
                or not isinstance(report_errors, list)
                or not all(isinstance(item, str) for item in report_errors)):
            raise abort(f"{target}: linter JSON needs string arrays `realized` and `errors`.")
        realized.update(report_realized)
        for message in report_errors:
            violations.append(f"{target}: {message}")
    return violations, realized


def resolve_pivot_reports(config: dict, config_path: Path) -> list[Path]:
    """A pivot is a skill and cannot be invoked from here, but the native linter it installs is
    a process like any other. Declared with a `command`, it is re-run before its report is
    read. A commanded report must be freshly written by that invocation; declared as a bare path,
    the report is whatever the last run left there. Its absence is what makes the rules unrealized
    at run time."""
    base = config_path.parent
    paths: list[Path] = []
    for entry in config.get("pivotReports") or []:
        if isinstance(entry, str):
            # A bare path is optional evidence. Its absence leaves the assigned rule
            # unrealized; it is not an invocation/protocol error.
            paths.extend(path for path in expand(base, [entry]) if path.is_file())
            continue
        if not isinstance(entry, dict) or not entry.get("path"):
            raise abort(f"{config_path}: each pivotReports entry is a path, or an object "
                        f"carrying `path` and optionally `command`; got {entry!r}.")
        has_command = "command" in entry
        command = entry.get("command")
        report_path = base / entry["path"]
        try:
            report_path.resolve().relative_to(base.resolve())
        except ValueError:
            # The realizer's report is deleted, then restored: a path outside the config
            # directory would let an agent-written config remove any file.
            raise abort(f"{config_path}: pivot report {entry['path']!r} escapes "
                        f"the config directory {base.resolve()}") from None
        if has_command:
            if (not isinstance(command, list) or not command
                    or not all(isinstance(a, str) and a for a in command)):
                raise abort(f"{config_path}: `command` of {entry['path']} must be a list of "
                            "one or more non-empty strings - no shell, so no quoting rule to get wrong.")
            previous = report_path.read_bytes() if report_path.is_file() else None
            if report_path.is_file():
                report_path.unlink()
            try:
                proc = subprocess.run(command, cwd=base, capture_output=True, text=True)
            except FileNotFoundError:
                if previous is not None:
                    report_path.write_bytes(previous)
                raise abort(f"{config_path}: realizer not found: {command[0]}\n"
                            f"  Declared to produce {entry['path']}. Install it, or drop the "
                            "`command` to read the report as it stands.")
            if proc.returncode not in (0, 1):
                if previous is not None:
                    report_path.write_bytes(previous)
                detail = (proc.stderr or proc.stdout).strip()
                suffix = f"\n  {detail}" if detail else ""
                raise abort(f"{config_path}: realizer failed with exit {proc.returncode}: "
                            f"{command[0]}{suffix}")
            if not report_path.is_file():
                if previous is not None:
                    report_path.write_bytes(previous)
                raise abort(f"{config_path}: realizer produced no report: {report_path}")
            paths.append(report_path)
        elif report_path.is_file():
            paths.append(report_path)
    return paths


def read_pivot_reports(report_paths: list[Path], config_path: Path,
                       priorities: dict[str, str]) -> tuple[dict[str, str], dict[str, str], list[str], list[str]]:
    """Returns, per rule id: who realized it, who declined it, and the violations found."""
    reported: dict[str, str] = {}
    declined: dict[str, str] = {}
    violations: list[str] = []
    warnings: list[str] = []
    seen_rule_ids: set[str] = set()
    for path in report_paths:
        payload = read_json(path)
        if payload is None:
            raise abort(f"{config_path}: pivot report not found: {path}")
        if not isinstance(payload, dict):
            raise abort(f"{path}: expected an object at the root.")
        realizer = payload.get("realizer", str(path))
        if not isinstance(realizer, str) or not realizer.strip():
            raise abort(f"{path}: `realizer` must be a non-empty string.")
        rules = payload.get("rules", [])
        if not isinstance(rules, list):
            raise abort(f"{path}: `rules` must be an array.")
        for entry in rules:
            if not isinstance(entry, dict):
                raise abort(f"{path}: every report rule must be an object.")
            rule_id = entry.get("id")
            if not isinstance(rule_id, str) or not rule_id:
                raise abort(f"{path}: a report entry declares no valid rule id.")
            if rule_id not in priorities:
                raise abort(f'{path}: report names undeclared rule "{rule_id}".')
            if rule_id in seen_rule_ids:
                raise abort(f'{path}: duplicate report for rule "{rule_id}".')
            seen_rule_ids.add(rule_id)
            status = entry.get("status")
            if status not in {"pass", "fail", "unrealized"}:
                raise abort(f'{path}: rule "{rule_id}" declares unknown status '
                            f'{status!r}; allowed: pass, fail, unrealized.')
            messages = entry.get("violations", [])
            if not isinstance(messages, list) or not all(isinstance(message, str) for message in messages):
                raise abort(f'{path}: rule "{rule_id}" violations must be an array of strings.')
            if status != "fail" and messages:
                raise abort(f'{path}: rule "{rule_id}" may carry violations only when status is fail.')
            if status == "unrealized":
                # The pivot was assigned the rule and says it did not realize it. Louder than
                # silence, and the only case that tells apart "not run" from "cannot cover".
                declined[rule_id] = realizer
                continue
            reported[rule_id] = realizer
            if status == "fail":
                for message in messages or [rule_id]:
                    rendered = f"{realizer}: {message}"
                    (warnings if priorities.get(rule_id, "P1") == "P2" else violations).append(rendered)
    return reported, declined, violations, warnings


def read_workflow_checks(config: dict, config_path: Path) -> list[str]:
    """Read P2 integration checks. They stay visible but never block design correctness."""
    warnings: list[str] = []
    for entry in config.get("workflowChecks") or []:
        if not isinstance(entry, dict) or not entry.get("id"):
            raise abort(f"{config_path}: every workflowChecks entry needs an id.")
        if entry.get("status") not in {"pass", "fail"}:
            raise abort(f"{config_path}: workflow check {entry['id']} needs status pass or fail.")
        if entry["status"] == "fail":
            warnings.append(f"{entry['id']}: {entry.get('message') or 'workflow integration missing'}")
    return warnings


def render_rules(typed: list[tuple[str, str, str]], reported: dict[str, str],
                 declined: dict[str, str], realized_markup: set[str]) -> list[tuple[str, str]]:
    """Print one line per declared rule; return the ids left unrealized."""
    unrealized: list[tuple[str, str]] = []
    for rule_id, kind, priority in typed:
        if kind == "markup" and rule_id in realized_markup:
            print(f"  REALIZED   {rule_id} ({kind}, {priority}) by lint-core")
        elif rule_id in reported:
            # A rule the contract declares with no realizer, that a pivot covered anyway, is
            # realized: it was measured, and `read_pivot_reports` already counted whatever it
            # found. Demoting it here would print "not verified" above its own violations. But
            # the contract is stale on that point, and a line that hid it would assert a
            # coverage the contract routes to nobody. Realized, and said out loud.
            stale = " - the contract declares no realizer for it" if kind == "unrealized" else ""
            print(f"  REALIZED   {rule_id} ({kind}, {priority}) by {reported[rule_id]}{stale}")
        elif rule_id in declined:
            unrealized.append((rule_id, priority))
            print(f"  UNREALIZED {rule_id} ({kind}, {priority}) - {declined[rule_id]} reports it unrealized")
        elif kind == "unrealized":
            unrealized.append((rule_id, priority))
            print(f"  UNREALIZED {rule_id} ({priority}) - declared with no realizer")
        else:
            unrealized.append((rule_id, priority))
            print(f"  UNREALIZED {rule_id} ({kind}, {priority}) - no report from its realizer")
    return unrealized


def render_verdict(contract_dir: Path, targets: list[Path], realized_markup: set[str],
                   typed: list[tuple[str, str, str]], reported: dict[str, str],
                   declined: dict[str, str], violations: list[str], warnings: list[str]) -> int:
    print(f"CONTRACT {contract_dir}")
    print(f"TARGETS  {len(targets)} file(s), markup rules realized: "
          f"{', '.join(sorted(realized_markup)) or 'none'}")

    unrealized = render_rules(typed, reported, declined, realized_markup)

    blocking_missing = [rule_id for rule_id, priority in unrealized if priority in {"P0", "P1"}]
    warnings.extend(f"missing P2 evidence for {rule_id}" for rule_id, priority in unrealized if priority == "P2")

    for message in violations:
        print(f"  VIOLATION {message}")
    for message in warnings:
        print(f"  WARNING P2 {message}")

    if unrealized:
        print(f"UNREALIZED {len(unrealized)} rule(s) - missing P0/P1 evidence blocks; P2 only warns.")

    exit_code = 0
    if violations or blocking_missing:
        for rule_id in blocking_missing:
            print(f"  MISSING EVIDENCE {rule_id} (P0/P1)")
        print(f"FAIL {len(violations)} violation(s), {len(blocking_missing)} blocking evidence gap(s).")
        exit_code = 1

    # Oppose the maturity threshold last, once every violation is already on the report. Below
    # it, conformity cannot be asserted whatever the violation count - so exit 4 supersedes
    # both the 1 of a violation and the 0 of a clean run, and the report keeps the violations.
    try:
        status_value = compute(observe(contract_dir))
    except ContractReadError as exc:
        raise abort(str(exc)) from exc
    if not meets_threshold(status_value):
        print(f"BELOW THRESHOLD status \"{status_value}\" is under \"{THRESHOLD}\"; "
              "conformity is not asserted.")
        print(f"  Raise it: python tools/status.py --contract {contract_dir} names the status; "
              "record the missing checks at adjust/02-freeze.md and lift the capping gaps.")
        print("  See references/maturity-status.md for the gap-to-cap table.")
        return 4

    if not violations and not blocking_missing:
        print(f"OK   no blocking violation ({len(warnings)} P2 warning(s)).")
    return exit_code


def run(config_path: Path) -> int:
    """Read, realize, report. Each step raises GateError with its own exit code; this function
    holds the order of the steps and nothing else."""
    try:
        config = read_config(config_path)
        contract_dir = resolve_contract(config, config_path)
        typed = type_rules(contract_dir)
        priorities = {rule_id: priority for rule_id, _kind, priority in typed}
        targets = collect_targets(config, config_path)

        violations, realized_markup = lint_markup(config, config_path, contract_dir, targets)
        report_paths = resolve_pivot_reports(config, config_path)
        reported, declined, pivot_violations, pivot_warnings = read_pivot_reports(
            report_paths, config_path, priorities)
        violations.extend(pivot_violations)
        warnings = pivot_warnings + read_workflow_checks(config, config_path)

        return render_verdict(contract_dir, targets, realized_markup, typed,
                              reported, declined, violations, warnings)
    except GateError as error:
        return error.code


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="run-gates.py",
        description="Aggregate the enforcement of one contract into a single exit code.")
    parser.add_argument("--config", required=True,
                        help="gate configuration file; every path it holds is relative to it")
    args = parser.parse_args(argv)
    # Violation messages are contract text and carry whatever the contract is written in.
    # A gate must never die on the encoding of the console or of a redirection.
    for stream in (sys.stdout, sys.stderr):
        stream.reconfigure(encoding="utf-8", errors="replace")
    return run(Path(args.config))


if __name__ == "__main__":
    sys.exit(main())
