## Default Exports

A module can have **one default export**. It's imported without curly braces and can be renamed freely.

```javascript
// Export
export default function greet(name) { return `Hello, ${name}!`; }
export default class User { ... }
export default { PI: 3.14, E: 2.71 };
```

```javascript
// Import - no braces, any name
import greet from './greet.js';
import MyGreeting from './greet.js';
import defaultExport from './greet.js';
```

You can combine default and named imports:

```javascript
import Calculator, { PI, E } from './math.js';
```

### 🎯 Exercise: Rename the Default Import

Uncomment the renamed import (`import Calc from './math.js'`) and use it to call `add(1, 2)`.

Verify both the original `Calculator` and renamed `Calc` work.

> 💡 Default exports are great for "main" functionality of a module. Named exports are better for utilities and constants.
