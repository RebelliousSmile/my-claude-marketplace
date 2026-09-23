# Debrief

Retrospective on **how the work was conducted**, reconstructed from the conversation transcripts: where the sessions stalled, how skills and prompts were used, which plugin chains kept reappearing, whether a bounded sample of skill contracts explains the observed friction, and what the measured token distribution says when AIDD telemetry is active. Read-only and cheap — never runs the test suite, the linter, a coverage pass, an audit, or any sibling action.

`previously` answers *where does the project stand*; `debrief` answers *how did we work, and what should change next time*. The first reads project documentation, the second reads process telemetry and, for at most three evidenced candidates, the active skill contract. Neither judges the product code.

The output is an interpretation of observed traces. Every finding must point at an observed signal — a session, a timestamp, a tool name, a quoted fragment. A recommendation without a trace is dropped, not softened.

## Context required

Accepted syntax after the `debrief` action selector:

```text
debrief [<depth>] [--scope project | --scope global] [--focus frictions|skills|skill-quality|prompts|plugins|tokens] [--skill <plugin:skill>] [--save <file.md>]
```

- `<depth>` is the optional first positional value: a positive session count or a duration such as `30d`. Default: 8 sessions inside a 30-day window. A duration keeps every session **active** in that window, capped at 40; a count keeps the N most recent sessions whatever their age. A session opened before the window and resumed inside it enters whole, older turns included — its printed `span` shows that, and a finding drawn from such a session dates itself by the span, not by the window.
- `--scope project` (default) reads only the transcripts of the current working directory. `--scope global` reads every project's transcripts and attributes each finding to its project.
- `--focus` is accepted at most once and restricts the report to one axis: `frictions`, `skills`, `skill-quality`, `prompts`, `plugins`, or `tokens`. Without it, all six axes are produced. `skills` means usage and selection; `skill-quality` means the observed contract quality of a bounded sample; `tokens` means exact AIDD telemetry when available plus explicitly labelled contextual proxies.
- `--skill` is accepted at most once and must be a namespaced skill token such as `overcode:alias`. It restricts `skill-quality` to that skill and is valid with no focus or with `--focus skill-quality`; reject it with another focus.
- `--save` accepts exactly one non-empty Markdown file path. The report is written there **in addition** to being displayed; an existing file is appended to under a dated heading, one level below its current top heading, never truncated.
- Parse and validate the whole argument list before any probe. Reject an unknown option, an extra positional value, a duplicate option, a missing value, an unknown `--focus` axis, or a depth placed after named options. On rejection, do no work.

## Time budget

The whole action targets **under 30 seconds**. Wrap every probe in `timeout 10`. A probe that times out, errors, or finds nothing yields `N/A` for its section and the action continues — never retry it, never substitute a heavier command. The transcripts are large: only the digest below is ever read into context, never a transcript whole, never a complete tool result body. Skill-quality may additionally read the active `SKILL.md` and the directly observed action files of at most three candidates. Token analysis may run the two official `aidd telemetry` commands below; it never reads the telemetry store or recomputes its figures.

## Prompt

### Step 1 — Parse arguments

Apply `Context required`. Keep the resolved depth, scope, optional focus axis, optional skill target, and optional save path as separate values.

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
    episodes = []
    active_episode = None
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
                        skill_name = str(inp.get("skill") or inp.get("command") or "?")
                        skills.append((ts, skill_name))
                        active_episode = {
                            "ts": ts, "name": skill_name,
                            "prompt": prompts[-1][1] if prompts else "",
                            "errors": [], "correction": None, "reads": []}
                        episodes.append(active_episode)
                    if name == "Read" and active_episode is not None:
                        read_path = str(inp.get("file_path") or inp.get("path") or "")
                        if "/skills/" in read_path and read_path.endswith(".md"):
                            active_episode["reads"].append(read_path.rsplit("/skills/", 1)[-1])
                    if name in ("Task", "Agent"):
                        agents[str(inp.get("subagent_type") or "?")] += 1
        if d.get("type") == "user":
            if isinstance(c, str):
                if not INJECTED.match(c):
                    normalized = c.translate(APOS)
                    prompts.append((ts, normalized))
                    if (active_episode is not None and active_episode["correction"] is None
                            and len(normalized) < 320 and CORRECT.search(normalized)):
                        active_episode["correction"] = normalized
                    active_episode = None
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
                            if active_episode is not None:
                                active_episode["errors"].append(re.sub(r"\s+", " ", str(body))[:120])
                    elif b.get("type") == "text":
                        txt = b.get("text", "")
                        if INTERRUPT.search(txt):
                            interrupts += 1
                        elif not INJECTED.match(txt):
                            normalized = txt.translate(APOS)
                            prompts.append((ts, normalized))
                            if (active_episode is not None and active_episode["correction"] is None
                                    and len(normalized) < 320 and CORRECT.search(normalized)):
                                active_episode["correction"] = normalized
                            active_episode = None
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
        short_rows = [(ts, t) for ts, t in prompts if len(t.strip()) < 25 and not ATTACH.match(t)]
        print("terse prompts:", len(short_rows))
        for ts, t in short_rows[:6]:
            print(f"  > {(ts or '?')[11:16]} {t.strip()[:60]}")
    if episodes:
        print("skill episodes:")
        ranked = sorted(enumerate(episodes),
                        key=lambda row: (bool(row[1]["correction"]), len(row[1]["errors"]), -row[0]),
                        reverse=True)[:6]
        for _, episode in sorted(ranked, key=lambda row: row[0]):
            prompt = re.sub(r"\s+", " ", episode["prompt"])[:120] or "N/A"
            correction = re.sub(r"\s+", " ", episode["correction"] or "")[:120] or "none"
            reads = ",".join(dict.fromkeys(episode["reads"])) or "none"
            print(f"  @ {(episode['ts'] or '?')[11:16]} {episode['name']} | prompt={prompt}"
                  f" | errors={len(episode['errors'])} | correction={correction} | reads={reads}")
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

The digest is the only transcript material that enters context. It carries, per session: the title, the time span, the prompt count, the compaction and interrupt counts, the tool histogram, the ordered skill chain, the sub-agents, the tool errors grouped by tool with six one-line excerpts, timestamped correction/terse prompts, and up to six evidence-ranked skill episodes (correction first, then errors). An episode names the invoking prompt, error count, next correction-shaped prompt, and directly observed skill-file reads; it does not carry an assistant answer or prove success. System reminders, command wrappers, and attachment markers are filtered out of the prompt counts, and typographic apostrophes are normalized so the French correction patterns match.

### Step 3 — Resolve availability, provenance, and the bounded contract sample

Findings about *unused* capability need the inventory of what was available. Take it from the skills listed as available in the current session and use `~/.claude/plugins/installed_plugins.json` only to resolve plugin provenance, active version and install date. Never walk `~/.claude/plugins/cache/`: it holds several versions per plugin and answers a different question. The current inventory proves current availability only; claim historical availability for a session only when the installation metadata predates that session.

Classify every invoked skill by marketplace ownership:

- plugin id ending in `@my-marketplace` → `my-marketplace`, potentially editable in its canonical source repository;
- every other marketplace, built-in or unresolved skill → `external`, read-only for this report.

An installed cache path is always an inspection source, never an edit target. When the current workspace is the `my-marketplace` source repository and `plugins/<plugin>/skills/<skill>/SKILL.md` exists, prefer that canonical file. Otherwise read the active installed `SKILL.md` only as a contract snapshot.

For `skill-quality`, inspect the skill selected by `--skill`, or at most three candidates ranked by observed correction, observed errors, then invocation count. Read each active `SKILL.md` and only the action files named by the episode's `reads` field or unambiguously selected by its invocation. If the selected action cannot be established, assess the router only and say so. Do not infer the quality of an unread action.

### Step 4 — Collect official token telemetry when applicable

Run this step only when no focus is set or `--focus tokens` is selected. Treat plugin availability, project consent, CLI availability, journal coverage, and readable measurements as different states:

1. `aidd-telemetry:01-cost` must be present in the current available-skill inventory. If it is absent, exact telemetry is `N/A — aidd-telemetry unavailable`.
2. Read `.aidd/config.json` without changing it. Only `telemetry.enabled: true` authorizes collection for this project. If the file or switch is absent or false, exact telemetry is `N/A — measurement disabled`; never enable it from `debrief`.
3. Require `aidd --version`. If it does not answer, exact telemetry is `N/A — aidd CLI unavailable`; never install it from `debrief`.
4. Derive `<from>` and `<to>` from the earliest and latest calendar dates printed by the selected digest. Run exactly once each, in order:

   ```bash
   timeout 10 aidd telemetry read
   timeout 10 aidd telemetry report --from <yyyy-mm-dd> --to <yyyy-mm-dd> --json
   ```

   Never invoke the cost skill as a sibling action, inspect `aidd_docs/runs/`, read `~/.config/aidd/telemetry/`, or sum transcript counters. The CLI is the only source of exact token figures.
5. Accept the report only when `cost_report_version` is `15`. Otherwise exact telemetry is `N/A — unsupported cost report version <n>`; do not guess a changed schema. A failed or empty `read`, unreadable sessions, or report error is carried into coverage exactly as the CLI names it. An absent number is unknown, never zero.

The telemetry report covers its stated calendar period; the process digest covers the selected sessions. When those populations are not proven identical — notably with a count depth or resumed sessions — report both coverages and do not attribute a period total to the selected sessions alone.

Interpret the official `totals`, `by_step`, `by_prompt`, `by_agent`, and `by_model` fields through the bounded principles of the `aidd-context:12-cook` `token-optimization` recipe: measure before recommending; look for task-boundary context reuse, involuntary compaction, repeated instructions, noisy tool output, unnecessary skill/tool activation, unsuitable model routing, and avoidable delegation volume. This is an interpretation rubric, not another measurement source, and `debrief` does not execute the recipe's remediation steps.

### Step 5 — Analyze the six axes

Work only from the digest, the availability/provenance inventory, the bounded contracts selected in Step 3, and the optional official telemetry report from Step 4. Each finding names its evidence.

**Frictions.** What cost time. Read `tool errors`, `interrupts`, `compactions`, and `correction-shaped prompts`. Group by cause, not by occurrence. Distinguish a one-off from a pattern: a signal seen in a single session is an anecdote, the same signal across two or more sessions is a finding. An error excerpt is not automatically waste: exclude an expected negative test, deliberate probe, sandbox refusal, or ambiguous failure from ranked cost unless the episode proves avoidable rework. A compaction supports excessive session load, but not one unique cause; name competing explanations unless the episode evidence discriminates them.

**Skills.** How the skill surface was actually used. Compare invocations against capabilities proven available at that session date. Report selection, repetition, and work apparently done by hand only when an episode names the intent and the available skill covers it. A long tool list with no skill is a candidate for inspection, not proof that a skill was missed. Do not call a repeated invocation redundant without evidence that the first invocation had already completed the same job.

**Skill quality.** Compare each bounded episode with the contract actually read. Assess routing/trigger precision, instruction clarity, executable completeness, error recovery/idempotence, and output usefulness. Separate three evidence levels: `telemetry only`, `contract inspected`, and `reproduced`. A correction after invocation is evidence of friction, not by itself evidence that the skill caused it.

- For a `my-marketplace` skill, a supported finding may recommend an exact editorial or functional change in the canonical source.
- For an `external` skill, never recommend changing its wording, action files, or implementation in this repository. Limit the action to better invocation, a `my-marketplace` adapter/workflow change, or an explicitly labelled upstream report candidate.
- If ownership is unresolved, treat the skill as external. Never turn an installed cache path into a proposed edit.

**Prompts.** Which formulations worked. Use episode order, not separate aggregate lists. A terse prompt followed by a correction is evidence of underspecification only when no intervening event provides another cause. The digest does not retain assistant outcomes, so absence of correction means `no correction observed`, never `successful execution`. Report the recurring shape, never a catalogue of individual prompts, and give one concrete rewrite for each supported weak shape.

**Plugin synergies.** Treat adjacent entries in `skill chains` as candidates only. Call them a recurring workflow when their bounded episodes show the same intent and no issue/task boundary separates them. Three corroborated repetitions with no matching alias make an alias candidate. Report untouched plugins only when their historical availability is proven, and do not frame a domain-irrelevant plugin as missed. Two alternating skills compete only when their contracts claim the same job.

**Tokens.** Lead with the measurement state: `exact via aidd-telemetry`, `partial via aidd-telemetry`, or `contextual proxies only`, with the reason for any limit. With exact or partial telemetry, report total tokens, requests, sessions and cache share when present, then at most three hotspots across step, prompt, agent, or model. Preserve the CLI's attribution labels and unknowns. Cache volume is a distribution, not waste by itself; a high-token skill, prompt, agent, or model is a hotspot to investigate, not proof of inefficiency. Correlate a hotspot with digest evidence only when dates, task boundaries, and episodes align. Without official telemetry, use only compactions, task changes inside one session, repeated reads/invocations, tool-output volume, and correction loops as `contextual proxies`; never estimate a token total or cost from them. Convert supported observations into the smallest applicable recipe action, such as a fresh context at a task boundary, deliberate compaction within the same task, quieter command output, less repeated instruction text, or different model/delegation routing.

### Step 6 — Fill and display

Fill [the debrief template](../assets/debrief.md) and display it exactly once. With `--focus`, keep only the requested axis section; the header, `Change this first`, `Recommendations` and `Coverage` always stay, each restricted to the retained axis. With `--focus skills`, omit skill quality; with `--focus skill-quality`, omit skill usage. With another focus, do not probe or render tokens.

- Lead with the single change that would have saved the most time in the window, stated as an action the user can take now.
- Rank recommendations by observed cost — frequency times the time visibly lost — not by how easy they are to apply.
- Each recommendation carries its evidence inline: session id, date, and the signal it rests on.
- Report coverage honestly: number of sessions read, window, and what was unavailable (`N/A` probes). A thin window produces a short report, not an inflated one.
- Never quote more than a line of user prose, never a tool result body, never file contents. The report describes process, not work product.
- Never grade the user and never grade the assistant. Findings are mechanical: a signal, its frequency, its cost, its fix.
- Never infer intent that no signal supports. When two readings of a signal are equally supported, say so in one clause and keep both.
- Every skill-quality row states ownership, evidence level, and allowed action. Editorial or functional changes are exclusive to `my-marketplace`; an external limitation is never silently rewritten as user error.
- Every token section names whether its figures are exact, partial, or proxies; never turn unavailable telemetry, unattributed work, or an absent amount into zero.
- With `--save`, append the rendered report to the file, creating the file and its parent directories if needed, then report the path in one line. The report's own `# Debrief — How We Worked` title becomes `## Debrief — <yyyy-mm-dd>` and every heading below it drops one level, so a file holding several debriefs keeps one heading tree. Never truncate an existing file.
