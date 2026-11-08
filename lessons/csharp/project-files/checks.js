export default [
  { name: 'Builds the report across files with implicit usings', test: output => output.some(line => line.type === 'log' && line.text === 'Passing: Ada, Linus') },
  { name: 'Enables the course completion branch', test: output => output.some(line => line.type === 'log' && line.text === 'Course complete!') }
];
