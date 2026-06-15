#!/usr/bin/env python3
"""Pixel diff between two screenshots (Pillow + numpy) — a visual companion to the
computed-style oracle. The numbers that drive remediation come from measure.py; this is
for the eye and for a coarse "how far off" percentage.

Resizes B to A's width (keeps ratio), crops both to the common height, compares per-pixel
with a tolerance, writes a diff image (divergent pixels highlighted) and a side-by-side
montage [A | B | diff]. Prints the divergent-pixel percentage.

Usage:
  python pixeldiff.py --a out/shots/page__maq__desktop.png --b out/shots/page__wp__desktop.png --out out/diff/desktop
"""
from __future__ import annotations

import argparse
from pathlib import Path

import numpy as np
from PIL import Image

GAP = 4
HILITE = (255, 0, 128)  # magenta for divergent pixels


def _load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def diff(a_path: Path, b_path: Path, out_base: Path, threshold: int = 12) -> float:
    a = _load_rgb(a_path)
    b = _load_rgb(b_path)

    # Resize B to A's width, keep ratio.
    if b.width != a.width:
        b = b.resize((a.width, max(1, round(b.height * a.width / b.width))))

    h = min(a.height, b.height)
    a = a.crop((0, 0, a.width, h))
    b = b.crop((0, 0, a.width, h))

    aa = np.asarray(a, dtype=np.int16)
    bb = np.asarray(b, dtype=np.int16)

    # Per-pixel max channel distance; divergent if above tolerance.
    dist = np.abs(aa - bb).max(axis=2)
    mask = dist > threshold
    pct = float(mask.mean() * 100.0)

    # Diff image: B dimmed, divergent pixels in HILITE.
    diff_img = (bb // 3).astype(np.uint8)
    diff_img[mask] = HILITE
    diff_pil = Image.fromarray(diff_img, "RGB")

    out_base.parent.mkdir(parents=True, exist_ok=True)
    diff_pil.save(out_base.with_name(out_base.name + "-diff.png"))

    # Side-by-side montage [A | B | diff].
    montage = Image.new("RGB", (a.width * 3 + GAP * 2, h), (30, 30, 30))
    montage.paste(a, (0, 0))
    montage.paste(b, (a.width + GAP, 0))
    montage.paste(diff_pil, (a.width * 2 + GAP * 2, 0))
    montage.save(out_base.with_name(out_base.name + "-sbs.png"))

    return pct


def main():
    ap = argparse.ArgumentParser(description="Pixel diff + side-by-side montage (Pillow/numpy).")
    ap.add_argument("--a", required=True, help="Reference image (mockup).")
    ap.add_argument("--b", required=True, help="Compared image (target).")
    ap.add_argument("--out", required=True, help="Output base path (suffixes -diff.png / -sbs.png added).")
    ap.add_argument("--threshold", type=int, default=12, help="Per-channel tolerance (0-255).")
    args = ap.parse_args()

    pct = diff(Path(args.a), Path(args.b), Path(args.out), args.threshold)
    print(f"divergent pixels: {pct:.2f}%  ->  {Path(args.out).parent}")


if __name__ == "__main__":
    main()
