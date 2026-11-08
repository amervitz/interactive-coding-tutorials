## Module Patterns & Best Practices

Modules enable powerful patterns for organizing code:

### Singleton State

Modules are singletons — shared state across imports:

```javascript
// config.js
const state = { theme: 'dark' };
export function getTheme() { return state.theme; }
export function setTheme(t) { state.theme = t; }
```

### Encapsulation

Private implementation details stay hidden:

```javascript
// logger.js
const logs = []; // Private!
export const logger = { info: (msg) => logs.push(msg), getLogs: () => logs };
```

### Factory Functions

```javascript
// userFactory.js
export function createUser(name, email) {
  return { name, email, id: crypto.randomUUID(), createdAt: new Date() };
}
```

### 🎯 Exercise: Extend the Logger

Add a `fatal` log level (higher than error) to the logger in `logger.js`.

Then use it in `main.js` and verify it appears in the logs.

> 💡 Add `fatal: 4` to the levels object, add a `fatal` method, and update `setLevel` to handle it.
