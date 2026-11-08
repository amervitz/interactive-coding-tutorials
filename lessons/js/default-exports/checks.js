export default [
  { name: "Default import works", test: (output) => output.some(l => l.text.includes('5 + 3 =') && l.text.includes('8')) },
  { name: "All calculator methods work", test: (output) => output.some(l => l.text.includes('10 - 4 =') && l.text.includes('6')) && output.some(l => l.text.includes('6 * 7 =') && l.text.includes('42')) && output.some(l => l.text.includes('20 / 4 =') && l.text.includes('5')) },
  { name: "Division by zero handled", test: (output) => output.some(l => l.text.includes('5 / 0 =') && l.text.includes('Error')) },
  { name: "Renamed import works", test: (output) => output.some(l => l.text.includes('Renamed import:') && l.text.includes('3')) }
];
