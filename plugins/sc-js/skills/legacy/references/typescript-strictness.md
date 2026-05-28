# TypeScript Strictness Reference

Evolution of TypeScript strict mode flags and version-specific features — use during `01-scan`.

## Strict mode flags (tsconfig.json)

Enabling `"strict": true` activates all flags below. Migrate incrementally if the codebase is large.

| Flag | What it catches | Common fix |
|---|---|---|
| `strictNullChecks` | `null`/`undefined` not assignable to other types | Add `\| null` to types or add null guards |
| `noImplicitAny` | Variables inferred as `any` | Add explicit type annotation |
| `strictFunctionTypes` | Contravariant function params | Tighten callback types |
| `strictPropertyInitialization` | Class props not initialized in constructor | Add `!` (if intentional) or initialize |
| `noImplicitThis` | `this` typed as `any` in functions | Use arrow functions or add `this: T` param |
| `useUnknownInCatchVariables` | `catch (e)` has `unknown` not `any` | Add `if (e instanceof Error)` guard |

## TypeScript version changes

### TypeScript 4.x key additions

| Feature | TS version | Replaces |
|---|---|---|
| Template literal types | 4.1 | string concatenation types |
| `infer` in conditional types | 4.1+ | complex type extraction |
| `noPropertyAccessFromIndexSignature` | 4.2 | unsafe index access |
| `satisfies` operator | 4.9 | `as` assertion for validation |

### TypeScript 5.x key additions

| Feature | TS version | Replaces |
|---|---|---|
| `const` type parameters | 5.0 | `as const` on generic calls |
| `verbatimModuleSyntax` | 5.0 | `importsNotUsedAsValues` |
| Variadic tuple improvements | 5.0 | complex spread types |
| `using` / `await using` (Disposable) | 5.2 | manual try/finally cleanup |
| Type parameter defaults | 5.4 | partial generic workarounds |

## Common anti-patterns to flag

| Anti-pattern | Detection | Preferred alternative |
|---|---|---|
| `as any` without comment | grep `as any` | Proper type or `as unknown as T` with comment |
| `!` non-null assertion | grep `!\w\|!\[` | Null guard or optional chaining |
| `@ts-ignore` without comment | grep `@ts-ignore` | Fix the type or `@ts-expect-error` with comment |
| Implicit `any` in catch | `catch (e)` with direct `e.message` | `if (e instanceof Error) e.message` |
| `Function` type | grep `: Function` | Specific function signature |
| `object` type | grep `: object` | `Record<string, unknown>` or specific interface |

## Import style (TypeScript 4.5+)

| Old | New (`verbatimModuleSyntax`) |
|---|---|
| `import { Foo } from './foo'` (type used only as type) | `import type { Foo } from './foo'` |
| `export { Bar }` (type only) | `export type { Bar }` |
