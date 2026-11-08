import Calculator from './math.js';
// Note: no curly braces for default import!
// Can name it anything: import Calc from './math.js';

console.log("🧮 Calculator Demo");
console.log("5 + 3 =", Calculator.add(5, 3));
console.log("10 - 4 =", Calculator.subtract(10, 4));
console.log("6 * 7 =", Calculator.multiply(6, 7));
console.log("20 / 4 =", Calculator.divide(20, 4));
console.log("5 / 0 =", Calculator.divide(5, 0));

// TODO: Try importing with a different name
// import Calc from './math.js';
// console.log("Renamed import:", Calc.add(1, 2));