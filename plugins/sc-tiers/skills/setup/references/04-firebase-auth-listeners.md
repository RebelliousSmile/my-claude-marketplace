# Firebase Auth listener cleanup

- Always `unsubscribe()` after the first callback in one-shot `onAuthStateChanged` listeners (middlewares, promise wrappers)
- A persistent listener without cleanup will fire on every auth state change (login, logout, impersonation), causing unintended redirections
- Only persistent auth watchers (e.g. `setupAuthExpiryWatcher` in `app.vue`) should use a persistent listener — by design
- Pattern:
  ```javascript
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    unsubscribe(); // cleanup immediately
    // ... handle user
  });
  ```
