# Debrief

Retrospective on **how the work was conducted**, reconstructed from the conversation transcripts: where the sessions stalled, how skills and prompts were used, and which plugin chains kept reappearing. Read-only and cheap — never runs the test suite, the linter, a coverage pass, an audit, or any sibling action.

`previously` answers *where does the project stand*; `debrief` answers *how did we work, and what should change next time*. The first reads project documentation, the second reads process telemetry. Neither judges the code.

The output is an interpretation of observed traces. Every finding must point at an observed signal — a session, a timestamp, a tool name, a quoted fragment. A recommendation without a trace is dropped, not softened.

## Context required

Accepted syntax after the `debrief` action selector:

```text
debrief [<depth>] [--scope project | --scope global] [--focus frictions|skills|prompts|plugins] [--save <file.md>]
```

- `<depth>` is the optional first positional value: a positive session count or a duration such as `30d`. Default: 8 sessions inside a 30-day window. A duration keeps every session **active** in that window, capped at 40; a count keeps the N most recent sessions whatever their age. A session opened before the window and resumed inside it enters whole, older turns included — its printed `span` shows that, and a finding drawn from such a session dates itself by the span, not by the window.
- `--scope project` (default) reads only the transcripts of the current working directory. `--scope global` reads every project's transcripts and attributes each finding to its project.
- `--focus` is accepted at most once and restricts the report to one axis: `frictions`, `skills`, `prompts`, or `plugins`. Without it, the four axes are produced.
- `--save` accepts exactly one non-empty Markdown file path. The report is written there **in addition** to being displayed; an existing file is appended to under a dated heading, one level below its current top heading, never truncated.
- Parse and validate the whole argument list before any probe. Reject an unknown option, an extra positional value, a duplicate option, a missing value, an unknown `--focus` axis, or a depth placed after named options. On rejection, do no work.

## Time budget

The whole action targets **under 30 seconds**. Wrap every probe in `timeout 10`. A probe that times out, errors, or finds nothing yields `N/A` for its section and the action continues — never retry it, never substitute a heavier command. The transcripts are large: only the digest below is ever read into context, never a transcript whole, never a tool result body.

## Prompt

### Step 1 — Parse arguments

Apply `Context required`. Keep the resolved depth, scope, optional focus axis, and optional save path as separate values.

### Step 2 — Collect the process digest

Claude Code writes one transcript per session in `~/.claude/projects/<slug>/<session-uuid>.jsonl`, where `<slug>` is the absolute working directory with every non-alphanumeric character replaced by `-`. Each line is a JSON object. The lines that carry process signal are `assistant` (whose `message.content` holds `tool_use` blocks), `user` (a string content is a real prompt; a list content holding `tool_result` blocks is a tool return, and `is_error` marks a failure), `ai-title` (the session title), and any line with `isCompactSummary: true` (the session outgrew its context window).

```bash
timeout 10 python3 - "$PWD" 30 8 project <<'PY'
import json, os, glob, re, sys, time, collections

cwd, days, nsess, scope = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
cut = (time.time() - days * 86400) * 1000
root = os.path.expanduser("~/.claude/projects")
slug = re.sub(r"[^a-zA-Z0-9]", "-", cwd)
dirs = sorted(glob.glob(f"{root}/*")) if scope == "global" else [f"{root}/{slug}"]

CORRECT = re.compile(
    r"\b(non|nope|pas du tout|toujours pas|pas ça|je t'ai dit|je t'avais dit|tu n'as pas|"
    r"refais|recommence|annule|revert|undo|c'est faux|ça marche pas|ne marche pas|"
    r"wrong|not what|still broken|doesn't work)\b", re.I)
INTERRUPT = re.compile(r"\[Request interrupted", re.I)
INJECTED = re.compile(r"^\s*(<system-reminder|<command-(message|name|args)|<local-command|Caveat:)", re.I)
ATTACH = re.compile(r"^\s*\[(Image|Pasted text|Screenshot) ?#?\d*\]\s*$", re.I)
APOS = str.maketrans({"’": "'", "‘": "'", "ʼ": "'"})

files = []
for d in dirs:
    for p in glob.glob(f"{d}/*.jsonl"):
        if os.path.getmtime(p) * 1000 >= cut:
            files.append(p)
files.sort(key=os.path.getmtime, reverse=True)
files = files[:nsess]

tool_all, skill_all, pair_all = collections.Counter(), collections.Counter(), collections.Counter()
for p in files:
    title = None
    compacts = 0
    prompts = []          # (ts, text)
    errors = []           # (tool, excerpt)
    tools = collections.Counter()
    skills = []           # (ts, name)
    agents = collections.Counter()
    interrupts = 0
    first = last = None
    pend = {}             # tool_use id -> tool name
    for line in open(p, errors="ignore"):
        try:
            d = json.loads(line)
        except Exception:
            continue
        if d.get("type") == "ai-title":
            title = d.get("aiTitle")
        if d.get("isCompactSummary"):
            compacts += 1
        ts = d.get("timestamp")
        if isinstance(ts, str):
            first = first or ts
            last = ts
        m = d.get("message") or {}
        c = m.get("content")
        if d.get("type") == "assistant" and isinstance(c, list):
            for b in c:
                if isinstance(b, dict) and b.get("type") == "tool_use":
                    name, inp = b.get("name"), b.get("input") or {}
                    tools[name] += 1
                    pend[b.get("id")] = name
                    if name in ("Skill", "SlashCommand"):
                        skills.append((ts, str(inp.get("skill") or inp.get("command") or "?")))
                    if name in ("Task", "Agent"):
                        agents[str(inp.get("subagent_type") or "?")] += 1
        if d.get("type") == "user":
            if isinstance(c, str):
                if not INJECTED.match(c):
                    prompts.append((ts, c.translate(APOS)))
            elif isinstance(c, list):
                for b in c:
                    if not isinstance(b, dict):
                        continue
                    if b.get("type") == "tool_result":
                        if b.get("is_error"):
                            body = b.get("content")
                            if isinstance(body, list):
                                body = " ".join(x.get("text", "") for x in body if isinstance(x, dict))
                            errors.append((pend.get(b.get("tool_use_id"), "?"),
                                           re.sub(r"\s+", " ", str(body))[:160]))
                    elif b.get("type") == "text":
                        txt = b.get("text", "")
                        if INTERRUPT.search(txt):
                            interrupts += 1
                        elif not INJECTED.match(txt):
                            prompts.append((ts, txt.translate(APOS)))
    print(f"\n## session {os.path.basename(p)[:8]} | {os.path.basename(os.path.dirname(p))}")
    print(f"title: {title or 'N/A'} | span: {(first or '?')[:16]} -> {(last or '?')[:16]}"
          f" | prompts: {len(prompts)} | compactions: {compacts} | interrupts: {interrupts}")
    print("tools:", ", ".join(f"{k}x{v}" for k, v in tools.most_common(10)) or "none")
    print("skills:", " -> ".join(n for _, n in skills) or "none")
    if agents:
        print("agents:", ", ".join(f"{k}x{v}" for k, v in agents.most_common()))
    if errors:
        seen = collections.Counter(t for t, _ in errors)
        print("tool errors:", ", ".join(f"{k}x{v}" for k, v in seen.most_common()))
        for t, e in errors[:6]:
            print(f"  ! {t}: {e}")
    corr = [(ts, re.sub(r'\s+', ' ', t)[:150]) for ts, t in prompts
            if len(t) < 320 and CORRECT.search(t) and not INTERRUPT.search(t)]
    if corr:
        print("correction-shaped prompts:", len(corr))
        for ts, t in corr[:6]:
            print(f"  < {(ts or '?')[11:16]} {t}")
    short = [t for _, t in prompts if len(t.strip()) < 25 and not ATTACH.match(t)]
    if short:
        print("terse prompts:", len(short), "|", " / ".join(s.strip()[:30] for s in short[:6]))
    tool_all.update(tools)
    skill_all.update(n for _, n in skills)
    for a, b in zip(skills, skills[1:]):
        pair_all[f"{a[1]} -> {b[1]}"] += 1

print("\n## aggregate")
print("sessions:", len(files))
print("tools:", ", ".join(f"{k}x{v}" for k, v in tool_all.most_common(15)) or "none")
print("skills:", ", ".join(f"{k}x{v}" for k, v in skill_all.most_common(20)) or "none")
print("skill chains:", ", ".join(f"{k} x{v}" for k, v in pair_all.most_common(10)) or "none")
PY
```

Substitute the working directory, the day count, the session count, and the scope into the four arguments, in that order. A duration depth passes its day count and the session cap of 40; a count depth passes that count and the default 30-day window.

The digest is the only material that enters context. It carries, per session: the title, the time span, the prompt count, the compaction and interrupt counts, the tool histogram, the ordered skill chain, the sub-agents, the tool errors grouped by tool with six one-line excerpts, the correction-shaped prompts, and the terse prompts. System reminders, command wrappers, and attachment markers are filtered out of the prompt counts, and typographic apostrophes are normalized so the French correction patterns match.

### Step 3 — Read the available surface

Findings about *unused* capability need the inventory of what was available. Take it from the skills listed as available in the current session — that is the live, per-project surface — and fall back to `~/.claude/plugins/installed_plugins.json` only when that list is absent. Never walk `~/.claude/plugins/cache/`: it holds several versions per plugin and answers a different question.

### Step 4 — Analyze the four axes

Work only from the digest and the inventory. Each finding names its evidence.

**Frictions.** What cost time. Read `tool errors` (a tool failing repeatedly on the same shape is a process defect, not bad luck), `interrupts` (the user stopped a run in flight — that run was going the wrong way), `compactions` (the session outgrew its window: the scope was too large for one session, or context was spent on the wrong material), and `correction-shaped prompts` (each one marks a turn that missed). Group by cause, not by occurrence. Distinguish a one-off from a pattern: a signal seen in a single session is an anecdote, the same signal across two or more sessions is a finding.

**Skills.** How the skill surface was actually used. Compare `skills` against the available inventory: which were invoked, which were invoked then immediately abandoned, and — the expensive gap — which work was done by hand through `Read`/`Edit`/`Bash` loops while an available skill covered exactly it. A session with a long `tools` list and an empty `skills` list is the signal to inspect first. Name the skill that was missed and the moment it should have fired.

**Prompts.** Which formulations worked. A `terse prompt` immediately followed by a `correction-shaped prompt` marks an underspecified request; a long prompt followed by a clean run marks a formulation worth keeping. Report the recurring shape, never a catalogue of individual prompts, and give one concrete rewrite for each weak shape found.

**Plugin synergies.** Read `skill chains`: a pair or triple that recurs across sessions is a workflow the user re-types by hand. A chain seen three times or more with no matching alias is a concrete alias candidate — name it and give its sequence. Report the inverse too: installed plugins never touched in the window, and two skills whose invocations alternate as if competing for the same job.

### Step 5 — Fill and display

Fill `@../assets/debrief.md` and display it exactly once. With `--focus`, drop the three axis sections that were not asked for; the header, `Change this first`, `Recommendations` and `Coverage` always stay, each restricted to the retained axis.

- Lead with the single change that would have saved the most time in the window, stated as an action the user can take now.
- Rank recommendations by observed cost — frequency times the time visibly lost — not by how easy they are to apply.
- Each recommendation carries its evidence inline: session id, date, and the signal it rests on.
- Report coverage honestly: number of sessions read, window, and what was unavailable (`N/A` probes). A thin window produces a short report, not an inflated one.
- Never quote more than a line of user prose, never a tool result body, never file contents. The report describes process, not work product.
- Never grade the user and never grade the assistant. Findings are mechanical: a signal, its frequency, its cost, its fix.
- Never infer intent that no signal supports. When two readings of a signal are equally supported, say so in one clause and keep both.
- With `--save`, append the rendered report to the file, creating the file and its parent directories if needed, then report the path in one line. The report's own `# Debrief — How We Worked` title becomes `## Debrief — <yyyy-mm-dd>` and every heading below it drops one level, so a file holding several debriefs keeps one heading tree. Never truncate an existing file.
