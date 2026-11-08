export default [
  { name: 'Sums the array to 20', test: output => output.some(line => line.type === 'log' && line.text === 'Total: 20') },
  { name: 'Reports four elements', test: output => output.some(line => line.type === 'log' && line.text === 'Count: 4') }
];
