# Action 03 — endtask

Fires the pre-crafted prompt for the **commit → endplan → changelog → push tags → close issue** workflow.

## Context required

- All changes must be implemented and reviewed. The work may be on a dedicated plan branch or directly on the target branch (e.g. `develop`).
- If no issue number is visible in context, ask before firing: *"Which issue number should I close?"*

## Prompt

Execute the following workflow verbatim:

1. **Commit** all staged and unstaged changes with a conventional commit message that summarises the work done. Do not push yet.

2. **End the plan** — run the `endplan` alias (action 04): archives the plan file, captures learnings, and — if on a plan branch — merges it into the target branch, pushes, and deletes the local branch; or — if already on the target branch — just pushes.

3. **Generate the changelog** — invoke `/aidd-overlay:changelog`: updates `CHANGELOG.md` from git history, commits the file, and creates an annotated tag for the new version.

4. **Push tags** — run `git push --follow-tags` to publish the tag created in the previous step.

5. **Close the issue** — using the tracker (GitHub or GitLab), close the issue associated with this task. Add a closing comment referencing the tag or commit if possible.

6. Report:
   - Commit SHA and message
   - Plan file archived
   - Tag created and pushed
   - Issue closed (number + URL)
