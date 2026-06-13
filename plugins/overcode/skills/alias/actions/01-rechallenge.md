# Action 01 — rechallenge

Fires the pre-crafted prompt for the **plan → challenge loop** workflow.

## Context required

A task description must be available in conversation context or as a file reference.
If absent, ask before firing: *"What feature or task should I plan?"*

## Prompt

Execute the following workflow verbatim:

1. Run `/aidd-dev:01-plan` on the current task or feature. Write the plan to `aidd_docs/tasks/` following the standard naming convention.

1b. **Verify the plan file is on disk** — immediately after the Write tool returns, run `ls <plan_path>` in a Bash command. If the file is not found, write it again with the Write tool and re-run `ls` until confirmed. Do not proceed until `ls` returns the file path without error.

2. Once the plan file is confirmed on disk, immediately invoke `/aidd-refine:02-challenge` on it.

3. After each challenge run, apply the following loop:
   - Fix every deal-breaker found — directly in the plan file.
   - Fix every suggestion found — directly in the plan file.
   - No user confirmation needed between iterations.
   - Re-run `/aidd-refine:02-challenge` on the updated plan.
   - Repeat from this step until the challenge returns **0 deal-breakers and 0 suggestions**.

5. Do not proceed to implementation until this threshold is reached.

6. Report:
   - Plan file path
   - Number of challenge iterations run
   - Final challenge result (0 deal-breakers, 0 suggestions confirmed)
