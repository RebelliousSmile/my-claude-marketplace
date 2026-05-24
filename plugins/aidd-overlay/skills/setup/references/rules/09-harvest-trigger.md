# Always-loaded rule — meta-orchestration of /harvest skill (no `paths:` by design)

# Harvest — proactive trigger

Suggest `/harvest` (without executing it) when one of these conditions is true:

- More than 10 `.processed.md` files in `aidd_docs/tasks/`
- The user mentions that issues or the tasks directory are messy
- Session resumed after a long absence and completed plans are visible

Never run `/harvest` automatically — always suggest and wait for agreement.
