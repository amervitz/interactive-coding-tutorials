import config, { getConfig, setConfig } from './config.js';
import logger, { logger as log } from './logger.js';

console.log("⚙️ Config & Logger Demo");

// Config usage
console.log("Initial config:", getConfig());
setConfig({ timeout: 10000, debug: true });
console.log("Updated config:", getConfig());

// Logger usage
log.info("Application started");
log.debug("Debug info: loading resources");
log.warn("Warning: deprecated API used");
log.error("Error: failed to fetch data");

console.log("\nAll logs:");
logger.getLogs().forEach(l => console.log(l));

// The default config object is shared and mutable; getConfig() returns a copy.
// TODO: Add a new log level 'fatal' to the logger