# 1. Authentication & scoped keys

The payments API authenticates with a bearer token. Tokens are scoped; a token
presenting `charge:write` may create charges, `charge:read` may only read them.

| Scope          | Allows                          |
|----------------|---------------------------------|
| `charge:write` | create, capture, refund charges |
| `charge:read`  | read charges and webhooks       |

Rotate keys without downtime by issuing a second key, migrating callers, then
revoking the first.
