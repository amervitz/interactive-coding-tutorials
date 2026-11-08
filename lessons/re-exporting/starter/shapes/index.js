// Re-export all from circle.js
export { PI, area as circleArea, circumference } from './circle.js';
export { area as rectArea, perimeter } from './rectangle.js';

// Can also re-export with renaming:
// export { area as circleArea } from './circle.js';
// export { area as rectArea } from './rectangle.js';