# Action 01 — install

Write third-party SaaS consumption rule files to the current project's `.claude/rules/`.

## Process

Read each reference file listed below and write its content verbatim to the target path in the current project. Create parent directories as needed.

### Coding rules

| Reference file | Target path |
|---|---|
| `references/03-firebase-resources.md` | `.claude/rules/03-frameworks-and-libraries/03-firebase-resources.md` |
| `references/04-firebase-auth-listeners.md` | `.claude/rules/04-tooling/04-firebase-auth-listeners.md` |
| `references/4-firebase-hosting-trailing-slash.md` | `.claude/rules/04-tooling/4-firebase-hosting-trailing-slash.md` |
| `references/05-playwright-firebase-auth.md` | `.claude/rules/05-testing/05-playwright-firebase-auth.md` |
| `references/09-klaviyo.md` | `.claude/rules/03-frameworks-and-libraries/09-klaviyo.md` |
| `references/10-gtm-consent-meta.md` | `.claude/rules/03-frameworks-and-libraries/10-gtm-consent-meta.md` |
| `references/11-clarity.md` | `.claude/rules/03-frameworks-and-libraries/11-clarity.md` |
| `references/12-pagespeed-insights.md` | `.claude/rules/07-quality/12-pagespeed-insights.md` |

### Data pivots (consumed by `data-optimize`)

| Reference file | Target path |
|---|---|
| `references/08-data-pivots-firebase.md` | `.claude/rules/07-quality/data-pivots-firebase.md` |
| `references/08-data-pivots-supabase.md` | `.claude/rules/07-quality/data-pivots-supabase.md` |
| `references/08-data-pivots-dynamodb.md` | `.claude/rules/07-quality/data-pivots-dynamodb.md` |
| `references/08-data-pivots-hasura.md` | `.claude/rules/07-quality/data-pivots-hasura.md` |

## Output

After all files are written, confirm:

```
✅ sc-tiers rules installed — 12 files written to .claude/rules/
  Coding rules (8):
    - .claude/rules/03-frameworks-and-libraries/03-firebase-resources.md
    - .claude/rules/04-tooling/04-firebase-auth-listeners.md
    - .claude/rules/04-tooling/4-firebase-hosting-trailing-slash.md
    - .claude/rules/05-testing/05-playwright-firebase-auth.md
    - .claude/rules/03-frameworks-and-libraries/09-klaviyo.md
    - .claude/rules/03-frameworks-and-libraries/10-gtm-consent-meta.md
    - .claude/rules/03-frameworks-and-libraries/11-clarity.md
    - .claude/rules/07-quality/12-pagespeed-insights.md
  Data pivots (4):
    - .claude/rules/07-quality/data-pivots-firebase.md
    - .claude/rules/07-quality/data-pivots-supabase.md
    - .claude/rules/07-quality/data-pivots-dynamodb.md
    - .claude/rules/07-quality/data-pivots-hasura.md
```
