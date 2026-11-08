// Simulates a large module (e.g., chart library, editor)
export function renderChart(data) {
  return `📊 Chart rendered with ${data.length} data points`;
}

export function heavyComputation(n) {
  let result = 0;
  for (let i = 0; i < n * 100000; i++) result += Math.sqrt(i);
  return result;
}

console.log("⚡ heavy-module.js loaded");