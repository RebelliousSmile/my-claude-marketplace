# Rendered-check environment setup

`lint`'s rendered pass and `wireframes-browser-selftest.sh` both require Playwright 1.60.0 and a launchable Chromium executable. Missing either exits `2`, never green.

## Install

In the project's normal, persistent Python environment (not a `--target /tmp` install):

```
pip install -r plugins/design/adapters/measure/requirements.txt
# to run the design test suites (pnpm test:design) as well:
pip install -r plugins/design/adapters/measure/requirements-dev.txt
python -m playwright install chromium
```

## Point the tooling at Chromium

Export `WIREFRAMES_CHROMIUM` to the installed Chromium executable path before running `render-check.py`, `wireframes-lint.py` with its rendered pass, or `wireframes-browser-selftest.sh`. All three read this same environment variable; none discover Chromium on their own.

## Symptom

`wireframes-browser-selftest.sh` refuses upfront with `Error: WIREFRAMES_CHROMIUM must name an executable Chromium` when the variable is unset or points at a missing/non-executable path. `render-check.py` instead lets Playwright try and reports `Error: Chromium cannot start: <reason>`. Either message means the same thing — install and export it, it is not a sign of a misconfigured board.
