# Challenge plan until 0 deal breakers

- After `aidd:03:plan` completes, always run `aidd:02:challenge`
- If deal breakers found: fix them silently, re-run `aidd:02:challenge` immediately — no user confirmation needed between iterations
- Repeat until challenge returns 0 deal breakers
- Do not proceed to implementation with any deal breaker remaining
- Chain with `aidd:04:implement` when ready
