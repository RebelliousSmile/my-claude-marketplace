"""Shared pytest setup: tests marked `browser` need Playwright and a launchable Chromium.

Without either, they are skipped with the reason, never collected as errors: the pure tests of
the same files keep running.
"""
from __future__ import annotations

import pytest


def pytest_configure(config):
    config.addinivalue_line("markers", "browser: needs Playwright and a launchable Chromium")


def _browser_unavailable() -> str | None:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        return "playwright is not importable"
    try:
        with sync_playwright() as pw:
            pw.chromium.launch().close()
    except Exception as exc:  # any launch failure means no browser, whatever its cause
        return f"Chromium cannot start: {exc}"
    return None


def pytest_collection_modifyitems(config, items):
    browser_items = [item for item in items if "browser" in item.keywords]
    if not browser_items:
        return
    reason = _browser_unavailable()
    if reason:
        for item in browser_items:
            item.add_marker(pytest.mark.skip(reason=reason))
