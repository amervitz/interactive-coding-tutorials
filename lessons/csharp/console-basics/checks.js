export default [{
  name: 'Prints Hello, C#!',
  test: output => output.some(line => line.type === 'log' && line.text === 'Hello, C#!')
}];
