# API Integration Reference

## Authentication Patterns

### Bearer Token

```
Authorization: Bearer <token>
```

**Use when:**
- OAuth2 access tokens
- JWT tokens
- API keys sent as bearer

### API Key Header

```
X-API-Key: <key>
# or
Api-Key: <key>
```

**Use when:**
- Simple API key authentication
- No token refresh needed

### OAuth2 Client Credentials

```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id=<id>&client_secret=<secret>
```

**Use when:**
- Server-to-server authentication
- Token refresh required
- Scoped permissions

### Basic Auth

```
Authorization: Basic <base64(username:password)>
```

**Use when:**
- Legacy APIs
- Simple username/password auth

### Custom Headers

Some APIs use non-standard headers:
```
token: <value>           # e.g., Beds24
X-Custom-Auth: <value>
```

## Resilience Patterns

### Cache-First Pattern

```
1. Check cache for valid data
2. If cache hit AND not expired → return cached
3. If cache miss OR expired → call API
4. If API success → update cache, return fresh
5. If API failure → return stale cache if available
6. If no cache → return error
```

**When to use:** GET operations, read-heavy endpoints

### API-First Pattern

```
1. Call API directly
2. If success → return response
3. If failure → return error (no cache)
```

**When to use:** POST/PUT/DELETE, mutations, real-time data

### Retry with Exponential Backoff

```
attempt 1: wait 0s
attempt 2: wait 1s
attempt 3: wait 2s
attempt 4: wait 4s
(max 3-5 attempts)
```

### Circuit Breaker

| State | Behavior |
|-------|----------|
| Closed | Normal operation |
| Open | Fail fast, don't call API |
| Half-Open | Allow test request |

**Thresholds:**
- Failure threshold: 5 consecutive failures → Open
- Recovery timeout: 30s → Half-Open
- Success threshold: 2 successes → Closed

## Response Format (Recommended)

```json
{
  "status": "success|error|degraded",
  "source": "api|cache",
  "data": {},
  "error": null,
  "fresh": true
}
```

| Status | Meaning |
|--------|---------|
| `success` | API call succeeded |
| `error` | API call failed, no cache |
| `degraded` | API failed, returning stale cache |

## Common HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Cache response |
| 201 | Created | Return, don't cache |
| 204 | No Content | Return empty |
| 400 | Bad Request | Don't retry |
| 401 | Unauthorized | Refresh token, retry |
| 403 | Forbidden | Don't retry |
| 404 | Not Found | Don't cache, don't retry |
| 429 | Rate Limited | Backoff, retry |
| 500 | Server Error | Retry with backoff |
| 502/503 | Gateway Error | Retry with backoff |

## Rate Limiting

### Detection

```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1609459200
```

### Handling

1. Check `Retry-After` header
2. Exponential backoff if not present
3. Queue requests if persistent

### Suggested TTL by Data Type

| Data Type | TTL |
|-----------|-----|
| Static config | 24h |
| User profile | 1h |
| Listings/inventory | 15-30min |
| Real-time status | 1-5min |
| Prices/availability | No cache or 1min |
