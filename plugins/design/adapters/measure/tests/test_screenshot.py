"""screenshot.py: one local fixture page captured on both sides at one breakpoint."""
from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
PAGE = Path(__file__).resolve().parent / "fixtures" / "screenshot" / "page.html"


@pytest.mark.browser
def test_both_sides_are_captured_full_page(tmp_path):
    from PIL import Image

    spec = importlib.util.spec_from_file_location("design_screenshot", ROOT / "screenshot.py")
    screenshot = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(screenshot)

    # One side absolute, one side relative to the config directory, as measure.py accepts.
    cfg = {"reference_page": "fixture", "reference_url": PAGE.as_uri(),
           "implementation_url": PAGE.name,
           "breakpoints": [{"name": "desktop", "width": 320, "height": 240}]}
    shots = screenshot.capture(cfg, tmp_path / "shots", PAGE.parent)

    assert [p.name for p in shots] == ["fixture__mockup__desktop.png",
                                      "fixture__implementation__desktop.png"]
    for shot in shots:
        with Image.open(shot) as img:
            # full_page: the 900px block is captured beyond the 240px viewport.
            assert img.size == (320, 900)
            assert img.convert("RGB").getpixel((10, 10)) == (0x25, 0x63, 0xEB)
