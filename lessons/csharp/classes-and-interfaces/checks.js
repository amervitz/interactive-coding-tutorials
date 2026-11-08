export default [{ name: 'Accumulates both additions from an initial value of 10', test: output => output.some(line => line.type === 'log' && line.text === 'Count: 18') }];
