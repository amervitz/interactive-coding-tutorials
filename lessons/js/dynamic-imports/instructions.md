## Dynamic Imports

Dynamic `import()` loads modules on-demand at runtime. It returns a **Promise**, enabling code splitting and lazy loading.

```javascript
// Static import (top-level, synchronous)
import { foo } from './module.js';

// Dynamic import (anywhere, asynchronous)
const module = await import('./module.js');
const { foo } = module;

// Or with IIFE (older pattern)
import('./module.js').then(module => { /* ... */ });
```

Use cases:

- Code splitting — load features only when needed
- Conditional loading — based on user role, device, etc.
- Lazy loading — defer non-critical code

`import()` works in regular scripts too (not just modules)!

### 🎯 Exercise: Handle Import Errors

Add a second button that tries to import `./non-existent.js` and catches the error.

Log a friendly message like "Module not found" instead of the raw error.

> 💡 Wrap `await import()` in try/catch. The error will have a message like "Failed to fetch dynamically imported module".
