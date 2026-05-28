# Action 02 — plan

Produce a prioritized improvement plan with concrete before/after examples for each finding from `01-analyze`.

## Inputs

- Findings from `01-analyze` (required)

## Process

### Step 1 — Group by effort/impact

| Priority | Criteria | Action |
|---|---|---|
| P0 — Fix now | HIGH severity + easy fix (< 30 min) | Apply immediately or flag for next sprint |
| P1 — Next sprint | HIGH severity + significant effort, or MEDIUM + easy | Plan as a discrete task |
| P2 — Backlog | MEDIUM + effort, LOW severity | Document and defer |

### Step 2 — Write the plan

For each finding, produce:
1. **Title** — short action name
2. **Why** — the risk or pain if left as-is
3. **Before** — current code excerpt (actual file + line)
4. **After** — improved version
5. **Effort** — S (< 1h) · M (half-day) · L (> 1 day)

### Step 3 — Output

```
## sc-php Improvement Plan

### P0 — Fix now

#### 1. Fix N+1 query in OrderController::index() — S
**Why:** Each page load triggers 1 + N DB queries (N = number of orders). Degrades linearly.

**Before** (`app/Http/Controllers/OrderController.php:34`):
```php
$orders = Order::all();
foreach ($orders as $order) {
    echo $order->customer->name; // N additional queries
}
```

**After:**
```php
$orders = Order::with('customer')->get();
foreach ($orders as $order) {
    echo $order->customer->name; // 0 additional queries
}
```

---

### P1 — Next sprint

#### 2. Extract OrderController::store() into OrderService — M
**Why:** 87-line method mixes HTTP, domain logic, and side effects. Untestable in isolation.

**Before** (`app/Http/Controllers/OrderController.php:45`):
```php
public function store(Request $request)
{
    $validated = $request->validate([...]);
    $order = Order::create($validated);
    $order->items()->createMany($request->items);
    // ... 60 more lines: stock check, payment, email, response
}
```

**After:**
```php
// OrderController — thin
public function store(StoreOrderRequest $request, OrderService $service): JsonResponse
{
    $order = $service->create($request->validated());
    return new OrderResource($order);
}

// OrderService — testable
class OrderService
{
    public function create(array $data): Order
    {
        // domain logic here, no HTTP concerns
    }
}
```

#### 3. Replace switch → enum + strategy for StatusService::getLabel() — S
**Why:** Adding a new status requires editing `StatusService`. OCP violation.

**Before** (`app/Services/StatusService.php:23`):
```php
public function getLabel(string $status): string
{
    return match ($status) {
        'active'   => 'Active',
        'pending'  => 'Pending',
        'archived' => 'Archived',
        default    => throw new \InvalidArgumentException("Unknown: $status"),
    };
}
```

**After:**
```php
enum OrderStatus: string
{
    case Active   = 'active';
    case Pending  = 'pending';
    case Archived = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::Active   => 'Active',
            self::Pending  => 'Pending',
            self::Archived => 'Archived',
        };
    }
}
// Usage: OrderStatus::from($status)->label()
```

#### 4. Add FormRequest classes for 4 controller methods — M
**Why:** Inline validation in controllers is hard to test and duplicates rules.

Create: `StoreOrderRequest`, `UpdateOrderRequest`, `StoreProductRequest`, `UpdateProductRequest`.
Move `$request->validate([...])` blocks to `rules()` method of each FormRequest.

---

### P2 — Backlog

#### 5. Introduce Repository layer — L
**Why:** Direct Eloquent calls in controllers couple HTTP layer to DB; hard to mock in tests.

Introduce `OrderRepositoryInterface` + `EloquentOrderRepository`.
Bind in `AppServiceProvider`. Controllers receive `OrderRepositoryInterface` via DI.

#### 6. Value objects for price and currency — M
**Why:** Primitive obsession — `float $price` with no currency leads to subtle calculation bugs.

Introduce `Money` value object: `new Money(100, 'EUR')`.

---

### Summary

| # | Finding | Priority | Effort |
|---|---------|---------|--------|
| 1 | N+1 in OrderController::index | P0 | S |
| 2 | Extract OrderService | P1 | M |
| 3 | Enum for OrderStatus | P1 | S |
| 4 | FormRequest classes × 4 | P1 | M |
| 5 | Repository layer | P2 | L |
| 6 | Money value object | P2 | M |
```
