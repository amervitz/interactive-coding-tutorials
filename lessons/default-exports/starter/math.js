// Default export - one per module
const Calculator = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => b !== 0 ? a / b : 'Error: Division by zero'
};

export default Calculator;

// Can also export default inline:
// export default class Calculator { ... }
// export default function() { ... }