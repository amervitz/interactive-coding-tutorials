export default [
  { name: "Module executes without errors", test: (output) => !output.some(l => l.type === 'error') }
];
