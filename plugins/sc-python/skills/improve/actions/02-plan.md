# Action 02 — plan

Produce a prioritized improvement plan with concrete before/after examples for each finding from `01-analyze`.

## Inputs

- Findings from `01-analyze` (required)

## Process

### Step 1 — Group by effort/impact

| Priority | Criteria | Action |
|---|---|---|
| P0 — Fix now | HIGH severity + easy fix (< 30 min), or HIGH async bug | Apply immediately |
| P1 — Next sprint | HIGH + significant effort, or MEDIUM + easy | Plan as a discrete task |
| P2 — Backlog | MEDIUM + effort, LOW severity | Document and defer |

### Step 2 — Write the plan

For each finding:
1. **Title** — short action name
2. **Why** — the risk or pain if left as-is
3. **Before** — current code excerpt (actual file + line)
4. **After** — improved version
5. **Effort** — S (< 1h) · M (half-day) · L (> 1 day)

## Output

```
## sc-python Improvement Plan

### P0 — Fix now

#### 1. Fix mutable default argument in list_orders() — S
**Why:** Mutable default is shared across all calls — state leaks between requests.

**Before** (`orders/views.py:18`):
```python
def list_orders(filters={}):
    if 'status' in filters:
        ...
```

**After:**
```python
def list_orders(filters: dict | None = None) -> list[Order]:
    if filters is None:
        filters = {}
    ...
```

#### 2. Replace time.sleep() with asyncio.sleep() — S
**Why:** `time.sleep()` in an async function blocks the entire event loop — no other coroutines run.

**Before** (`notifications/tasks.py:45`):
```python
async def retry_notification(notification_id: int) -> None:
    time.sleep(5)  # blocks event loop
    await send_notification(notification_id)
```

**After:**
```python
async def retry_notification(notification_id: int) -> None:
    await asyncio.sleep(5)
    await send_notification(notification_id)
```

#### 3. Fix blocking requests.get() in async view — S
**Why:** Synchronous HTTP call in an async handler blocks the event loop for the full request duration.

**Before** (`orders/views.py:67`):
```python
async def get_shipping_status(order_id: int):
    response = requests.get(f"{SHIPPING_API}/status/{order_id}")  # blocking
    return response.json()
```

**After:**
```python
import httpx

async def get_shipping_status(order_id: int) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{SHIPPING_API}/status/{order_id}")
    return response.json()
```

#### 4. Fix N+1 in orders list view — S
**Why:** 1 + N DB queries per request where N = number of orders on the page.

**Before** (`orders/views.py:34`):
```python
orders = Order.objects.all()
for order in orders:
    print(order.customer.name)  # N queries
```

**After:**
```python
orders = Order.objects.select_related('customer').all()
for order in orders:
    print(order.customer.name)  # 0 extra queries
```

---

### P1 — Next sprint

#### 5. Extract create() business logic into OrderService — M
**Why:** 73-line view function mixes validation, DB writes, email, and HTTP response. Untestable.

Move domain logic to `OrderService.create(data: dict) -> Order`. View becomes 10 lines.

#### 6. Add return type annotations to 11 public functions — S
**Why:** No type information slows down IDE navigation and makes refactoring unsafe.

#### 7. Replace LBYL patterns with .get() or try/except — S
**Why:** Verbose and error-prone in concurrent scenarios (TOCTOU).

**Before:**
```python
if 'status' in order_data:
    status = order_data['status']
```
**After:**
```python
status = order_data.get('status')
```

---

### P2 — Backlog

#### 8. Refactor list-building loops to comprehensions — S
**Why:** Style — comprehensions are faster and more idiomatic.

#### 9. Update Optional[X] → X|None (Python 3.10+) — S
**Why:** Modernize type syntax. Low risk, pure annotation change.

---

### Summary

| # | Finding | Priority | Effort |
|---|---------|---------|--------|
| 1 | Mutable default argument | P0 | S |
| 2 | time.sleep in async | P0 | S |
| 3 | Blocking requests in async | P0 | S |
| 4 | N+1 select_related | P0 | S |
| 5 | Extract OrderService | P1 | M |
| 6 | Return type annotations | P1 | S |
| 7 | LBYL → dict.get() | P1 | S |
| 8 | Comprehension refactors | P2 | S |
| 9 | Optional → X\|None | P2 | S |
```
