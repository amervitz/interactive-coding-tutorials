export default [{ name: 'Prices four notebooks at 2.25 each', test: output => output.some(line => line.type === 'log' && line.text === '4 notebooks cost 9.00') }];
