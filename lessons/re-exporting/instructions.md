## Re-exporting (Barrel Files)

Re-exporting lets you create a single entry point ("barrel file") that aggregates exports from multiple modules. This simplifies imports for consumers.

```javascript
// shapes/index.js
export { PI, area as circleArea, circumference } from './circle.js';
export { area as rectArea, perimeter } from './rectangle.js';
export { default as Triangle } from './triangle.js';
```

Now consumers import from one place:

```javascript
import { PI, circleArea, circumference, rectArea, perimeter } from './shapes/index.js';
```

You can also rename during re-export to avoid conflicts:

```javascript
export { area as circleArea } from './circle.js';
export { area as rectArea } from './rectangle.js';
```

### 🎯 Exercise: Use Rectangle Functions

Uncomment the rectangle imports in `main.js` and log the area and perimeter of a 4×5 rectangle.

Notice how `shapes/index.js` gives both area functions distinct names — you don't need to know the internal file structure!

> 💡 Both modules export `area`. The barrel renames them to `circleArea` and `rectArea` so consumers can import each one unambiguously.
