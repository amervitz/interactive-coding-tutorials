export default [
  { name: 'Awaits a valid score', test: output => output.some(line => line.type === 'log' && line.text === 'Score: 21') },
  { name: 'Recovers from invalid input', test: output => output.some(line => line.type === 'log' && line.text === 'Invalid score') }
];
