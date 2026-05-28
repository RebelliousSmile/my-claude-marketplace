# Action 02 — migrate

Apply upgrade or downgrade transformations identified by `01-scan`, file by file.

## Inputs

- Manifest from `01-scan` (required)
- `direction` — `upgrade` | `downgrade` (from manifest)
- `dry-run` (optional flag) — show diffs only, do not write

## Process

### Order of application

1. CRITICAL removals first (deprecated/removed APIs that cause runtime errors)
2. WARN patterns
3. MEDIUM upgrade opportunities
4. LOW upgrade opportunities

Ask for user confirmation before processing MEDIUM and LOW items if they involve significant structural changes (e.g. converting to enums, constructor promotion).

### Per-pattern transformations

#### `mysql_*()` → PDO/MySQLi

Show the migration diff. Ask: "Replace with PDO (recommended) or MySQLi?"

```php
// Before
$conn = mysql_connect('localhost', 'user', 'pass');
$res  = mysql_query("SELECT * FROM users WHERE id = $id", $conn);

// After (PDO)
$pdo  = new PDO('mysql:host=localhost;dbname=db', 'user', 'pass');
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute(['id' => $id]);
```

#### `create_function()` → Anonymous function

```php
// Before
$fn = create_function('$x', 'return $x * 2;');

// After
$fn = fn($x) => $x * 2;
```

#### `each()` → `foreach`

```php
// Before
while ([$key, $val] = each($arr)) { ... }

// After
foreach ($arr as $key => $val) { ... }
```

#### `switch` → `match`

Only apply when all cases use `===`, return a value, and have no fall-through.

```php
// Before
switch ($status) {
    case 'active': return true;
    case 'inactive': return false;
    default: throw new \RuntimeException("Unknown: $status");
}

// After
return match ($status) {
    'active'   => true,
    'inactive' => false,
    default    => throw new \RuntimeException("Unknown: $status"),
};
```

#### Constructor promotion

```php
// Before
class User {
    public string $name;
    public int $age;
    public function __construct(string $name, int $age) {
        $this->name = $name;
        $this->age  = $age;
    }
}

// After
class User {
    public function __construct(
        public string $name,
        public int    $age,
    ) {}
}
```

#### Null safe operator

```php
// Before
$city = $user !== null ? $user->getAddress() !== null ? $user->getAddress()->getCity() : null : null;

// After
$city = $user?->getAddress()?->getCity();
```

#### Constants → Enum (upgrade 8.1+)

Only if constants form a closed set of string/int values.

```php
// Before
class Status {
    const ACTIVE   = 'active';
    const INACTIVE = 'inactive';
}

// After
enum Status: string {
    case Active   = 'active';
    case Inactive = 'inactive';
}
```

### Write rules

- Write transformed files to the same path (in-place).
- Show a unified diff for each file before writing; proceed unless `dry-run`.
- Never modify `vendor/` or generated migration files.
- If a transformation requires a new class/enum file, create it alongside the existing file.

## Output

```
✅ sc-php legacy — migration complete

  Modified (4 files):
    ↺ src/db.php — mysql_connect → PDO
    ↺ src/Legacy/OldHelper.php — create_function × 3 → anonymous fn
    ↺ src/Controller/OrderController.php — switch × 2 → match
    ↺ src/Entity/User.php — constructor promotion
  New files (1):
    + src/Enum/Status.php — enum Status: string
  Skipped (dry-run or user declined):
    - templates/old.php — short open tags (manual fix required)
```

### Dry-run output

When `dry-run` flag is set, no files are written. Output shape:

```
[dry-run] sc-php legacy — migration preview

  Would modify (4 files):
    [dry-run] src/db.php — mysql_connect → PDO
    [dry-run] src/Legacy/OldHelper.php — create_function × 3 → anonymous fn
  Would create (1):
    [dry-run] src/Enum/Status.php — enum Status: string
  Skipped (user declined or dry-run):
    - templates/old.php — short open tags (manual fix required)

No files written. Remove --dry-run to apply.
```
