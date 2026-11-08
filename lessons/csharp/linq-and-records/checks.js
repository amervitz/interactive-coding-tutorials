export default [{ name: 'Filters and orders passing learners', test: output => output.some(line => line.type === 'log' && line.text === 'Passing: Ada, Linus') }];
