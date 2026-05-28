# Action 01 — explain

Explain a PHP concept or pattern using real examples found in the current project codebase.

## Inputs

- `topic` (required) — concept, pattern, or code excerpt to explain (e.g. "traits", "dependency injection", "this closure", "why does this return null")
- `path` (optional, default: project root) — where to search for examples

## Process

### Step 1 — Identify the concept

Parse the user's input to determine the category:

| Category | Examples |
|---|---|
| Language feature | traits, interfaces, abstract classes, generators, fibers, match, enums, readonly, named args |
| OOP pattern | dependency injection, repository pattern, service layer, value objects, factories |
| PHP idiom | null coalescing, null safe operator, spread operator, type coercion vs strict types |
| Framework feature | Laravel Eloquent relations, middleware, service providers, facades; Symfony DI container, events |
| Async/performance | generators, fibers, queue jobs, lazy collections |
| Type system | union types, intersection types, nullable, strict_types |

### Step 2 — Search the project for examples

Search `.php` files for the concept. Exclude `vendor/`.

Useful patterns to grep:
- Traits: `trait\s+\w+`, `use\s+\w+Trait`
- DI: `__construct\(` with typed parameters
- Repository: `interface\s+\w*Repository`, `class\s+\w*Repository`
- Match: `\bmatch\s*\(`
- Generators: `\byield\b`
- Fibers: `new\s+Fiber\(`

If found: pick the most illustrative example (prefer real business logic over boilerplate).
If not found: proceed with a minimal invented snippet in the project's style (namespace, PSR conventions detected from composer.json).

### Step 3 — Explain

Structure the explanation:

1. **One-line definition** — what it is
2. **Why it exists** — what problem it solves (the "before" without it)
3. **The project example** — actual project code, annotated inline
4. **Key rules** — 3-5 bullet points: when to use, when NOT to use, common mistakes
5. **Contrast** — if relevant, contrast with the alternative (e.g. abstract class vs interface)

Keep explanations concise. Real code > prose.

### Step 4 — Offer practice

End every explanation with:

```
---
Want to consolidate this with a practice exercise? Say "practice [topic]".
```

## Output example (topic: traits)

```
## PHP Traits

**What:** A mechanism for horizontal code reuse — copy-paste at the language level,
         but controlled and explicit.

**Why it exists:** PHP is single-inheritance; traits let you share method implementations
                   across unrelated class hierarchies without forcing inheritance.

**In this project** (`src/Traits/HasTimestamps.php`):
```php
trait HasTimestamps
{
    public function createdAt(): \DateTimeImmutable
    {
        return $this->createdAt;  // Property must exist on the using class
    }

    public function touch(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }
}

class Order {
    use HasTimestamps;
    // ...
}
```

**Key rules:**
- ✅ Use for cross-cutting concerns: logging, timestamps, soft-deletes
- ✅ Use when the same methods appear in 3+ unrelated classes
- ❌ Don't use as a substitute for proper design (service layer, composition)
- ❌ Avoid traits that depend on specific properties — document the contract in a comment
- ⚠  Trait conflicts: use `insteadof` or `as` to resolve method name clashes

**vs interface:** Interfaces define *what* a class can do; traits define *how*.
                  Prefer interfaces for public contracts, traits for shared implementation.
```
