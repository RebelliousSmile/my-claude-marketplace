"""Regression tests for the FSE cascade-ownership extension."""
from __future__ import annotations

import importlib.util
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
FSE_FIXTURE = ROOT.parents[2] / "sc-php" / "skills" / "design-bridge" / "evals" / "fixtures" / "fse-cascade"


def _load(name: str, filename: str):
    spec = importlib.util.spec_from_file_location(name, ROOT / filename)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader
    spec.loader.exec_module(module)
    return module


measure = _load("design_measure", "measure.py")
config_gen = _load("design_config_gen", "config-gen.py")


def test_same_computed_value_has_opposite_verdict_by_winner_provenance():
    target = {"name": "Button", "selector": ".btn-pinceau > .wp-block-button__link",
              "class": "btn-pinceau", "prop": "background-color",
              "sources": ["button.css", "fse-bindings.css"]}
    ds = {"computed": "rgb(0, 0, 0)", "winner": {
        "source": "http://example.test/theme/assets/css/design/fse-bindings.css",
        "selector": ".btn-pinceau > .wp-block-button__link"}}
    core = {"computed": "rgb(0, 0, 0)", "winner": {
        "source": "http://example.test/wp-includes/css/dist/block-library/style.css",
        "selector": ".wp-block-button__link"}}

    assert measure._classify_ownership(ds, target)["status"] == "pass"
    assert measure._classify_ownership(core, target)["status"] == "fail"


def test_ownership_failures_and_unrealized_reopen_existing_verdict():
    report = {"breakpoints": {"desktop": []}, "coverage": {"ok": True},
              "ownership": {"front": {"desktop": [{"status": "fail"}]},
                            "editor": {"desktop": [{"status": "unrealized"}]}}}
    summary = measure._verdict(report)
    assert summary["verdict"] == "OPEN"
    assert summary["ownership_failures"] == 1
    assert summary["ownership_unrealized"] == 1


def test_existing_report_without_ownership_remains_closed():
    summary = measure._verdict({"breakpoints": {"desktop": []}, "coverage": {"ok": True}})
    assert summary["verdict"] == "CLOSED"
    assert summary["ownership_failures"] == 0
    assert summary["ownership_unrealized"] == 0


def test_config_derives_properties_from_actual_ds_declarations(tmp_path):
    sheet = tmp_path / "fse-bindings.css"
    sheet.write_text("@media (min-width: 40rem) { .btn-pinceau > .wp-block-button__link { "
                     "background-color: var(--color-action); padding-inline: 1rem; } }",
                     encoding="utf-8")
    components = {"components": {"Button": {
        "base": "btn-pinceau", "elements": {"link": "btn-pinceau__lien"}}}}
    targets = config_gen._derive_ownership_targets(components, {}, [str(sheet)])

    declared = {(row["class"], row["prop"]) for row in targets if row.get("prop")}
    assert ("btn-pinceau", "background-color") in declared
    assert ("btn-pinceau", "padding-inline") in declared
    absent = next(row for row in targets if row["class"] == "btn-pinceau__lien")
    assert absent["unrealized_reason"] == "DS class has no inspectable declaration"


@pytest.mark.browser
def test_browser_probe_handles_layers_important_inline_and_nested_selectors():
    markup = """
    <style>
      @layer design {
        .layer-normal { color: rgb(1, 2, 3); }
        .ds-important { color: rgb(1, 2, 3) !important; }
      }
      .core-normal { color: rgb(1, 2, 3); }
      .core-important { color: rgb(1, 2, 3) !important; }
      .site-nav__lien > a { color: rgb(1, 2, 3); }
      nav a { color: rgb(1, 2, 3); }
    </style>
    <div id="normal" class="layer-normal core-normal"></div>
    <div id="important" class="ds-important core-important"></div>
    <div id="inline" class="layer-normal" style="color: rgb(1, 2, 3)"></div>
    <nav><div class="site-nav__lien"><a id="nested">Link</a></div></nav>
    """
    from playwright.sync_api import sync_playwright

    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=["--allow-file-access-from-files"])
        try:
            page = browser.new_page()
            page.set_content(markup)
            probe = lambda selector: page.evaluate(
                measure._OWNERSHIP, {"selector": selector, "prop": "color"})["winner"]["selector"]
            assert probe("#normal") == ".core-normal"
            assert probe("#important") == ".ds-important"
            assert probe("#inline") == "<inline>"
            assert probe("#nested") == ".site-nav__lien > a"
        finally:
            browser.close()


@pytest.mark.browser
def test_fse_front_fixtures_flip_ownership_even_with_equal_values():
    button = {"name": "Button", "selector": ".btn-pinceau > .wp-block-button__link",
              "class": "btn-pinceau", "prop": "background-color", "sources": ["design.css"]}
    nav = {"name": "Navigation", "selector": ".site-nav__lien > .wp-block-navigation-item__content",
           "class": "site-nav__lien", "prop": "color", "sources": ["design.css"]}
    from playwright.sync_api import sync_playwright

    with sync_playwright() as pw:
        browser = pw.chromium.launch(args=["--allow-file-access-from-files"])
        try:
            page = browser.new_page()
            page.goto(FSE_FIXTURE.joinpath("front-pass.html").as_uri(), wait_until="networkidle")
            assert measure._classify_ownership(page.evaluate(measure._OWNERSHIP, button), button)["status"] == "pass"
            assert measure._classify_ownership(page.evaluate(measure._OWNERSHIP, nav), nav)["status"] == "pass"

            page.goto(FSE_FIXTURE.joinpath("front-fail.html").as_uri(), wait_until="networkidle")
            assert measure._classify_ownership(page.evaluate(measure._OWNERSHIP, button), button)["status"] == "fail"
            assert measure._classify_ownership(page.evaluate(measure._OWNERSHIP, nav), nav)["status"] == "fail"
        finally:
            browser.close()
