export default [{ name: 'Assigns B to a score of 75', test: output => output.some(line => line.type === 'log' && line.text === 'Grade: B') }];
