"""pixeldiff.py: identical PNGs diverge by 0 %, a known patch by its exact share."""
from __future__ import annotations

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from pixeldiff import diff  # noqa: E402

FIXTURES = Path(__file__).resolve().parent / "fixtures" / "pixeldiff"


def test_identical_pngs_do_not_diverge(tmp_path):
    pct = diff(FIXTURES / "white.png", FIXTURES / "white-copy.png", tmp_path / "same")
    assert pct == 0.0
    assert (tmp_path / "same-diff.png").is_file()
    assert (tmp_path / "same-sbs.png").is_file()


def test_a_black_quarter_diverges_by_25_percent(tmp_path):
    # 4x4 white image, its top-left 2x2 block black: 4 of 16 pixels.
    pct = diff(FIXTURES / "white.png", FIXTURES / "white-quarter-black.png", tmp_path / "quarter")
    assert pct == pytest.approx(25.0)


def test_the_tolerance_absorbs_a_difference_below_it(tmp_path):
    assert diff(FIXTURES / "white.png", FIXTURES / "white-quarter-black.png", tmp_path / "t",
                threshold=255) == 0.0
