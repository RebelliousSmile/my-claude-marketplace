# Verify-prod

Fires the pre-crafted prompt for **verifying in production, through the browser, that a closed list of issues is resolved**, under a bounded goal whose exits are written in advance.

The alias verifies; it never deploys. Deployment belongs to `overcode:deploy` and its own authorization.

## Context required

- **Issues**: a closed list of issue numbers (`#229 #231 #235`). Nothing outside the list is verified. If absent, ask before firing: *"Which issues should be verified in production?"*
- **Base URL** of the production site: `--base-url <url>`, else read from the project recipes (below), else ask.
- **Sessions**: the accounts needed (candidate, recruiter, admin...) are **opened by hand in the browser before firing**. The alias never reads `.env`, `.env.*` or any credentials file, and never types a password: a host permission rule usually denies those files, and promising them in the goal produces an unreachable condition.
- Optional `--allow-write <#issue>` (repeatable): pre-approves the write-plan lines of these issues, once each, with the original value restored afterwards. Without it, the write plan is approved in the single question of Step 0b.
- Optional `--recipes <path>`: the project recipes file.

## Project recipes

Project knowledge (domain, routes, selectors, test accounts by role, known traps) stays in the target repository, never in this alias. Resolve the recipes file in this order and say which one was used:

1. `--recipes <path>`;
2. `.claude/verify-prod.md`;
3. the `## Vérification en production` (or `## Production verification`) section of `aidd_docs/memory/testing.md`;
4. none: build each recipe from the issue body (`gh issue view <n>`) and the commits that reference it, and mark the recipe `déduite` in the report.

A recipe entry, per issue or per kind of issue, states: direct route, how to reach the state to observe, the observable that proves the fix, whether proving it needs a write, and which **test data** that write touches.

## Test data registry

The run must never stop mid-way to ask whether an account or a record is safe to touch. Everything a write may touch is gathered and authorized **before** the browser opens, from a registry the project keeps out of version control:

- The recipes file names the registry (`## Données de test` / `## Test data`): its path, and for each role or record the **key** to read (`recruteur.uid`, `candidat.profileId`, `recherche.vide`...). Conventional path: `.claude/verify-prod.local.json`, git-ignored.
- The registry holds **identifiers only** (UIDs, document ids, the role of each account, which records are disposable). Never a password, an e-mail or a token: those stay in the project's credentials file, which the alias never reads. A registry value is used to compare and to navigate, never printed: the report names the role and the key (`candidat de test — candidat.profileId`), not the value.
- **Disposable accounts** are the preferred write target when the project allows it: the registry may hold one alias base address (`jetable.baseEmail`, e.g. a `+tag` mailbox alias) — the single e-mail it may carry, never printed. The run signs up a dedicated account for the test, uses it, and deletes it through the product's own account-deletion path at the end; creation and deletion are one line of the write plan, and the report confirms the account no longer exists. A disposable account left behind by an interrupted run is named in the report. When a recipe needs the account in a given state (profile completion tier, required fields), the recipes provide **seeds**: the run signs up through the UI, then applies the seed in one guarded write that refuses any account not carrying the disposable alias, and waits for the server-side recomputation before moving on. The tier each issue needs is read in Step 0b, so the seeding is part of the approved plan, not a mid-run discovery.
- The registry may rank its accounts (e.g. the owner's own accounts first, a fallback pool second). The write plan uses the highest-ranked account that fits each line, and states why when it falls back.
- Anything absent from the registry is **not safe**, whatever its name or look. A write whose target is not in the registry becomes `écriture non autorisée`.

## Prompt

Execute the following workflow verbatim.

### Step 0 — Preflight (no browser yet)

1. Resolve the issue list, base URL and recipes file. Print them.
2. For each issue, read its recipe and classify it **before** touching the browser:
   - `lecture` — provable by navigation and reading only;
   - `écriture autorisée` — needs a write and is listed in `--allow-write`;
   - `écriture non autorisée` — needs a write and is not listed: it will be proven as far as reading allows (served code, rendered attributes) and reported `non prouvé — écriture non autorisée`;
   - `inatteignable` — needs something absent from this machine (Safari, a Mac, a phone, a role with no open session): reported `sauté — <motif>` without any attempt.
3. Deployment state: if the recipes say how to check what is live (hosting release time, function versions), check it read-only and state it. Otherwise write `état de déploiement non vérifié`. Never deploy.

### Step 0b — Inventory of safe data (one pass, before the browser)

1. Load the registry named by the recipes. If the file or a key a recipe needs is missing, list **every** missing key at once; do not ask key by key.
2. Build the **write plan**: one line per write the recipes call for — issue, action, account that acts (registry key), record or account it touches (registry key), how the original state is restored. A line whose acting account or target has no registry key is moved to `écriture non autorisée` now, not discovered later.
3. Open the browser once and check each role's session against the registry: read the signed-in account's identifier from the page (auth state, profile link) and compare it **silently** to the registry key. Print only `<rôle> : compte de test ✓` or `<rôle> : session absente / compte hors registre ✗`. A role that fails turns its issues into `sauté — session <rôle> absente` or `non prouvé — compte hors registre`.
4. Ask **one** question, the only one of the run, carrying: the missing keys (if any), the sessions to open (if any), and the write plan to approve line by line (multi-select, plus "aucune écriture"). Without an answer, nothing is written.
5. The approved lines are the run's `--allow-write`. Echo them verbatim in the transcript: the explicit approval in the conversation is also what a permission classifier reads when it judges each write.

From here on the run asks nothing. A situation the inventory did not foresee (a target outside the registry, a refusal, a missing element) is recorded with its motif and the run moves on to the next issue.

### Step 1 — Fire the bounded goal

On a host with a goal command (`/goal` on Claude Code), fire it with exactly this condition, the placeholders filled in:

```
Chaque issue de la liste fermée [<#a> <#b> …] porte un statut final parmi : vérifié, constaté, non prouvé (avec motif), sauté (avec motif). Sont des motifs valables et définitifs : un refus de permission ou du classifieur, une consigne de l'utilisateur, un matériel ou un compte absent, une cible hors du registre de test, deux essais échoués. Aucune écriture en production hors du plan approuvé [<lignes approuvées ou "aucune">], et seulement sur des comptes et données du registre de test. Aucune nouvelle question à l'utilisateur après l'inventaire. Le nettoyage du navigateur est fait et le rapport final est rendu. Ne rien vérifier hors de la liste.
```

The exits are part of the condition on purpose: a goal that only says "verify the resolution" treats a permission refusal as unfinished work and relaunches the session on a loop it cannot win.

On a host without a goal command, run Steps 2 to 4 inline with the same condition as the stop criterion.

### Step 2 — Verify, issue by issue

For each issue in list order:

1. Open a **new tab** on the recipe's direct route; never reuse a tab from another session.
2. Batch the navigation, clicks and reads of one attempt in a single browser call when the host offers it (`browser_batch` on Claude in Chrome). Wait on a condition (element present, text visible), never on a fixed delay.
3. **At most two attempts.** After the second failure, the status is `non prouvé — deux essais échoués`, with what was observed.
4. Writes: only for the approved lines of the write plan, on the registry targets they name. Read and record the original value first, perform the write once, observe, then restore the original value and confirm the restore. Any other write is not attempted.
5. A permission or classifier refusal is **final** for that action: do not retry it, do not reach the same effect another way (script injection, direct API call, token pulled from the page). Prove what reading still allows, then record `non prouvé — refus <nom du refus>`.
6. Never copy a secret, token, password or real personal data (name, e-mail, phone) into the conversation, a file or the report: name the account by its role.
7. Status vocabulary:
   - `vérifié` — the fix was exercised end to end and the observable matches;
   - `constaté` — the expected behaviour is visible, without exercising the full path;
   - `non prouvé` — with motif;
   - `sauté` — with motif, decided in Step 0.

### Step 3 — Cleanup

- Remove every helper injected into a page (globals, overridden `window.open`, patched functions).
- Close every tab this run opened; leave the user's own tabs untouched.
- Restore any value written under `--allow-write` that was not restored yet, and say so.

### Step 4 — Report

```
Vérification en production — <base URL> — <date>
Recettes : <fichier ou "déduites">
Déploiement : <état ou "non vérifié">

| Issue | Statut | Preuve ou motif |
|---|---|---|
| #a | vérifié | … |
| #b | non prouvé | refus du classifieur à l'enregistrement ; logique servie vérifiée par lecture |
| #c | sauté | pas de Safari |

Écritures en production : <liste avec valeur restaurée, ou "aucune">
Nettoyage : <helpers retirés, onglets fermés>
```

Then propose, without writing it, the CHANGELOG wording that keeps `vérifié` and `non prouvé` apart. Commit nothing, close no issue: both stay the user's decision.
