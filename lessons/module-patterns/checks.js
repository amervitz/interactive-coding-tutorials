export default [
  { name: "Config getter/setter works", test: (output) => output.some(l => l.text.includes('Initial config:') && l.text.includes('timeout: 5000')) && output.some(l => l.text.includes('Updated config:') && l.text.includes('timeout: 10000')) },
  { name: "Logger methods work", test: (output) => output.some(l => l.text.includes('INFO: Application started')) && output.some(l => l.text.includes('WARN: Warning')) && output.some(l => l.text.includes('ERROR: Error')) },
  { name: "Fatal level added", test: (output) => output.some(l => l.text.includes('FATAL:') || l.text.includes('fatal')) }
];
