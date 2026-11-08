export default [
  { name: "App starts without loading heavy module", test: (output) => output.some(l => l.text.includes('App started') && l.text.includes('NOT loaded')) },
  { name: "Dynamic import works", test: (output) => output.some(l => l.text.includes('Loading heavy module dynamically')) && output.some(l => l.text.includes('Module loaded')) },
  { name: "Heavy module functions execute", test: (output) => output.some(l => l.text.includes('Chart rendered')) && output.some(l => l.text.includes('Heavy computation result')) },
  { name: "Error handling implemented", test: (output) => output.some(l => l.text.toLowerCase().includes('non-existent') || l.text.toLowerCase().includes('module not found') || l.text.toLowerCase().includes('failed to fetch')) }
];
