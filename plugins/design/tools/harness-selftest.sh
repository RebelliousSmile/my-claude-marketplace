#!/usr/bin/env sh
# design:harness selftest — proves the exit-code space of the WHOLE program (contract
# path and pages path alike) and the shape of the generated HTML. Every harness.py
# invocation goes through check(), which asserts the expected code AND that the code is
# never 1 — the interdiction, not just the expectation. Exit 0 iff every assertion holds.
#
# POSIX sh only — the shebang is `sh` while the usage line says `bash`, so the script must
# keep running under both: no [[ ]], no arrays, no ${v,,}, no local.
#
# Usage:  cd plugins/design && bash tools/harness-selftest.sh
set -u

DIR=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
HARNESS="$DIR/adapters/harness/harness.py"
FIX="$DIR/adapters/harness/fixtures"
OUT=$(mktemp -d)
trap 'rm -rf "$OUT"' EXIT
fail=0

# The interpreter is resolved, never assumed: Ubuntu 22+ ships `python3` only, and a
# missing `python` returns 127 on every check — an interpreter defect wearing the mask of
# a failed assertion. A proof that only holds where it was written is not a proof.
PY=${HARNESS_SELFTEST_PYTHON:-}
if [ -z "$PY" ]; then PY=$(command -v python3 || command -v python || true); fi
# The override is checked too: an unusable HARNESS_SELFTEST_PYTHON would return 127 on
# every check and reproduce the very defect this guard removes.
if [ -z "$PY" ] || ! command -v "$PY" >/dev/null 2>&1; then
  echo "SELFTEST FAILED: no usable python (tried '${PY:-python3, python}')."
  echo "  Install python3, or point HARNESS_SELFTEST_PYTHON at an interpreter."
  exit 1
fi

# Same treatment for node, which runs the runtime check below. No escape hatch: the only
# caller of this selftest is tools/eval/design-harness.mjs, itself running under node — a
# SKIP would cover no real case and would reopen the green-without-checking door that the
# runtime check exists to close.
NODE=${HARNESS_SELFTEST_NODE:-}
if [ -z "$NODE" ]; then NODE=$(command -v node || true); fi
if [ -z "$NODE" ] || ! command -v "$NODE" >/dev/null 2>&1; then
  echo "SELFTEST FAILED: no usable node (tried '${NODE:-node}')."
  echo "  Install node, or point HARNESS_SELFTEST_NODE at an interpreter."
  exit 1
fi
RUNTIME="$DIR/tools/harness-runtime-check.mjs"
ANALYZER="$DIR/tools/harness-analyze.mjs"
APPLIER="$DIR/tools/harness-apply.py"

check() {  # name expected_code <harness args…>
  name=$1; want=$2; shift 2
  "$PY" "$HARNESS" --out "$OUT/o.html" "$@" >"$OUT/out" 2>"$OUT/err"
  got=$?
  # The interdiction, checked on every branch: 1 is not in the harness code space
  # (0/2/3). Asserting only the expected code is what let a dead file ship green.
  if [ "$got" -eq 1 ]; then
    echo "FAIL $name: exit 1 — harness.py never emits 1 (space is 0/2/3)"; cat "$OUT/err"; fail=1
  elif [ "$got" -ne "$want" ]; then
    echo "FAIL $name: exit $got, expected $want"; cat "$OUT/err"; fail=1
  else
    echo "ok   $name: exit $got"
  fi
}

# ─── Contract path ───────────────────────────────────────────────────────────
check "scaffold"            0
check "2x"                  0 --contract "$FIX/2x"
check "2x-no-stylesheet"    0 --contract "$FIX/2x-no-stylesheet"
check "2x-missing-artifact" 2 --contract "$FIX/2x-missing-artifact"
check "2x-bad-release"      2 --contract "$FIX/2x-bad-release"
# The stylesheet is inlined verbatim: a declared artifact reaching outside the contract
# directory, or one carrying a </style>, is a refusal — not something to sanitise.
check "2x-artifact-escape"  2 --contract "$FIX/2x-artifact-escape"
check "2x-style-breakout"   2 --contract "$FIX/2x-style-breakout"
check "1x"                  3 --contract "$FIX/1x"

# ─── Pages path — every malformed input is a 2, never a traceback ────────────
printf '%s' '{{{ not json' >"$OUT/bad.json"
printf '%s' '["home","contact"]' >"$OUT/strings.json"
printf '%s' '{"pages":[{"key":"home","label":"Accueil","theme":42}]}' >"$OUT/bad-meta.json"
check "pages-json-absent"     2 --pages-json "$OUT/does-not-exist.json"
check "pages-json-not-json"   2 --pages-json "$OUT/bad.json"
check "pages-json-strings"    2 --pages-json "$OUT/strings.json"
check "pages-json-bad-meta"   2 --pages-json "$OUT/bad-meta.json"
check "pages-duplicate-key"   2 --pages "home:A,home:B"
check "pages-fn-collision"    2 --pages "my-page:A,my_page:B"
check "pages-url-path"        2 --pages "/contact/:C"

# ─── Generated HTML ──────────────────────────────────────────────────────────
"$PY" "$HARNESS" --out "$OUT/c.html" --contract "$FIX/2x" >/dev/null 2>&1
"$PY" "$HARNESS" --out "$OUT/s.html" >/dev/null 2>&1
"$PY" "$HARNESS" --out "$OUT/m.html" --pages "home:Accueil,contact:Contact" >/dev/null 2>&1
"$PY" "$HARNESS" --out "$OUT/x.html" --pages "p1:Fiche <b>x</b>" >/dev/null 2>&1
printf '%s' '{"pages":[{"key":"home","label":"Accueil","route":"/","source":"pages/index.vue"},{"key":"companies","label":"Entreprises","route":"/entreprises","source":"pages/entreprises/index.vue","theme":"entreprise"}]}' >"$OUT/meta.json"
"$PY" "$HARNESS" --out "$OUT/meta.html" --contract "$FIX/2x" --pages-json "$OUT/meta.json" >/dev/null 2>&1

if grep -q "GENERATED from tokens.json" "$OUT/c.html"; then
  echo "ok   2x: stylesheet inlined"
else
  echo "FAIL 2x: stylesheet banner not inlined"; fail=1
fi

if grep -q "route: /entreprises" "$OUT/meta.html" &&
   grep -q "source: pages/entreprises/index.vue" "$OUT/meta.html" &&
   grep -q "theme: entreprise" "$OUT/meta.html"; then
  echo "ok   page grounding copied into the LLM framing"
else
  echo "FAIL page route/source/theme missing from LLM framing"; fail=1
fi
if grep -q "\[fixture-icons\] Use the declared icon set" "$OUT/meta.html"; then
  echo "ok   frozen usage rule copied into the LLM framing"
else
  echo "FAIL frozen usage rule missing from LLM framing"; fail=1
fi
if grep -q "AUTHOR PAGE STYLES" "$OUT/meta.html" &&
   grep -q "AUTHOR SHARED HELPERS" "$OUT/meta.html" &&
   grep -q "AUTHOR AFTER RENDER" "$OUT/meta.html" &&
   grep -q "Modifie uniquement les zones auteur" "$OUT/meta.html"; then
  echo "ok   LLM edit scope names all governed author regions"
else
  echo "FAIL LLM edit scope is missing or contradictory"; fail=1
fi

# The no-stylesheet contract must emit exactly one stderr warning.
"$PY" "$HARNESS" --out "$OUT/o.html" --contract "$FIX/2x-no-stylesheet" 2>"$OUT/err" >/dev/null
n=$(grep -c "Warning" "$OUT/err")
if [ "$n" -eq 1 ]; then echo "ok   2x-no-stylesheet: one warning"; else echo "FAIL warning count $n"; fail=1; fi

# No @media anywhere — the device model is class-based samples only.
if grep -q "@media" "$OUT/s.html" "$OUT/c.html"; then
  echo "FAIL @media present in generated output"; fail=1
else
  echo "ok   no @media in scaffold or coupled output"
fi

# The device bezel is painted OUTSIDE the box. As a border it would sit inside
# (box-sizing: border-box) and shrink the content box below the declared sample width —
# measured at 375x812, the oracle's real mobile viewport: content 359 instead of 375,
# and every percentage-derived value charged to a conformant implementation.
if grep -q "outline: 8px" "$OUT/s.html" && grep -q "outline: 10px" "$OUT/s.html"; then
  echo "ok   the device bezel is an outline"
else
  echo "FAIL the device bezel is not an outline"; fail=1
fi
# border-radius stays legitimate; a shorthand `border:` on either device rule does not.
if grep -E "^  \.preview-frame\.(tablet|mobile) \{" "$OUT/s.html" | grep -q "border:"; then
  echo "FAIL a border: came back on a device frame — it shrinks the content box"; fail=1
else
  echo "ok   no border: on the device frames"
fi

# The scaffold honours the heading rule it states. Asserting "an <h1 exists somewhere"
# is not enough — the error block carries one, so a placeholder demoted back to <h2>
# would still pass. Every .ph block must OPEN on an h1.
blocks=$(grep -o "<div class=\"ph[a-z -]*\"><h[0-9]" "$OUT/s.html")
nb=$(printf '%s\n' "$blocks" | grep -c "<h")
bad=$(printf '%s\n' "$blocks" | grep -v "<h1$")
if [ "$nb" -lt 3 ]; then
  echo "FAIL $nb .ph block(s) found, expected the 3 scaffold states"; fail=1
elif [ -n "$bad" ]; then
  echo "FAIL a .ph block opens on something other than h1: $bad"; fail=1
else
  echo "ok   every .ph block opens on an h1"
fi

# Two page keys may never derive the same function name — a duplicate would silently
# shadow a page in the registry. Only the GENERATED declarations count: the LLM framing
# above the registry shows `function pageHome()` as an example, in a comment.
decls=$(grep -o "^  function page[A-Za-z0-9_]*" "$OUT/m.html")
n=$(printf '%s\n' "$decls" | grep -c "function page")
dups=$(printf '%s\n' "$decls" | sort | uniq -d)
if [ "$n" -ne 2 ]; then
  echo "FAIL 2 pages requested, $n page function(s) declared"; fail=1
elif [ -n "$dups" ]; then
  echo "FAIL duplicate page function: $dups"; fail=1
else
  echo "ok   page functions declared once each"
fi

# A label carrying markup must never come back out as a tag, in the <option> or the page.
if grep -q "<b>" "$OUT/x.html"; then
  echo "FAIL markup label re-emitted as a tag"; fail=1
else
  echo "ok   markup label escaped everywhere"
fi

# Chrome named for a screen reader.
if grep "id=\"page-select\"" "$OUT/s.html" | grep -q "aria-label"; then
  echo "ok   #page-select is labelled"
else
  echo "FAIL #page-select has no aria-label"; fail=1
fi
# The attribute, not the setAttribute() that maintains it — hence the trailing quote.
n=$(grep -o "aria-pressed=\"" "$OUT/s.html" | wc -l)
if [ "$n" -eq 3 ]; then echo "ok   3 aria-pressed on the device buttons"; else echo "FAIL aria-pressed count $n, expected 3"; fail=1; fi

# A file sold as standalone issues no third-party request.
if grep -q "preconnect" "$OUT/s.html"; then
  echo "FAIL scaffold still preconnects to a third party"; fail=1
else
  echo "ok   no preconnect in scaffold"
fi

# No %%SENTINEL%% survives into the output. A dropped or misspelled key would otherwise
# ship the literal sentinel in the HTML at exit 0 — a dead file at green, one level up.
if grep -q "%%" "$OUT/s.html" "$OUT/c.html"; then
  echo "FAIL an unfilled %%SENTINEL%% reached the output"; grep -o "%%[A-Za-z_]*%%" "$OUT/s.html" "$OUT/c.html"; fail=1
else
  echo "ok   every sentinel filled"
fi

# decodeURIComponent THROWS on a malformed fragment: outside the try, the URIError
# aborts init() before render() and leaves #page-container empty — blank, no error block.
if grep -B1 "const hash = decodeURIComponent" "$OUT/s.html" | grep -q "try {"; then
  echo "ok   the hash is decoded inside init()'s try"
else
  echo "FAIL decodeURIComponent sits outside init()'s try"; fail=1
fi

# The bad-release message must name release.json; missing-artifact must name generate.py;
# 1x must name migrate-contract.py; an invalid page set must name the offending key.
"$PY" "$HARNESS" --out "$OUT/o.html" --contract "$FIX/2x-bad-release" 2>"$OUT/err" >/dev/null || true
grep -q "release.json" "$OUT/err" || { echo "FAIL bad-release: message omits release.json"; fail=1; }
"$PY" "$HARNESS" --out "$OUT/o.html" --contract "$FIX/2x-missing-artifact" 2>"$OUT/err" >/dev/null || true
grep -q "tools/generate.py" "$OUT/err" || { echo "FAIL missing-artifact: message omits generate.py"; fail=1; }
"$PY" "$HARNESS" --out "$OUT/o.html" --contract "$FIX/1x" 2>"$OUT/err" >/dev/null || true
grep -q "migrate-contract.py" "$OUT/err" || { echo "FAIL 1x: message omits migrate-contract.py"; fail=1; }
"$PY" "$HARNESS" --out "$OUT/o.html" --pages "/contact/:C" 2>"$OUT/err" >/dev/null || true
grep -q "/contact/" "$OUT/err" || { echo "FAIL url-path: message omits the offending key"; fail=1; }
# The escape message must print the RESOLVED path — the raw "../…" is what the contract
# claims, the resolved one is what proves the escape.
"$PY" "$HARNESS" --out "$OUT/o.html" --contract "$FIX/2x-artifact-escape" 2>"$OUT/err" >/dev/null || true
grep -q "policies.json" "$OUT/err" || { echo "FAIL artifact-escape: message omits policies.json"; fail=1; }
grep -q "\.\./2x" "$OUT/err" && { echo "FAIL artifact-escape: message prints the raw path, not the resolved one"; fail=1; }
"$PY" "$HARNESS" --out "$OUT/o.html" --contract "$FIX/2x-style-breakout" 2>"$OUT/err" >/dev/null || true
grep -q "adapters.tokens.css" "$OUT/err" || { echo "FAIL style-breakout: message omits the stylesheet"; fail=1; }
# A refusal precedes the write; it does not repair one. Nothing produced may carry the payload.
if grep -rq "__PWNED" "$OUT" 2>/dev/null; then
  echo "FAIL the style-breakout payload reached a produced file"; fail=1
else
  echo "ok   the style-breakout payload reaches no output"
fi

# ─── Existing HTML analysis ─────────────────────────────────────────────────
# Normalization starts from an aggregate read-only report. A readable nonconformant
# document is a successful analysis (0), while unreadable/empty input is invalid (2).
if "$NODE" "$ANALYZER" "$OUT/s.html" >"$OUT/analyze-canonical.json" 2>"$OUT/err" &&
   grep -q '"classification": "canonical-harness"' "$OUT/analyze-canonical.json" &&
   grep -q '"conformant": true' "$OUT/analyze-canonical.json"; then
  echo "ok   analyzer recognizes a runtime-valid canonical harness"
else
  echo "FAIL analyzer does not recognize the canonical harness"; cat "$OUT/err"; fail=1
fi

printf '%s\n' '<!doctype html><html><head><style>.hero{color:red}</style></head><body><main><h1>Hello</h1></main></body></html>' >"$OUT/document.html"
if "$NODE" "$ANALYZER" "$OUT/document.html" >"$OUT/analyze-document.json" 2>"$OUT/err" &&
   grep -q '"classification": "html-document"' "$OUT/analyze-document.json" &&
   grep -q '"readyWithoutDecision": true' "$OUT/analyze-document.json"; then
  echo "ok   analyzer accepts a script-free author document for migration"
else
  echo "FAIL analyzer misclassifies a script-free author document"; cat "$OUT/err"; fail=1
fi

sed '/END AUTHOR PAGE STYLES/d' "$OUT/s.html" >"$OUT/damaged.html"
if "$NODE" "$ANALYZER" "$OUT/damaged.html" >"$OUT/analyze-damaged.json" 2>"$OUT/err" &&
   grep -q '"classification": "repairable-harness"' "$OUT/analyze-damaged.json" &&
   grep -q '"id": "missing-authorStyleEnd"' "$OUT/analyze-damaged.json"; then
  echo "ok   analyzer identifies a repairable harness without mutating it"
else
  echo "FAIL analyzer misses damaged canonical infrastructure"; cat "$OUT/err"; fail=1
fi

printf '%s\n' '<!doctype html><html><head></head><body><main></main><script src="app.js"></script></body></html>' >"$OUT/scripted.html"
if "$NODE" "$ANALYZER" "$OUT/scripted.html" >"$OUT/analyze-scripted.json" 2>"$OUT/err" &&
   grep -q '"readyWithoutDecision": false' "$OUT/analyze-scripted.json" &&
   grep -q 'external application scripts' "$OUT/analyze-scripted.json"; then
  echo "ok   analyzer blocks silent application-script migration"
else
  echo "FAIL analyzer does not expose the application-script blocker"; cat "$OUT/err"; fail=1
fi

# Selector and style evidence is scoped to canonical ownership. Business form options
# and body template styles must not masquerade as harness registry/chrome evidence.
sed 's#<div class="preview-stage">#<select id="business"><option value="sql">SQL</option></select><style>.business{color:red}</style><div class="preview-stage">#' "$OUT/s.html" >"$OUT/business-controls.html"
if "$NODE" "$ANALYZER" "$OUT/business-controls.html" >"$OUT/analyze-business.json" 2>"$OUT/err" &&
   grep -q '"classification": "canonical-harness"' "$OUT/analyze-business.json" &&
   grep -q '"inlineHeadBlocks": 1' "$OUT/analyze-business.json" &&
   ! grep -q 'registry-option-drift' "$OUT/analyze-business.json"; then
  echo "ok   analyzer scopes options to #page-select and styles to head"
else
  echo "FAIL analyzer confuses page content with harness-owned evidence"; cat "$OUT/err"; fail=1
fi

# Accessibility preferences describe the user environment and survive normalization;
# width/orientation queries secretly introduce a fourth viewport and remain forbidden.
sed 's#AUTHOR PAGE STYLES — LLM MAY EDIT BETWEEN THESE MARKERS ===== \*/#AUTHOR PAGE STYLES — LLM MAY EDIT BETWEEN THESE MARKERS ===== */\n  @media (prefers-reduced-motion: reduce) { .hero { transition: none; } }#' "$OUT/s.html" >"$OUT/preference-media.html"
if "$NODE" "$ANALYZER" "$OUT/preference-media.html" >"$OUT/analyze-preference.json" 2>"$OUT/err" &&
   grep -q '"classification": "canonical-harness"' "$OUT/analyze-preference.json" &&
   grep -q 'prefers-reduced-motion' "$OUT/analyze-preference.json"; then
  echo "ok   analyzer preserves accessibility preference media queries"
else
  echo "FAIL analyzer rejects an accessibility preference query"; cat "$OUT/err"; fail=1
fi
sed 's#AUTHOR PAGE STYLES — LLM MAY EDIT BETWEEN THESE MARKERS ===== \*/#AUTHOR PAGE STYLES — LLM MAY EDIT BETWEEN THESE MARKERS ===== */\n  @import url("https://fonts.example.test/family.css");#' "$OUT/s.html" >"$OUT/import-style.html"
if "$NODE" "$ANALYZER" "$OUT/import-style.html" >"$OUT/analyze-import.json" 2>"$OUT/err" &&
   grep -q 'https://fonts.example.test/family.css' "$OUT/analyze-import.json" &&
   grep -q 'unresolved stylesheet dependencies' "$OUT/analyze-import.json"; then
  echo "ok   analyzer exposes external CSS imported from an author style block"
else
  echo "FAIL analyzer misses an @import stylesheet dependency"; cat "$OUT/err"; fail=1
fi
sed 's#AUTHOR PAGE STYLES — LLM MAY EDIT BETWEEN THESE MARKERS ===== \*/#AUTHOR PAGE STYLES — LLM MAY EDIT BETWEEN THESE MARKERS ===== */\n  @media (max-width: 700px) { .hero { display: block; } }#' "$OUT/s.html" >"$OUT/viewport-media.html"
if "$NODE" "$ANALYZER" "$OUT/viewport-media.html" >"$OUT/analyze-viewport.json" 2>"$OUT/err" &&
   grep -q '"classification": "repairable-harness"' "$OUT/analyze-viewport.json" &&
   grep -q 'viewport-media-query' "$OUT/analyze-viewport.json"; then
  echo "ok   analyzer rejects viewport media queries"
else
  echo "FAIL analyzer accepts a hidden viewport breakpoint"; cat "$OUT/err"; fail=1
fi

printf '%s' '{"pages":[{"key":"legacy","label":"Legacy","source":"C:\\\\old-machine\\\\page.html"}]}' >"$OUT/legacy-source.json"
"$PY" "$HARNESS" --out "$OUT/legacy-source.html" --pages-json "$OUT/legacy-source.json" >/dev/null 2>&1
if "$NODE" "$ANALYZER" "$OUT/legacy-source.html" >"$OUT/analyze-source.json" 2>"$OUT/err" &&
   grep -q 'unreadable-source-path' "$OUT/analyze-source.json"; then
  echo "ok   analyzer exposes machine-local source provenance"
else
  echo "FAIL analyzer misses unreadable absolute source provenance"; cat "$OUT/err"; fail=1
fi

if "$NODE" "$ANALYZER" "$OUT/s.html" --baseline "$OUT/document.html" >"$OUT/analyze-size.json" 2>"$OUT/err" &&
   grep -q 'size-growth' "$OUT/analyze-size.json" &&
   grep -q 'output size exceeds 2x baseline' "$OUT/analyze-size.json"; then
  echo "ok   analyzer gates output growth above 2x baseline"
else
  echo "FAIL analyzer misses excessive normalization growth"; cat "$OUT/err"; fail=1
fi

# Reviewed payload application is deterministic: generated placeholders only, safe JS
# string serialization, governed raw-JS zones, and a distinct atomic output.
printf '%s' '{"pages":{"page-1":"<main><h1>Safe</h1><script>demo</script>\u2028</main>"},"styles":".safe { color: red; }","sharedHelpers":"function icon() { return '\''ok'\''; }","afterRender":"root.querySelectorAll('\''.faq'\'').forEach(function (item) { item.addEventListener('\''click'\'', function () {}); }); root.setAttribute('\''data-ready'\'', page);"}' >"$OUT/payload.json"
if "$PY" "$APPLIER" --harness "$OUT/s.html" --payload "$OUT/payload.json" --out "$OUT/applied.html" >"$OUT/out" 2>"$OUT/err" &&
   grep -Fq '<\/script>' "$OUT/applied.html" &&
   grep -Fq '\u2028' "$OUT/applied.html" &&
   grep -q 'function icon()' "$OUT/applied.html" &&
   "$NODE" "$RUNTIME" "$OUT/applied.html" >/dev/null 2>"$OUT/err"; then
  echo "ok   payload applicator serializes safely and keeps runtime valid"
else
  echo "FAIL deterministic payload application"; cat "$OUT/err"; fail=1
fi
printf '%s' '{"pageBodies":{"page-1":"  return sharedLayout('\''Body'\'');"},"styles":"","sharedHelpers":"function sharedLayout(value) { return '\''<main><h1>'\'' + value + '\''</h1></main>'\''; }","afterRender":""}' >"$OUT/body-payload.json"
if "$PY" "$APPLIER" --harness "$OUT/s.html" --payload "$OUT/body-payload.json" --out "$OUT/body-applied.html" >"$OUT/out" 2>"$OUT/err" &&
   grep -q "return sharedLayout('Body')" "$OUT/body-applied.html" &&
   "$NODE" "$RUNTIME" "$OUT/body-applied.html" >/dev/null 2>"$OUT/err"; then
  echo "ok   payload applicator preserves reusable page function bodies"
else
  echo "FAIL reusable page-body application"; cat "$OUT/err"; fail=1
fi
"$PY" "$APPLIER" --harness "$OUT/applied.html" --payload "$OUT/payload.json" --out "$OUT/overwrite.html" >"$OUT/out" 2>"$OUT/err"
got=$?
if [ "$got" -eq 2 ] && [ ! -e "$OUT/overwrite.html" ]; then
  echo "ok   payload applicator refuses a lossy overwrite"
else
  echo "FAIL payload applicator overwrite gate: exit $got"; cat "$OUT/err"; fail=1
fi

: >"$OUT/empty.html"
"$NODE" "$ANALYZER" "$OUT/empty.html" >"$OUT/analyze-empty.json" 2>"$OUT/err"
got=$?
if [ "$got" -eq 2 ] && grep -q 'input is empty' "$OUT/err"; then
  echo "ok   analyzer rejects empty input with exit 2"
else
  echo "FAIL analyzer empty input exit $got, expected 2"; cat "$OUT/err"; fail=1
fi

# ─── Runtime ─────────────────────────────────────────────────────────────────
# Everything above asserts on the TEXT of the generated file. A generator emitting a
# syntactically dead <script> satisfies all of it: measured on a copy with an unbalanced
# brace in setViewport, this selftest printed ALL GREEN / exit 0 while the produced file
# answered `typeof setPage === "undefined"` in a browser. The JS is now executed.
for f in m.html c.html s.html meta.html; do
  case "$f" in
    m.html) args="--expect-pages home,contact" ;;
    meta.html) args="--expect-pages home,companies" ;;
    *)      args="" ;;
  esac
  # shellcheck disable=SC2086
  if "$NODE" "$RUNTIME" "$OUT/$f" $args; then :; else
    echo "FAIL runtime check on $f"; fail=1
  fi
done

# A syntactically valid but non-terminating author helper cannot hang the analyzer or CI.
sed '/function placeholder/i\    while (true) {}' "$OUT/s.html" >"$OUT/infinite.html"
if "$NODE" "$RUNTIME" "$OUT/infinite.html" >"$OUT/out" 2>"$OUT/err"; then
  echo "FAIL runtime accepts an infinite author script"; fail=1
elif grep -q 'timed out' "$OUT/err"; then
  echo "ok   runtime bounds non-terminating scripts"
else
  echo "FAIL runtime rejects infinite script without timeout evidence"; cat "$OUT/err"; fail=1
fi

# ─── Three-branch page-key invariant ─────────────────────────────────────────
# Registry, <option value> and the oracle's reference_page are one set written by three
# hands. Asserting only that a conformant file passes proves nothing: each branch is
# mutated in turn and the check must go RED. A green that no mutation can turn red is
# the defect this whole file exists against.
printf '%s' '{"reference_page":"contact","targets":[]}' >"$OUT/oracle-ok.json"
printf '%s' '{"reference_page":"nowhere","targets":[]}' >"$OUT/oracle-bad.json"
printf '%s' '{"reference_page":null,"targets":[]}'      >"$OUT/oracle-null.json"

# The registry key is renamed alone — the <option> still offers "contact".
sed 's/^    "contact": pageContact,/    "contactez": pageContact,/' "$OUT/m.html" >"$OUT/mut-registry.html"
# The <option> value is renamed alone — the registry still declares "contact".
sed 's/<option value="contact">/<option value="contacts">/' "$OUT/m.html" >"$OUT/mut-option.html"

invariant() {  # name expect(pass|fail) <runtime args…>
  name=$1; want=$2; shift 2
  if "$NODE" "$RUNTIME" "$@" >/dev/null 2>"$OUT/err"; then got=pass; else got=fail; fi
  if [ "$got" = "$want" ]; then
    echo "ok   invariant $name: $got"
  else
    echo "FAIL invariant $name: $got, expected $want"; cat "$OUT/err"; fail=1
  fi
}

# Each mutation must actually differ from the source, or the test asserts on a no-op.
cmp -s "$OUT/m.html" "$OUT/mut-registry.html" && { echo "FAIL registry mutation is a no-op"; fail=1; }
cmp -s "$OUT/m.html" "$OUT/mut-option.html"   && { echo "FAIL option mutation is a no-op"; fail=1; }

invariant "conformant"        pass "$OUT/m.html"
invariant "registry-renamed"  fail "$OUT/mut-registry.html"
invariant "option-renamed"    fail "$OUT/mut-option.html"
invariant "oracle-known"      pass "$OUT/m.html" --oracle-config "$OUT/oracle-ok.json"
invariant "oracle-unknown"    fail "$OUT/m.html" --oracle-config "$OUT/oracle-bad.json"
invariant "oracle-null"       pass "$OUT/m.html" --oracle-config "$OUT/oracle-null.json"
invariant "oracle-absent"     fail "$OUT/m.html" --oracle-config "$OUT/no-such-config.json"
# A flag consumes its value wherever the file sits: the file is checked, never read as `home`.
invariant "flag-before-file"  pass --expect-pages home,contact "$OUT/m.html"

if [ "$fail" -eq 0 ]; then echo "ALL GREEN"; exit 0; else echo "SELFTEST FAILED"; exit 1; fi
