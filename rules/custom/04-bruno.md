---
description: Bruno API client rules for .bru collection files — scripts, environment variables, and Apache integration. Apply when editing collection.bru, environment files, or any .bru request file.
paths:
  - "bruno/**/*.bru"
  - "bruno/collection.bru"
  - "bruno/environments/*.bru"
---

# Bruno rules

## Scripts

- Use `axios` not `fetch` — `fetch` is CLI-only, unavailable in GUI sandbox
- Catch errors silently only if 401 fallback is acceptable

## Environments

- Use `vars {}` for dev credentials (phone, code) — `vars:secret []` values are not pre-populated from `.secret.bru` in the GUI
- Reserve `vars:secret []` for tokens written at runtime (e.g. `token`)

## Apache

- Add `SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1` in `.htaccess` — Apache strips the `Authorization` header before PHP receives it

## Tests

- Every route must have a `tests {}` block
- Always assert `res.body` has property `success` (response envelope)
- Protected routes: `expect([200, 401]).to.include(res.status)` — gate shape assertions with `if (res.status === 200)`
- Public/pre-authenticated routes: `expect(res.status).to.equal(200)`
- Create routes: `expect([201, 409]).to.include(res.status)` — gate `data.id` with `if (res.status === 201)`
- Never assert shape unconditionally on routes that can return 401
