// Configuration module - singleton pattern
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
};

export function getConfig() { return { ...config }; }
export function setConfig(updates) { Object.assign(config, updates); }

export default config;