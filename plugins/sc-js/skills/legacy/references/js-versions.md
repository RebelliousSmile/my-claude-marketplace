# JavaScript Version Reference

Key changes per ES version — use during `01-scan` to classify detected patterns.

## ES5 patterns to upgrade

| Pattern | Modern replacement | Notes |
|---|---|---|
| `var` | `const` / `let` | `const` preferred unless reassigned |
| `function() {}` callbacks | Arrow functions `() =>` | Mind `this` binding |
| String concat `"a" + b` | Template literals `` `a${b}` `` |  |
| `arguments` object | Rest params `...args` |  |
| `prototype` method assignment | Class syntax or object literal |  |
| `.apply(null, arr)` | Spread `fn(...arr)` |  |
| Callback chains | `async`/`await` | See async section |
| `for...in` on arrays | `for...of` or `.forEach()` | `for...in` iterates keys |
| `arguments.length` checks | Default params `fn(x = 0)` |  |

## ES6–ES2019 adoption checks

| Feature | Since | Detection signal |
|---|---|---|
| `const`/`let` | ES6 | absence of `var` |
| Arrow functions | ES6 | `.bind(this)` patterns still present |
| Destructuring | ES6 | `obj.foo, obj.bar` in sequence |
| Spread/rest | ES6 | `.apply()`, `Array.from(arguments)` |
| `Promise` | ES6 | `.then().catch()` chains |
| `async`/`await` | ES2017 | pending `.then()` chains |
| Optional chaining `?.` | ES2020 | `x && x.y && x.y.z` patterns |
| Nullish coalescing `??` | ES2020 | `x !== null && x !== undefined ? x : y` |
| `Promise.allSettled` | ES2020 | `Promise.all` where failures must not short-circuit |

## CommonJS → ESM

| CommonJS | ESM |
|---|---|
| `require('mod')` | `import mod from 'mod'` |
| `require('./file')` | `import './file.js'` (extension required in ESM) |
| `module.exports = x` | `export default x` |
| `module.exports = { a, b }` | `export { a, b }` |
| `exports.x = y` | `export const x = y` |
| `__dirname` | `fileURLToPath(new URL('.', import.meta.url))` |
| `__filename` | `fileURLToPath(import.meta.url)` |

**Prerequisite**: `"type": "module"` in `package.json` (or `.mjs` extension).

## ES2021–ES2024

| Feature | Since | Replaces |
|---|---|---|
| `??=`, `&&=`, `\|\|=` | ES2021 | verbose conditional assignment |
| `Array.at(-1)` | ES2022 | `arr[arr.length - 1]` |
| `Object.hasOwn(obj, k)` | ES2022 | `Object.prototype.hasOwnProperty.call(obj, k)` |
| `structuredClone()` | ES2022 | `JSON.parse(JSON.stringify(x))` for deep clone |
| `Array.from({length: n}, fn)` | — | `Array(n).fill(0).map(fn)` |
| `Promise.withResolvers()` | ES2024 | manual `resolve`/`reject` capture pattern |
