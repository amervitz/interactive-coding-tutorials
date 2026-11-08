// Logger module - encapsulates implementation
const logs = [];
const levels = { debug: 0, info: 1, warn: 2, error: 3 };
let currentLevel = levels.info;

function format(level, msg) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] ${level.toUpperCase()}: ${msg}`;
}

export const logger = {
  debug: (msg) => { if (currentLevel <= levels.debug) logs.push(format('debug', msg)); },
  info: (msg) => { if (currentLevel <= levels.info) logs.push(format('info', msg)); },
  warn: (msg) => { if (currentLevel <= levels.warn) logs.push(format('warn', msg)); },
  error: (msg) => { if (currentLevel <= levels.error) logs.push(format('error', msg)); },
  getLogs: () => [...logs],
  setLevel: (level) => { currentLevel = levels[level] ?? levels.info; }
};

export default logger;