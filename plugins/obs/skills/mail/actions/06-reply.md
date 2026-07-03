# 06 - Reply

Compose an **assisted reply draft** (Markdown) to an email or thread already stored
in the vault, in the skill's email format, placed in the `_drafts/` working area.

This is the **information → communication** direction of `mail`: the other five
actions reduce inbound mail to information; `reply` turns that information back into
an outbound message — **prepared, never sent**.

## Inputs

- `source` — path (absolute or relative to `Thunderbird/`) of the source email `.md`
  to answer. A merged thread file (`..._thread.md`) is a valid source.
- `intent` — the user's reply intention, in their own words (what to say, tone,
  decisions, questions to raise). May be terse; `reply` fills the rest by
  best-judgment from the thread.

Both are supplied by the invocation `/obs:mail reply <source> [intention]`. If
`intent` is absent, ask the user for it **before** composing — never invent the
substance of a reply.

## Outputs

- `draft_path` — the Markdown draft written under `Thunderbird/_drafts/`.
- No mutation of `source`. No send.

## Process

### 1. Resolve and read the source (sub-agent)

**Delegate to a sub-agent (`model: sonnet`)** with the mission to:
- Read the frontmatter of `source` (`from`, `to`, `date`, `subject`, `subject_hash`).
- Read the body / thread list to gather the context needed to answer.
- Return a **compact brief**: the normalized subject, the original sender address,
  the last message's gist, and any open points to address — **not** the full body.

This preserves the § Sub-agent principle: the raw thread content does not surface
in the main chat; only the brief + the draft the user is about to author do.

### 2. Compose the reply body (assisted, not a skeleton)

From the sub-agent brief **and** the user's `intent`, write the actual reply body
in Markdown: greeting, the substance mapped to the intent, answers to the thread's
open points, a closing. This is **assisted composition** — a usable first draft, not
a frontmatter-only scaffold. Where the intent is silent on an open question, apply
best-judgment defaults and flag them inline as `> [à confirmer] …` so the user sees
what was assumed.

### 3. Build the draft in email format

Frontmatter reuses the skill's email format, oriented outbound:

```yaml
from: <vault owner — the `to` of the source>
to: <original sender — the `from` of the source>
date: <today, ISO 8601>
subject: "Re: <normalized subject>"   # strip existing Re:/Fwd:/RE:/FW: then prefix once
in_reply_to: <source subject_hash, if present>
draft: true
```

- `subject`: normalize the source subject (strip `Re:`/`Fwd:`/`RE:`/`FW:`, case
  ignored) then prefix a single `Re: `. Never stack `Re: Re:`.
- Body: the Markdown composed in step 2.
- **No `processed: true`** — a draft is not a triaged inbound file.

### 4. Validate before writing

Present the **full proposed draft** (frontmatter + body) in the chat and ask:

```
Brouillon de réponse prêt — l'écrire dans _drafts/ ? (oui / modifier / annuler)
```

- `oui` → write the file (step 5).
- `modifier` → take the corrections, recompose, re-present.
- `annuler` → write nothing, end.

**Nothing is written to disk before an explicit `oui`.**

### 5. Write the draft

- Ensure `C:/Users/fxgui/Public/Notes/Thunderbird/_drafts/` exists (create if absent).
- File name (reply convention, derived from the inbound naming
  `email_YYYY-MM-DD_<exp>_<sujet>_to_<dest>.md`, with `exp = moi`,
  `sujet = Re-<sujet normalisé>`, `dest = original sender`):

  ```
  email_<date>_moi_Re-<sujet-normalisé-slug>_to_<expéditeur-orig-slug>.md
  ```

  On a name collision, append `_N` (as the inbound convention does).
- Write frontmatter + body. Do **not** touch `source`.
- Confirm in chat: the `draft_path` and a one-line reminder that **sending is a
  later, out-of-scope step** (Thunderbird re-import or an outbound bridge — not
  performed here).

## Invariants

- **Never send.** `reply` only *prepares* a draft. No SMTP, no MCP send, no
  Thunderbird injection. Sending is explicitly out of scope.
- **Never mutate the source.** The source email/thread is read-only throughout; it
  is not archived, moved, marked `processed`, or edited.
- **Validation before write.** The draft is shown and confirmed (`oui`) before any
  file is created — same gate discipline as `03-propose`.
- **Confidentiality.** The source thread is read via a sub-agent; only the compact
  brief and the user-authored draft surface in the main chat.
- **No triage side-effects.** The draft lives in the `_drafts/` working area, which
  `01-scan` excludes from the triage scope (like `.archive/`); a draft is never
  itself analyzed, classified, or deleted by a later triage session.

## Test

- `draft_path` is under `Thunderbird/_drafts/` and matches
  `email_<date>_moi_Re-<sujet>_to_<exp-orig>.md`.
- Draft frontmatter: `from` = vault owner, `to` = original sender,
  `subject` starts with a single `Re: `, `draft: true`, no `processed: true`.
- Draft body is composed prose reflecting the user's `intent` + thread context —
  not an empty skeleton.
- The `source` file is **byte-identical** after the action (no move, no edit, no
  `processed` tag).
- No file is written before the user answered `oui`.
- No send / injection of any kind occurs.
- The raw source body did not appear in the main chat — only the brief and the draft.
