---
name: tune
model: sonnet
description: Walks a document chunk by chunk together with the user — presents each chunk, takes their remarks on style, form, or substance, corrects and resubmits it until they are satisfied, then moves to the next chunk. Works on ANY .md file; no <brief>/<output> project required. Use when the user wants to sit with a text and directly steer its correction, section by section: "on relit ce texte ensemble", "let's go through this chapter section by section", "tune this document with me", "walk me through this draft and I'll tell you what to fix". Do NOT use for autonomous persona-based scoring — use `review` instead; do NOT use for a single whole-artifact analysis+rewrite pass — use `upgrade` instead; do NOT use to define or update a project's style reference — use `tone-finder` instead.
---

# Tune

Walks a document one chunk at a time — section by section by default, or paragraph by paragraph — presenting each chunk to the user and applying their remarks until they are satisfied with it, before moving on to the next. Unlike `review` (autonomous persona-based scoring) or `upgrade` (single whole-artifact analysis-then-rewrite pass), `tune` never judges or corrects on its own initiative: every change comes from a remark the user makes on that specific chunk. The loop per chunk is: present → remarks → correct → resubmit → repeat until satisfied → advance.

**Standalone, any document**: `tune` takes a bare file path and needs neither `<brief>/` nor `<output>/` (cf. `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md`). It works equally on a narrative chapter (`<output>/chapters/chapter-<NN>.md`), a professional document (specification, user guide, technical document), or any standalone `.md` file with no project structure at all.

## Available actions

| #   | Action | Role                                                      | Input                                                                    |
| --- | ------ | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| 01  | `tune` | Sequential, user-directed chunk-by-chunk correction loop  | `<file>` [`--brief <brief>`] [`--by paragraph\|section`] [`--from <chunk-id>`] |

## Default flow

Single action: `01 → per chunk, loop remarks/correction until the user is satisfied → advance → repeat until end of document or user stops`.

Trigger-to-action mapping:
- "relisons ce texte ensemble", "let's tune this chapter section by section", "go through this draft with me and fix what I flag", "on reprend ce texte section par section" → `tune`

## Transversal rules

- No `<brief>/<output>` required — `tune` operates on a standalone file by default.
- **No autonomous critique**: `tune` never proposes a change the user hasn't asked for. If a chunk gets no remarks, it is accepted as-is and the pass moves on — silence is validation, not a signal to keep digging.
- `--brief`, when given, is loaded only as background context (voice, lore, terminology from `<brief>/summary.md` and `output-styles/`) to keep corrections consistent with the project — it is never the trigger for a change; the user's remarks are the only trigger.
- **Chunking**: split on `##`/`###` headings when present (`section` mode, default); otherwise group paragraphs (`paragraph` mode). Fixed once the pass starts — never re-chunk mid-loop. If the user asks to change `--by` or re-split mid-pass, refuse in plain language and keep going on the current chunk (see `actions/01-tune.md` step 3h for the exact wording); the only way to change chunking is to restart the pass.
- **Per chunk**: present the full chunk → collect remarks → apply exactly what was flagged, preserving everything else → resubmit the corrected chunk in full → repeat until the user has no further remarks → write to `<file>` in place → advance. No cap on correction rounds per chunk. Writing a chunk touches only that chunk's text — every other chunk in `<file>` remains byte-identical to what was on disk before the write, not merely "close enough".
- **Ping-pong invariant**: every turn ends in exactly one of two states — the corrected chunk resubmitted in full for the user to react to again, or an explicit advance to the next chunk (or end-of-pass summary). Never end a turn on a correction without resubmitting it, and never leave a correction pending without either resubmitting or advancing.
- **Resumable**: mark progress with an HTML comment `<!-- TUNE: last-chunk=<id> -->` at the point reached if the user pauses; strip it once the pass reaches the end. `--from <chunk-id>` resumes from a specific chunk explicitly. If no `--from` is given but a marker is already present in `<file>`, `tune` must ask the user whether to resume from the marker or restart from `chunk-01` — it never silently picks either.
- End of pass: summarize, per chunk, how many correction rounds it took (0 = accepted as-is) — a factual tally, not a quality verdict.

## External data

- `${CLAUDE_PLUGIN_ROOT}/references/brief-model.md` — only consulted when `--brief <brief>` is passed, for background context.
- `<file>` (positional) — the document to walk through; any `.md` file, project or standalone.
