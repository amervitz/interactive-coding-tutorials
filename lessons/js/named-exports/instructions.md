## Named Exports

Named exports let you export multiple values from a module. You can export declarations individually or group them.

```javascript
// Individual exports
export const PI = 3.14159;
export function circleArea(r) { return PI * r * r; }

// Or grouped export
export { PI, E, circleArea, circleCircumference };
```

When importing, use curly braces with the exact names:

```javascript
import { PI, circleArea } from './utils.js';
import { E as eulerNumber } from './utils.js'; // rename with 'as'
```

### 🎯 Exercise: Use Named Exports

Uncomment the import for `E` in `main.js` and log its value.

Then run the code and verify the output shows both PI and E constants.

> 💡 You can import multiple named exports in one line: `import { PI, E, circleArea } from './utils.js';`
