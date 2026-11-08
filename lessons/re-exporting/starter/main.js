// Single import from barrel file!
import { PI, circleArea, circumference } from './shapes/index.js';

console.log("📦 Barrel Export Demo");
console.log("PI =", PI);
console.log("Circle area (r=3):", circleArea(3));
console.log("Circle circumference (r=3):", circumference(3));

// TODO: Import rectangle functions
// import { rectArea, perimeter } from './shapes/index.js';
// console.log("Rect area (4x5):", rectArea(4, 5));
// console.log("Rect perimeter (4x5):", perimeter(4, 5));