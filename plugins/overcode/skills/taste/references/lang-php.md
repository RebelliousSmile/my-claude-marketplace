# PHP — obsolescence detection patterns

Extensions: `.php`

---

## Detector A — Import extraction

```regex
# Namespace use statements
use\s+([\w\\]+)(?:\s+as\s+\w+)?;
use\s+function\s+([\w\\]+);
use\s+const\s+([\w\\]+);
```

**External package heuristic**: the top-level namespace segment maps to a Composer package.

Common namespace-to-package mappings:
| Namespace prefix | Composer package |
|---|---|
| `Illuminate\` | `laravel/framework` |
| `Symfony\` | `symfony/*` |
| `Doctrine\` | `doctrine/*` |
| `GuzzleHttp\` | `guzzlehttp/guzzle` |
| `Carbon\` | `nesbot/carbon` |
| `Psr\` | `psr/*` |
| `Monolog\` | `monolog/monolog` |
| `Twig\` | `twig/twig` |

**Manifest to check**: `composer.json` (`require` + `require-dev`).

**Deprecated check** (if Composer available):
```bash
composer outdated --direct --format=json 2>/dev/null
```

---

## Detector B — Symbol declaration patterns

```regex
# Functions
(public|protected|private|static)?\s*function\s+(\w+)\s*\(

# Classes, interfaces, traits, enums
(abstract\s+|final\s+)?class\s+(\w+)
interface\s+(\w+)
trait\s+(\w+)
enum\s+(\w+)
```

**Grep command**:
```bash
rg -n "function\s+\w+|class\s+\w+|interface\s+\w+|trait\s+\w+|enum\s+\w+" \
  --glob "**/*.php"
```

**Scope note**: Laravel facade method calls (e.g., `Auth::user()`, `Cache::get()`) resolve via magic — do NOT flag as missing unless the facade class itself is absent from `composer.json`.

---

## Notes

- PHP built-in functions (`array_map`, `json_encode`, `strlen`, etc.): never flag as missing. Identify via [`php.net/manual/en/indexes.functions.php`](https://www.php.net/manual/en/indexes.functions.php) or by the absence of a namespace prefix.
- `include` / `require` / `include_once` / `require_once` — treat the included path as a file path claim (Detector A in assess-doc terms): check the file exists.
- Autoloading: PSR-4 autoloading maps namespace to directory. If a class is declared in the correct directory per `composer.json` `autoload.psr-4`, the missing-import check is a strong signal; otherwise it may be an autoload misconfiguration.
