"""Agent-written manifest values stay data: no markup breakout, no network, a readable board."""
from __future__ import annotations

import importlib.util
import json
import os
import re
import subprocess
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
DESIGN = ROOT.parents[1]
FIX = ROOT / "fixtures"
HOSTILE = "</script><script>document.title='pwned'</script>"
BLOCK = re.compile(r'<script id="wireframe-manifest" type="application/json">(.*?)</script>', re.S)


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module


wireframes = _load("design_wireframes", ROOT / "wireframes.py")
render_check = _load("design_render_check", ROOT / "render-check.py")
contrast = _load("design_contrast_for_wireframes", DESIGN / "adapters" / "a11y" / "contrast.py")


def _manifest(**extra) -> dict:
    manifest = json.loads((FIX / "manifest-valid.json").read_text(encoding="utf-8"))
    manifest.update(extra)
    return manifest


def test_a_hostile_title_stays_inside_the_manifest_block():
    manifest = _manifest(title=HOSTILE)
    board = wireframes.render(manifest)

    blocks = BLOCK.findall(board)
    assert len(blocks) == 1
    assert "<" not in blocks[0]
    assert json.loads(blocks[0]) == manifest


@pytest.mark.parametrize("lang, expected", [(None, "fr"), ("en", "en"), ("en-GB", "en-GB")])
def test_lang_reaches_the_html_element(lang, expected):
    manifest = _manifest() if lang is None else _manifest(lang=lang)
    wireframes.validate_manifest(manifest)
    assert f'<html lang="{expected}">' in wireframes.render(manifest)


@pytest.mark.parametrize("lang", ['fr" onload="x', "", "f", 3])
def test_a_malformed_lang_is_refused(lang):
    with pytest.raises(wireframes.InputError):
        wireframes.validate_manifest(_manifest(lang=lang))


def test_frame_lines_reach_3_to_1_on_paper():
    css = wireframes.render(_manifest())
    line = re.search(r"--line:(#[0-9a-fA-F]{6})", css).group(1)
    paper = re.search(r"--paper:(#[0-9a-fA-F]{3,6})", css).group(1)
    fg = contrast.over(contrast.to_rgba(line), contrast.to_rgba(paper)[:3])
    bg = contrast.over(contrast.to_rgba(paper), (255, 255, 255))
    assert contrast.ratio(fg, bg) >= 3.0
    assert "background:var(--paper)}}" not in css  # the f-string braces are gone
    assert re.search(r"\.wireframe-frame\{[^}]*background:var\(--paper\)", css)


def test_requests_are_limited_to_the_board_directory(tmp_path):
    root = tmp_path.resolve()
    (tmp_path / "board.html").write_text("", encoding="utf-8")
    assert render_check.request_allowed((tmp_path / "board.html").as_uri(), root)
    assert render_check.request_allowed((tmp_path / "img" / "a.png").as_uri(), root)
    assert render_check.request_allowed("data:image/png;base64,AAAA", root)
    assert not render_check.request_allowed((tmp_path.parent / "secret.txt").as_uri(), root)
    assert not render_check.request_allowed("https://example.test/x.png", root)
    assert not render_check.request_allowed("file://remote-host/share/x.png", root)


def test_render_check_launches_chromium_without_weakening_flags():
    source = (ROOT / "render-check.py").read_text(encoding="utf-8")
    assert "--allow-file-access-from-files" not in source
    assert "--no-sandbox" not in source


def _hostile_board(tmp_path: Path) -> Path:
    """render-valid.html, its manifest title made hostile and a runtime beacon added."""
    board = (FIX / "render-valid.html").read_text(encoding="utf-8")
    manifest = json.loads(BLOCK.search(board).group(1))
    manifest["title"] = HOSTILE
    escaped = (json.dumps(manifest, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
               .replace("&", "\\u0026").replace("<", "\\u003c").replace(">", "\\u003e"))
    board = BLOCK.sub(lambda _: f'<script id="wireframe-manifest" type="application/json">{escaped}</script>', board)
    # A static <img src="https://..."> is refused by the lint; a runtime request must be blocked by the route.
    marker = "/* ===== END AUTHOR INTERACTIONS ===== */"
    assert board.count(marker) == 1
    board = board.replace(marker, 'new Image().src = "https://example.test/beacon.png"; ' + marker)
    path = tmp_path / "board.html"
    path.write_text(board, encoding="utf-8")
    return path


@pytest.mark.skipif(not os.environ.get("WIREFRAMES_CHROMIUM"), reason="WIREFRAMES_CHROMIUM is required")
def test_render_check_parses_a_hostile_manifest_and_blocks_the_network(tmp_path):
    board, report = _hostile_board(tmp_path), tmp_path / "report.json"
    run = subprocess.run([sys.executable, str(ROOT / "render-check.py"), str(board), "--report", str(report),
                          "--chromium", os.environ["WIREFRAMES_CHROMIUM"]],
                         capture_output=True, text=True, env={**os.environ, "PYTHONUTF8": "1"})

    assert run.returncode == 0, run.stdout + run.stderr
    rendered = json.loads(report.read_text(encoding="utf-8"))["rendered"]
    assert rendered["blockedRequests"] == ["https://example.test/beacon.png"]
