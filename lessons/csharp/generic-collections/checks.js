export default [
  { name: 'Appends Linus after Ada and Grace', test: output => output.some(line => line.type === 'log' && line.text === 'Names: Ada, Grace, Linus') },
  { name: 'Stores the new score', test: output => output.some(line => line.type === 'log' && line.text === 'Linus: 15') }
];
