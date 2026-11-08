const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://localhost:3001', headless: true },
  webServer: { command: 'node server.js', url: 'http://localhost:3001', env: { PORT: '3001' } },
});
