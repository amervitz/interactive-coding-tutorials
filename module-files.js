import { init, parse } from './vendor/es-module-lexer/lexer.minimal.js';

export async function analyzeFiles(files) {
  await init();
  return Object.fromEntries(Object.entries(files).map(([name, source]) => {
    let imports = [];
    try {
      [imports] = parse(source);
    } catch {
      // Leave invalid source untouched so the native loader reports its syntax
      // error only if it is imported, including imports made later by a button.
    }
    return [name, { source, imports }];
  }));
}
