#!/usr/bin/env python3
"""generate.py - deterministic generation of every derived artifact of a contract.

The ONLY producer of a derived artifact. No model authors one, no hand edits one: a hand
edit is a drift, reported by --check, and no flag suppresses it.

What is emitted is declared by the contract, never known by name here. One artifact per
`policies.json § adapters[]` entry that declares a `consumer`; the consumer value selects
the emitter. Consumer values are roles, never stacks - a stack-shaped artifact is rendered
by the pivot that owns that stack (DEC-002).

Most roles derive from tokens.json. The `deviation ledger` role derives from deviations.json
instead: the human-readable Markdown view of the structured deviation source. Its source is
per role, so a role reads what it needs without widening anyone else's drift record.

Specification: references/token-schema.md § Generator specification
Drift record:  references/contract-schema.md § Enregistrement de derive

Usage:  python generate.py --contract <dir> [--out <dir>] [--check]
Exit:   0  every artifact written, or --check found no drift
        1  --check found a drift: a generated file was hand-edited, deleted, or a source
           changed without regeneration
        2  invocation error, or a structurally invalid artifact
        3  the contract is in 1.x format - migrate it first (tools/migrate-contract.py)
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

TOKENS = "tokens.json"
POLICIES = "policies.json"
RELEASE = "release.json"
DEVIATIONS = "deviations.json"

# Roles, not stacks. The closed list of contract-schema.md, minus `unknown` which is never
# emitted. A shape a role does not cover belongs to a pivot, not here.
CSS_ROLES = ("stylesheet", "stylesheet source")
FLAT_ROLES = ("platform token file", "build configuration")
LEDGER_ROLES = ("deviation ledger",)


def source_for(role: str) -> str:
    """The artifact a role derives from. Roles read tokens.json; the ledger reads its own."""
    return DEVIATIONS if role in LEDGER_ROLES else TOKENS

ALIAS_RE = re.compile(r"^\{([^}]+)\}$")


def fail(message: str) -> int:
    print(message, file=sys.stderr)
    return 2


def shape_of(value) -> str:
    if value is None:
        return "null"
    return {dict: "an object", list: "an array", str: "a string",
            bool: "a boolean", int: "a number", float: "a number"}.get(
        type(value), f"a {type(value).__name__}")


def fail_shape(path: Path, field: str, expected: str, got) -> int:
    """A structurally invalid artifact is an environment error, never a drift.

    Same contract as migrate-contract.py: name the artifact, the field and the value, and
    never let an exception reach the user. An emission over a malformed source would write
    files that look generated and carry nothing the contract declares.
    """
    seen = json.dumps(got, ensure_ascii=False)
    if len(seen) > 120:
        seen = seen[:117] + "..."
    return fail(f"{path.name} {field} is {shape_of(got)}, expected {expected}: {path.resolve()}\n"
                f"  Got: {seen}\n"
                "  The emission derives from this field. Fix the artifact, or re-run its generator.")


def sha256(path: Path) -> str:
    return "sha256:" + hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path: Path):
    """Parse an artifact, or return an exit code. Never raises."""
    if not path.is_file():
        return None, fail(f"Missing artifact: {path.resolve()}")
    try:
        return json.loads(path.read_text(encoding="utf-8")), None
    except ValueError as exc:
        return None, fail(f"Unreadable {path.name}: {exc}")


# --- token tree -------------------------------------------------------------------------

def flatten(tree: dict, prefix: tuple = ()) -> list:
    """Depth-first, source order. Returns [(path tuple, $value)] for every token node.

    Order is the source's own key order and is never re-sorted: a reordering of the source
    is a source change, and the drift gate is entitled to see it as one.
    """
    out = []
    for key, node in tree.items():
        if not isinstance(node, dict):
            continue
        if "$value" in node:
            out.append((prefix + (key,), node["$value"]))
        else:
            out.extend(flatten(node, prefix + (key,)))
    return out


def var_name(path: tuple) -> str:
    """The canonical path-to-variable transform. One way only, never inverted."""
    return "--" + "-".join(path)


def resolve_literal(value, base: dict, seen: tuple = ()) -> tuple:
    """Follow {alias} chains to a literal. Returns (value, error) - error names the cycle."""
    match = ALIAS_RE.match(value) if isinstance(value, str) else None
    if match is None:
        return value, None
    target = match.group(1)
    if target in seen:
        return None, " -> ".join(seen + (target,))
    node = base
    for segment in target.split("."):
        if not isinstance(node, dict) or segment not in node:
            return None, f"{target} (no such path)"
        node = node[segment]
    if not isinstance(node, dict) or "$value" not in node:
        return None, f"{target} (not a token)"
    return resolve_literal(node["$value"], base, seen + (target,))


# --- emitters ---------------------------------------------------------------------------

def banner(sources: list, comment: str) -> str:
    listed = ", ".join(sources)
    if comment == "css":
        return f"/* GENERATED from {listed} - do not edit by hand. Regenerate via tools/generate.py. */\n"
    if comment == "md":
        return f"<!-- GENERATED from {listed} - do not edit by hand. Regenerate via tools/generate.py. -->\n"
    return f"// GENERATED from {listed} - do not edit by hand. Regenerate via tools/generate.py.\n"


def css_list_value(value: list):
    """Serialize a list-typed $value to valid CSS.

    Two groups reach this function with a list $value (token-schema.md's documented
    exceptions): font.family.* (list of family names) and motion.easing.* (a
    cubic-bezier's four numbers). A third list shape, multi-layer shadow.* (a list of
    shadow objects), is intercepted by css_value() before it gets here. Distinguished
    by element type, not by the caller knowing which group it is - css_value() never
    receives $type, only $value.

    A bare Python str()/repr() of the list is not CSS (it wraps names in single quotes
    it never closes correctly for consumers and keeps the brackets) - that bug shipped
    a `['Bilbo', 'Ephesis', ...]` literal into :root as a custom-property value.
    """
    if all(isinstance(item, str) for item in value):
        # font-family list: quote entries containing whitespace (multi-word names),
        # leave single-token names and generic keywords (sans-serif, cursive, system-ui,
        # ...) bare - matches how a browser re-serializes font-family in getComputedStyle.
        return ", ".join(f'"{item}"' if " " in item else item for item in value)
    if all(isinstance(item, (int, float)) for item in value):
        return "cubic-bezier(" + ", ".join(str(item) for item in value) + ")"
    return None


def css_shadow_value(value: dict):
    """Serialize a shadow $type's {color, offsetX, offsetY, blur, spread} object to CSS.

    box-shadow shorthand order is offsetX offsetY blur spread color - not source key
    order, and not a Python dict repr (the same class of bug css_list_value fixes above).
    """
    required = ("offsetX", "offsetY", "blur", "spread", "color")
    if not all(key in value for key in required):
        return None
    return f"{value['offsetX']} {value['offsetY']} {value['blur']} {value['spread']} {value['color']}"


def css_value(value, base: dict):
    """A stylesheet references another token, it does not copy its value."""
    if isinstance(value, list):
        if value and all(isinstance(item, dict) for item in value):
            # multi-layer shadow: a list of shadow objects, comma-joined per the
            # CSS box-shadow multi-value syntax (shadow.md/lg/xl's documented shape).
            layers = [css_shadow_value(item) for item in value]
            if any(layer is None for layer in layers):
                return None, f"shadow list $value has a layer missing a shadow field {{color, offsetX, offsetY, blur, spread}}: {value!r}"
            return ", ".join(layers), None
        rendered = css_list_value(value)
        if rendered is None:
            return None, f"list $value has mixed or unsupported element types: {value!r}"
        return rendered, None
    if isinstance(value, dict):
        rendered = css_shadow_value(value)
        if rendered is None:
            return None, f"object $value is missing a shadow field {{color, offsetX, offsetY, blur, spread}}: {value!r}"
        return rendered, None
    match = ALIAS_RE.match(value) if isinstance(value, str) else None
    if match is None:
        return value, None
    node = base
    for segment in match.group(1).split("."):
        if not isinstance(node, dict) or segment not in node:
            return None, f"{match.group(1)} (no such path)"
        node = node[segment]
    return f"var({var_name(tuple(match.group(1).split('.')))})", None


def emit_css(tokens: dict, sources: list) -> tuple:
    base = {k: v for k, v in tokens.items() if k != "themes"}
    lines = [banner(sources, "css"), ":root {\n"]
    for path, value in flatten(base):
        rendered, err = css_value(value, base)
        if err:
            return None, err
        lines.append(f"  {var_name(path)}: {rendered};\n")
    lines.append("}\n")
    for name, overlay in (tokens.get("themes") or {}).items():
        # `dark` is a class because a consuming app toggles it on the root element; every
        # other theme is an attribute. Same var names in every block - no consumer, the
        # linter included, needs to know which theme is active to validate a var().
        selector = ".dark" if name == "dark" else f'[data-theme="{name}"]'
        lines.append(f"\n{selector} {{\n")
        for path, value in flatten(overlay):
            rendered, err = css_value(value, base)
            if err:
                return None, err
            lines.append(f"  {var_name(path)}: {rendered};\n")
        lines.append("}\n")
    return "".join(lines), None


def flat_map(tree: dict, base: dict) -> tuple:
    out = {}
    for path, value in flatten(tree):
        literal, err = resolve_literal(value, base)
        if err:
            return None, err
        out["-".join(path)] = literal
    return out, None


def emit_flat(tokens: dict, sources: list, role: str) -> tuple:
    """A non-stylesheet consumer has no cascade: aliases resolve to their literal value."""
    base = {k: v for k, v in tokens.items() if k != "themes"}
    payload, err = flat_map(base, base)
    if err:
        return None, err
    themes = {}
    for name, overlay in (tokens.get("themes") or {}).items():
        themes[name], err = flat_map(overlay, base)
        if err:
            return None, err
    if themes:
        payload = dict(payload)
        payload["themes"] = themes
    body = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    if role == "build configuration":
        return banner(sources, "js") + "module.exports = " + body[:-1] + ";\n", None
    return body, None


# --- deviation ledger view --------------------------------------------------------------

# The order the entry fields are rendered in. Source-order within active[]/historical[] is
# preserved; the field order below is fixed so a second generation is byte-identical.
LEDGER_FIELDS_ACTIVE = ("status", "prop", "expected", "date", "expires", "reason")
LEDGER_FIELDS_HISTORICAL = ("status", "prop", "expected", "date", "decidedAt", "reason")
LEDGER_LABEL = {
    "status": "statut", "prop": "propriété", "expected": "attendu", "date": "date",
    "expires": "expire", "decidedAt": "décidé", "reason": "raison",
}


def ledger_entry(entry: dict, fields: tuple) -> list:
    """One `### id · target` block. An absent optional field emits no line."""
    lines = [f"### {entry.get('id', '?')} · {entry.get('target', '?')}\n"]
    for field in fields:
        value = entry.get(field)
        if value in (None, ""):
            # `expires` is optional; a required field absent from the source is rendered as a
            # gap so the view shows what the source is missing rather than hiding it.
            if field in ("expires",):
                continue
            value = "—"
        lines.append(f"- {LEDGER_LABEL[field]} : {value}\n")
    return lines


def emit_ledger(deviations: dict, sources: list) -> tuple:
    """The Markdown view of deviations.json. Deterministic: same source, same bytes."""
    if not isinstance(deviations, dict):
        return None, "the deviation source is not an object"
    out = [banner(sources, "md"), "# Registre des écarts\n"]
    for section, key, fields, empty in (
        ("## Actifs", "active", LEDGER_FIELDS_ACTIVE, "_Aucun écart actif._"),
        ("## Historiques", "historical", LEDGER_FIELDS_HISTORICAL, "_Aucune décision historique._"),
    ):
        out.append(f"\n{section}\n")
        entries = deviations.get(key) or []
        if not isinstance(entries, list):
            return None, f"{key} is not an array"
        if not entries:
            out.append(f"\n{empty}\n")
            continue
        for index, entry in enumerate(entries):
            if not isinstance(entry, dict):
                return None, f"{key}[{index}] is not an object"
            out.append("\n")
            out.extend(ledger_entry(entry, fields))
    return "".join(out), None


def emit(role: str, data: dict, sources: list) -> tuple:
    if role in CSS_ROLES:
        return emit_css(data, sources)
    if role in FLAT_ROLES:
        return emit_flat(data, sources, role)
    if role in LEDGER_ROLES:
        return emit_ledger(data, sources)
    return None, f"no emitter for consumer role \"{role}\""


# --- planning ---------------------------------------------------------------------------

def plan(policies: dict, contract_dir: Path) -> tuple:
    """The emission plan, read from the contract. Returns (entries, skipped, exit code).

    An entry without a consumer is skipped in silence at the plan level and reported once
    at the end: it is a declared artifact nobody reads, not an error.
    """
    adapters = policies.get("adapters")
    if adapters is None:
        return [], [], None
    if not isinstance(adapters, list):
        return None, None, fail_shape(contract_dir / POLICIES, "$.adapters", "an array", adapters)
    entries, skipped = [], []
    for index, entry in enumerate(adapters):
        if not isinstance(entry, dict):
            return None, None, fail_shape(contract_dir / POLICIES, f"$.adapters[{index}]",
                                          "an object", entry)
        artifact = entry.get("artifact")
        if not isinstance(artifact, str) or not artifact:
            return None, None, fail_shape(contract_dir / POLICIES,
                                          f"$.adapters[{index}].artifact",
                                          "a non-empty string", artifact)
        consumer = entry.get("consumer")
        if consumer is None or consumer == "unknown":
            skipped.append(artifact)
            continue
        if not isinstance(consumer, str):
            return None, None, fail_shape(contract_dir / POLICIES,
                                          f"$.adapters[{index}].consumer",
                                          "a string", consumer)
        entries.append((artifact, consumer))
    return entries, skipped, None


def produce(contract_dir: Path) -> tuple:
    """Render every declared artifact in memory. Returns ({artifact: (text, sources)}, code)."""
    release, code = read_json(contract_dir / RELEASE)
    if code is not None:
        return None, code
    tokens, code = read_json(contract_dir / TOKENS)
    if code is not None:
        return None, code
    policies, code = read_json(contract_dir / POLICIES)
    if code is not None:
        return None, code
    if not isinstance(tokens, dict):
        return None, fail_shape(contract_dir / TOKENS, "$", "an object", tokens)
    if not isinstance(policies, dict):
        return None, fail_shape(contract_dir / POLICIES, "$", "an object", policies)

    entries, skipped, code = plan(policies, contract_dir)
    if code is not None:
        return None, code

    # The source list is per artifact, not global: the drift record names the source that
    # went stale, and an emitter reads what its role needs without widening anyone else's
    # record. tokens.json is already parsed; other sources are read once and cached.
    source_data = {TOKENS: tokens}
    rendered = {}
    for artifact, consumer in entries:
        source_name = source_for(consumer)
        if source_name not in source_data:
            data, code = read_json(contract_dir / source_name)
            if code is not None:
                return None, code
            source_data[source_name] = data
        sources = [source_name]
        text, err = emit(consumer, source_data[source_name], sources)
        if err is not None:
            return None, fail(f"{artifact}: {err}\n"
                              f"  Declared consumer: \"{consumer}\" in {POLICIES} adapters[].")
        rendered[artifact] = (text, sources)
    for artifact in skipped:
        print(f"skipped {artifact}: no declared consumer", file=sys.stderr)
    return rendered, None


# --- modes ------------------------------------------------------------------------------

def write_all(rendered: dict, contract_dir: Path, out_dir: Path) -> int:
    for artifact, (text, sources) in rendered.items():
        target = out_dir / artifact
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8", newline="\n")
        print(f"wrote {target}")

    # The drift record describes the state of the sources, not the location of the output:
    # it is refreshed in the contract even when the artifacts are emitted elsewhere.
    release_path = contract_dir / RELEASE
    raw = release_path.read_bytes().decode("utf-8")
    release = json.loads(raw)
    release["generated"] = {
        artifact: {"sources": {name: sha256(contract_dir / name) for name in sources}}
        for artifact, (_, sources) in rendered.items()
    }
    # release.json is hand-authored, not generated: refreshing one field must not rewrite
    # every line ending of a file the author owns.
    eol = "\r\n" if "\r\n" in raw else "\n"
    release_path.write_text(json.dumps(release, indent=2, ensure_ascii=False) + "\n",
                            encoding="utf-8", newline=eol)
    print(f"recorded {len(rendered)} artifact(s) in {RELEASE} generated")
    return 0


def check_all(rendered: dict, contract_dir: Path, out_dir: Path) -> int:
    release, code = read_json(contract_dir / RELEASE)
    if code is not None:
        return code
    recorded = release.get("generated") or {}
    drifts = []

    for artifact, (text, sources) in rendered.items():
        target = out_dir / artifact
        if not target.is_file():
            if artifact in recorded:
                drifts.append(f"{artifact}: generated, then deleted - {target.resolve()}")
            continue
        if target.read_text(encoding="utf-8") != text:
            drifts.append(f"{artifact}: hand-edited - differs from a fresh generation - "
                          f"{target.resolve()}")
        for name in sources:
            frozen = (recorded.get(artifact) or {}).get("sources", {}).get(name)
            if frozen is None:
                continue
            current = sha256(contract_dir / name)
            if current != frozen:
                drifts.append(f"{artifact}: stale - {name} changed since generation\n"
                              f"    recorded {frozen}\n"
                              f"    current  {current}")

    if not drifts:
        return 0
    print("Drift detected:", file=sys.stderr)
    for drift in drifts:
        print(f"  {drift}", file=sys.stderr)
    print("  Change the source, then regenerate. No flag suppresses a drift failure.",
          file=sys.stderr)
    return 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Deterministic generation of the derived artifacts of a contract.")
    parser.add_argument("--contract", required=True, metavar="DIR", help="contract directory")
    parser.add_argument("--out", metavar="DIR", help="output directory (default: the contract)")
    parser.add_argument("--check", action="store_true",
                        help="report drift instead of writing; exit 1 on any drift")
    args = parser.parse_args(argv)

    contract_dir = Path(args.contract)
    if not contract_dir.is_dir():
        return fail(f"Contract directory not found: {contract_dir}")
    if not (contract_dir / RELEASE).is_file():
        print(f"1.x contract: no {RELEASE} in {contract_dir.resolve()}\n"
              f"  Migrate it first: python tools/migrate-contract.py --contract {contract_dir}",
              file=sys.stderr)
        return 3
    out_dir = Path(args.out) if args.out else contract_dir

    rendered, code = produce(contract_dir)
    if code is not None:
        return code
    if not rendered:
        print(f"Nothing to emit: no {POLICIES} adapters[] entry declares a consumer.",
              file=sys.stderr)
        return 0
    return check_all(rendered, contract_dir, out_dir) if args.check \
        else write_all(rendered, contract_dir, out_dir)


if __name__ == "__main__":
    sys.exit(main())
