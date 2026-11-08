export default [
  { name: "PI constant imported and logged", test: (output) => output.some(l => l.text.includes('PI =') && l.text.includes('3.14')) },
  { name: "E constant imported and logged", test: (output) => output.some(l => l.text.includes('E =') && l.text.includes('2.71')) },
  { name: "circleArea function works", test: (output) => output.some(l => l.text.includes('Area (r=5):') && l.text.includes('78.5')) },
  { name: "circleCircumference function works", test: (output) => output.some(l => l.text.includes('Circumference (r=5):') && l.text.includes('31.4')) }
];
