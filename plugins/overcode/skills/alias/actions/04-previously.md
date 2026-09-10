# Previously

Documentary catch-up before starting work: what the previous conversations were about, what moved in `aidd_docs/`, and where the working tree stands. Read-only and cheap — never runs the test suite, the linter, a coverage pass, an audit, or the `status report` action.

The output is a reconstruction from conversation history and project documentation. It may lag behind the code; that is accepted. Downstream work realigns it. Never delay or block the briefing to verify a claim against the codebase.

## Context required

Accepted syntax after the `previously` action selector:

```text
previously [<depth>] [--backlog <file.md>] [--milestone <title> | --ml <title>] [--exclude-milestone <title> | --em <title>] [--exclude-milestone <title2> | --em <title2>]
```

- `<depth>` is the existing optional first positional value: a positive commit count or a duration such as `7d`. Default: 15 commits. A duration also widens the `aidd_docs/` and conversation windows; a commit count leaves them at their 14-day default.
- `--backlog` accepts exactly one non-empty Markdown file path. `--milestone` and `--ml` are strict synonyms, accepted at most once and only with `--backlog`.
- `--exclude-milestone` and `--em` are strict synonyms, accepted zero or more times and only with `--backlog`.
- Parse and validate the whole argument list before any file lookup, command, sibling action, or sub-agent. Reject an unknown option, extra positional value, duplicate `--milestone`/`--ml` option, duplicate `--exclude-milestone`/`--em` without value, missing value, orphan milestone filter, orphan exclusion filter, or depth placed after named options. On rejection, do no work.
- Preserve the selected spelling and values verbatim when forwarding the backlog request; do not reinterpret the filter or exclusion as native provider options.

## Time budget

The whole action targets **under 20 seconds**. Wrap every probe in `timeout 5`. A probe that times out, errors, or finds nothing yields `N/A` in the output and the action continues — never retry it, never substitute a heavier command. Collect the three sources below in a single response, in parallel.

## Prompt

### Step 1 — Parse arguments

Apply `Context required`. Keep the resolved depth, optional backlog file, and optional filters as separate values.

### Step 2 — Optional backlog synchronization

When `--backlog` is present, invoke the sibling `status` skill's `backlog` action before collecting the sources:

```text
status backlog <file.md> [--milestone <title> | --ml <title>] [--exclude-milestone <title> | --em <title>] [--exclude-milestone <title2> | --em <title2>]
```

Forward the file, option spelling and filter value, and all exclusion values verbatim as separate arguments, in the order they were provided.

- On success, retain only this compact receipt for the final output: `Backlog: updated <file.md> (inserted|replaced)`. Do not repeat the detailed backlog report, its issue count, headings, or issue lines.
- On failure, relay the useful cause and `File unchanged.`, then stop.

### Step 3 — Source A: previous conversations

Claude Code stores the user prompt history in `~/.claude/history.jsonl` (one JSON object per line, keys `display`, `timestamp` in ms, `project`) and one transcript per session in `~/.claude/projects/<slug>/<session-uuid>.jsonl`, where `<slug>` is the absolute working directory with every non-alphanumeric character replaced by `-`. Transcript lines of type `ai-title` carry the session title; a line with `isCompactSummary: true` carries a dense summary of the session so far.

Extract a compact digest — never read a transcript whole:

```bash
timeout 5 python3 - "$PWD" 14 <<'PY'
import json, os, glob, re, time
cwd, days = os.sys.argv[1], int(os.sys.argv[2])
cut = (time.time() - days * 86400) * 1000
print("## prompts")
try:
    rows = []
    for line in open(os.path.expanduser("~/.claude/history.jsonl"), errors="ignore"):
        try: d = json.loads(line)
        except Exception: continue
        if d.get("project") == cwd and d.get("timestamp", 0) >= cut:
            rows.append((d["timestamp"], (d.get("display") or "").strip()))
    for ts, txt in rows[-25:]:
        print(time.strftime("%Y-%m-%d %H:%M", time.localtime(ts / 1000)), "|", txt.replace("\n", " ")[:180])
except FileNotFoundError:
    print("N/A")
slug = re.sub(r"[^a-zA-Z0-9]", "-", cwd)
files = sorted(glob.glob(os.path.expanduser(f"~/.claude/projects/{slug}/*.jsonl")), key=os.path.getmtime, reverse=True)[:3]
for p in files:
    title, summary = None, None
    for line in open(p, errors="ignore"):
        try: d = json.loads(line)
        except Exception: continue
        if d.get("type") == "ai-title": title = d.get("aiTitle")
        if d.get("isCompactSummary"):
            c = d.get("message", {}).get("content")
            summary = c if isinstance(c, str) else " ".join(
                x.get("text", "") for x in c or [] if isinstance(x, dict))
    print(f"\n## session {os.path.basename(p)[:8]} ({time.strftime('%Y-%m-%d', time.localtime(os.path.getmtime(p)))})")
    print("title:", title or "N/A")
    if summary: print("summary:", summary[:2000])
PY
```

From that digest, reconstruct the thread of work: what the user asked for, in which order, what the last session was named, and what its summary says was in flight. Prefer the most recent material when two sources disagree.

### Step 4 — Source B: what moved in `aidd_docs/`

This is the densest source. Collect it as metadata and frontmatter, never by reading documents in full:

```bash
timeout 5 git log --since="14 days ago" --oneline -- aidd_docs/ | head -20
timeout 5 find aidd_docs -name "*.md" -mtime -14 -printf '%TY-%Tm-%Td %p\n' 2>/dev/null | sort -r | head -25
timeout 5 bash -c 'for f in $(find aidd_docs/tasks -name plan.md 2>/dev/null); do printf "%s\t%s\n" "$(sed -n "s/^status: *//p" "$f" | head -1)" "$f"; done' | sort
timeout 5 git log --since="14 days ago" --oneline -- aidd_docs/memory/ | head -10
```

Interpret:

- **Active work** — every `plan.md` whose `status:` is `in-progress` or `blocked`. For each, read its phase files' frontmatter only and name the first phase that is not `done`. That pair is the resume point.
- **Recently closed** — plans that moved to `implemented` or `reviewed` inside the window; take the headline from the feature folder name and, when present, the `review.md` verdict line.
- **Learnings** — commits touching `aidd_docs/memory/` mean `aidd-context:10-learn` ran; name the banks that changed.
- **Backlog** — count the entries under `aidd_docs/backlog/{stories,tasks,defects,spikes,epics}/` that are not `done`, when that root exists.
- **Autonomous tracking** — flat `aidd_docs/tasks/<name>.md` files carrying `success_condition` / `iteration`: report the still-open ones with their iteration.

Support both the AIDD v5 layout (`aidd_docs/tasks/<yyyy_mm>/<yyyy_mm_dd>_<slug>/`) and the legacy flat layout. A directory without a direct `plan.md` is not a plan unit.

### Step 5 — Source C: git state

One bash block, no sub-agent. Use the resolved depth; default to 15 commits.

```bash
timeout 5 git branch --show-current
timeout 5 git log --oneline -<N>
timeout 5 git status -s
```

Group the commits by intent rather than listing them. Preserve a `#N` present in a commit summary as a plain reference; never resolve it remotely.

### Step 6 — Fill and display

Merge the three sources, fill `@../assets/previously.md`, and display it exactly once. If Step 2 produced a backlog receipt, display it once immediately before.

- Lead with the resume point: the one thing the user was doing and the next concrete step. When the sources disagree about it, pick the most recent and say so in one clause.
- Report each source's freshness (last session date, `aidd_docs/` last touch) so the user can judge the briefing.
- Never fabricate a test result, a coverage figure, or a lint verdict. These belong to `status report`; if the user wants them, point at that action in one line.
- Do not synthesize a second issue list from commit references.
