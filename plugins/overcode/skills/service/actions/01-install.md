# Install

Install third-party SaaS consumption guidance using the active host's native project-instruction surface.

## Host routing

- **Codex:** copy references to `.agents/rules/` using the Codex targets below, then create or update one bounded `## Overcode services` section in the nearest applicable `AGENTS.md`. That section must tell Codex which reference to read for each service; do not paste every reference body into `AGENTS.md`.
- **Claude Code:** copy references verbatim to the `.claude/rules/` targets below.
- **Both hosts:** write both surfaces and keep their service mapping equivalent.

### Codex targets

| Reference file | Target path |
|---|---|
| `references/03-firebase-resources.md` | `.agents/rules/03-frameworks-and-libraries/03-firebase-resources.md` |
| `references/04-firebase-auth-listeners.md` | `.agents/rules/04-tooling/04-firebase-auth-listeners.md` |
| `references/4-firebase-hosting-trailing-slash.md` | `.agents/rules/04-tooling/4-firebase-hosting-trailing-slash.md` |
| `references/05-playwright-firebase-auth.md` | `.agents/rules/05-testing/05-playwright-firebase-auth.md` |
| `references/09-klaviyo.md` | `.agents/rules/03-frameworks-and-libraries/09-klaviyo.md` |
| `references/10-gtm-consent-meta.md` | `.agents/rules/03-frameworks-and-libraries/10-gtm-consent-meta.md` |
| `references/11-clarity.md` | `.agents/rules/03-frameworks-and-libraries/11-clarity.md` |
| `references/12-pagespeed-insights.md` | `.agents/rules/07-quality/12-pagespeed-insights.md` |
| `references/08-data-pivots-firebase.md` | `.agents/rules/07-quality/data-pivots-firebase.md` |

The `AGENTS.md` index must map Firebase, Playwright/Firebase auth, Klaviyo, GTM/Meta, Clarity, and PageSpeed/Lighthouse to these files and say to read the relevant file before implementing or reviewing that integration.

### Claude Code targets

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
| `references/08-data-pivots-firebase.md` | `.claude/rules/07-quality/data-pivots-firebase.md` |

Only stacks with a source above are covered. If a source is absent, report it and do not invent content or a target.

## Write rules

1. Resolve each source relative to the loaded setup skill.
2. Create parent directories as needed.
3. If a target is absent, write it; if identical, skip it; if different, update it atomically.
4. On Codex, update only the bounded `## Overcode services` section of `AGENTS.md`; preserve all unrelated user content.
5. Report only paths actually processed. Never claim installation when nothing was written.

## Output

Report the selected host surface, counts by coding rules and data pivots, and one status line per processed target. Report missing references explicitly. If every reference is missing, return `❌ overcode service rules — nothing written`.
