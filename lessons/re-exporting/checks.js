export default [
  { name: "Circle functions work", test: (output) => output.some(l => l.text.includes('Circle area (r=3):') && Math.abs(Number(l.text.split(':').pop()) - Math.PI * 9) < 0.01) && output.some(l => l.text.includes('Circle circumference (r=3):') && Math.abs(Number(l.text.split(':').pop()) - Math.PI * 6) < 0.01) },
  { name: "Rectangle area imported and works", test: (output) => output.some(l => l.text.includes('Rect area (4x5):') && l.text.includes('20')) },
  { name: "Rectangle perimeter imported and works", test: (output) => output.some(l => l.text.includes('Rect perimeter (4x5):') && l.text.includes('18')) }
];
