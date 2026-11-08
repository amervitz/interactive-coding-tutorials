export default [
  { name: 'Welcomes C#', test: output => output.some(line => line.type === 'log' && line.text === 'Welcome, C#!') },
  { name: 'Reuses the method for Ada', test: output => output.some(line => line.type === 'log' && line.text === 'Welcome, Ada!') }
];
