/* eslint-disable import/no-extraneous-dependencies */
const {
  defineConfig,
} = require('cypress');
const dotenv = require('dotenv');
const cypressFailFast = require('cypress-fail-fast/plugin');

module.exports = defineConfig({
  video: false,
  viewportWidth: 1920,
  viewportHeight: 1080,
  defaultCommandTimeout: 30000,
  retries: 3,

  e2e: {
    setupNodeEvents(on, config) {
      dotenv.config();
      cypressFailFast(on, config);
      // eslint-disable-next-line no-param-reassign
      config.env.PD_USER_TOKEN = process.env.VITE_PD_USER_TOKEN;
      return config;
    },
    baseUrl: 'http://127.0.0.1:3000/pd-live-react',
    specPattern: 'cypress/e2e/**/*.spec.{js,ts,jsx,tsx}',
    testIsolation: true,
  },
});
