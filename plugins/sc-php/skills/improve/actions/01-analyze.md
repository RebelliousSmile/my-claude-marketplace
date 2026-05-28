# Action 01 — analyze

Read the PHP codebase and identify design pattern gaps, anti-patterns, and maintainability issues.

## Inputs

- `path` (optional, default: project root) — scope of the analysis
- `focus` (optional) — specific area: `solid`, `patterns`, `types`, `framework` (default: all)

| `focus` value | Analysis category |
|---|---|
| `focus=solid` | SOLID violations |
| `focus=patterns` | Missing patterns |
| `focus=types` | PHP type system gaps |
| `focus=framework` | Framework-specific issues |
| (omitted) | All categories |

## Process

### Step 1 — Map the codebase structure

Read the directory structure under `path`. Exclude `vendor/`.
Identify:
- Controllers (likely `app/Http/Controllers/` for Laravel, `src/Controller/` for Symfony)
- Models/Entities (`app/Models/`, `src/Entity/`)
- Services (`app/Services/`, `src/Service/`)
- Repositories (`app/Repositories/`, `src/Repository/`)
- Test files

### Step 1.5 — Stack-specific anti-patterns from capability pivots

Re-detect capabilities from `composer.json` (same conditions as `sniff/01-scan`). For each condition met, load the pivot from `${CLAUDE_PLUGIN_ROOT}/skills/sniff/references/capabilities/<path>` and use its anti-patterns as **additional detection criteria** in Step 2. Report findings under a `Stack-specific` category.

| Capability | Condition | Pivot |
|---|---|---|
| PHP SOLID | Always | `php/solid.md` |
| Eloquent patterns | `illuminate/database` or `laravel/framework` in composer.json | `data/eloquent.md` |
| Doctrine patterns | `doctrine/orm` or `doctrine/dbal` in composer.json | `data/doctrine.md` |

Note: `php/solid.md` overlaps with the SOLID violations category in Step 2 — if it adds no new findings beyond what Step 2 already covers, skip it to avoid duplicates.
If a loaded pivot has a `## Anti-patterns` section, extract it directly. Otherwise read the full pivot and infer violations from its prescriptive rules.
Skip this step if no `composer.json` is found.

### Step 2 — Analyze each category

#### SOLID violations

**Single Responsibility (SRP):**
- Controller methods > 30 lines → likely doing too much
- Model methods that query, transform, AND send email → fat model
- Look for: database queries + business logic + HTTP response formatting in the same method

**Open/Closed (OCP):**
- `switch ($type)` or `if ($type === 'X') ... elseif` chains that would require editing to add a new type → missing polymorphism
- Look for: `switch` on a type/status string that isn't backed by an enum or strategy pattern

**Liskov Substitution (LSP):**
- Subclass overrides that throw exceptions the parent never throws
- Subclass that narrows parameter types or widens return types vs parent contract

**Interface Segregation (ISP):**
- Interfaces with > 7 methods that are only partially implemented by most classes
- Classes that implement an interface but leave several methods throwing `NotImplementedException`

**Dependency Inversion (DIP):**
- `new ClassName()` inside a class constructor or method (hidden dependency)
- `static::` calls to concrete classes for service access
- Look for: `new Mailer()`, `new Repository()`, `new Logger()` instead of injected dependencies

#### Missing patterns

**Repository pattern missing:**
- Direct Eloquent/Doctrine calls in controllers: `User::where(...)`, `$em->getRepository(User::class)->findBy(...)`
- DB queries in template includes or views

**Service layer missing:**
- Business logic directly in controller action (order processing, payment logic, email triggers)
- Multiple controller methods with the same DB + transform + response logic

**Value objects missing:**
- Primitive obsession: `float $price`, `string $email`, `string $currency` passed around raw
- Same validation rule (email regex, positive amount) repeated in multiple places

**Factory missing:**
- Complex object construction repeated across tests and feature code

#### PHP type system gaps

- Functions without return types
- Functions without parameter types
- `mixed` used where a narrower type is possible
- Nullable types not declared (`?string` vs `string` with possible null)
- Missing `declare(strict_types=1)` in files that do arithmetic or type-sensitive operations

#### Framework-specific issues (if detected)

**Laravel:**
- N+1 in Eloquent: `foreach ($orders as $o) { $o->customer->name }` without eager loading
- Logic in blade templates that belongs in a ViewModel or View Composer
- Missing form request classes (validation inline in controller)
- Jobs that do too much (SRP)

**Symfony:**
- Services defined as `public` when they could be `private`
- Missing autowiring (manual service definitions for autowirable classes)
- Events that should be commands (CQRS opportunity)

### Step 3 — Emit findings

For each finding:
- Category (SOLID / pattern / type / framework)
- Severity: `HIGH` (likely bug or hard to maintain) | `MEDIUM` (design improvement) | `LOW` (polish)
- File + line reference
- Short description

## Output

```
📋 sc-php improve — analysis

Scanned: 47 files (controllers: 8, models: 12, services: 4, repositories: 0)

SOLID violations:
  HIGH   SRP — OrderController::store() (line 45): queries DB, sends email, formats response (87 lines)
  HIGH   SRP — OrderController::update() (line 134): same pattern (62 lines)
  MEDIUM OCP — StatusService::getLabel() (line 23): switch on string status (4 cases, no enum)
  MEDIUM DIP — UserController (line 8): `new Mailer()` in constructor instead of injected

Missing patterns:
  HIGH   Repository — 6 controllers query Eloquent directly (no repository layer)
  MEDIUM Service layer — payment/refund logic duplicated in OrderController and WebhookController
  MEDIUM Value objects — `$price` (float) and `$currency` (string) passed as primitives in 9 places

Type system:
  MEDIUM 14 public methods missing return types
  LOW    3 files missing declare(strict_types=1)

Framework (Laravel):
  HIGH   N+1 — Order::all() + $order->customer loop in OrderController::index()
  MEDIUM Missing FormRequest — validation inline in 4 controller methods

Total: 4 HIGH · 7 MEDIUM · 1 LOW
→ proceed to plan.
```

Then proceed to `02-plan`.
