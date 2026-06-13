---
type: technical-doc
language: en
---

# Brief — Payments Service Reference

Self-contained brief for the API reference of the `payments` service.

## Concept
Document the public surface of the payments service: authentication, the
charge lifecycle, and webhook delivery. Audience: integrating backend engineers.

## Consolidated inputs (inline — writing never reads outside this project)
- **Auth**: bearer token, scoped keys (`charge:write`, `charge:read`).
- **Charge lifecycle**: `created → authorized → captured → settled`, with
  `failed`/`refunded` terminal states.
- **Webhooks**: signed with HMAC-SHA256, retried with exponential backoff.

## Constraints
- Long document → table of contents required.
- Code samples in TypeScript.
