# Action 02 — practice

Generate a targeted PHP coding exercise modelled on the current project's patterns, then evaluate the user's solution.

## Inputs

- `topic` (required) — concept to practice (from `01-explain` or user-specified)
- `difficulty` (optional) — `beginner` | `intermediate` | `advanced` (default: infer from project complexity)

## Process

### Step 1 — Choose exercise type

| Difficulty | Exercise type |
|---|---|
| Beginner | Fill in a blank / fix a bug in a provided snippet |
| Intermediate | Implement a small class or method from a spec |
| Advanced | Refactor an existing project pattern to use the concept |

### Step 2 — Generate the exercise

1. Use the project's namespace conventions, PSR style, and detected framework
2. Base the exercise on a realistic scenario from the project domain (inferred from class names)
3. Provide a clear spec:
   - What to implement
   - What tests or assertions it must pass
   - One hint (marked as optional to avoid spoilers)

### Step 3 — Wait for user response

After presenting the exercise, wait. Do not provide the solution until the user has attempted it or explicitly asks.

### Step 4 — Evaluate and explain

When the user provides their solution:
1. Check correctness against the spec
2. Note any PHP-specific improvements (type hints, readonly, match, etc.)
3. Show the reference solution side-by-side
4. Link back to the project example from `01-explain`

## Output example (topic: traits, difficulty: intermediate)

```
## Practice — PHP Traits

**Scenario:** The project has `Order` and `Product` entities that both need
soft-delete capability (a `deletedAt` field set on deletion, filtered in queries).
Currently this logic is duplicated.

**Exercise:** Extract the soft-delete behaviour into a `SoftDeletable` trait.

Requirements:
- Method `softDelete(): void` — sets `$this->deletedAt` to now
- Method `isDeleted(): bool` — returns true if `$this->deletedAt` is not null
- Method `restore(): void` — sets `$this->deletedAt` back to null
- The trait must not define the `$deletedAt` property (it is the using class's responsibility)
- Use strict types

```php
<?php
declare(strict_types=1);

namespace App\Traits;

// Your implementation here
trait SoftDeletable
{
    // ...
}
```

**Hint (optional):** `\DateTimeImmutable|null` is the right type for `$deletedAt`.

Take your time — share your solution when ready.
```

## Evaluation output example

```
## Evaluation

✅ Correctness: all 3 methods implemented correctly
✅ Type hints: return types declared

Suggestions:
  - `softDelete()` could return `static` to support method chaining
  - Add a `@property \DateTimeImmutable|null $deletedAt` docblock so IDEs can infer the property

Reference solution:
```php
trait SoftDeletable
{
    public function softDelete(): void
    {
        $this->deletedAt = new \DateTimeImmutable();
    }

    public function isDeleted(): bool
    {
        return $this->deletedAt !== null;
    }

    public function restore(): void
    {
        $this->deletedAt = null;
    }
}
```

Compare with the project's `HasTimestamps` trait in `src/Traits/HasTimestamps.php` — same pattern.
```
