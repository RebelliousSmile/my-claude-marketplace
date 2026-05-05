# Tests — localStorage / sessionStorage caveat

- `tests/setup.ts` overrides `window.localStorage` with non-persistent `vi.fn()` stubs (lines ~78). `getItem` always returns `undefined`, regardless of prior `setItem` calls.
- Any unit test that depends on real read-after-write behavior of `localStorage` (or `sessionStorage`) MUST install its own Map-backed mock in `beforeEach`:

  ```js
  function createStorageMock() {
    const store = new Map()
    return {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    }
  }

  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: createStorageMock(), writable: true })
    Object.defineProperty(window, 'sessionStorage', { value: createStorageMock(), writable: true })
  })
  ```

- Symptom if forgotten: dedup logic appears broken (every call pushes again), but production code is correct.
- Reference: `tests/composables/useTrackEvent.test.js`.
