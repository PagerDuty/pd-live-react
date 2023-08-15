import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment'
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
    },
    build: {
      outDir: 'build',
    },
    resolve: {
      alias: {
        "src": "/src",
      },
    },
    plugins: [
      react({
        babel: {
          // Don't use .babelrc or babel.config.js files
          babelrc: false,
          configFile: false,
          // preset-env won't work with Vite, so configure babel here
          presets: [["@babel/preset-react", { "runtime": "automatic" }]],
          plugins: ["@babel/plugin-transform-runtime"]
        },
      }),
      EnvironmentPlugin('all', { loadEnvFiles: true }),
      // svgr options: https://react-svgr.com/docs/options/
      svgr(),
      eslint(),
    ],
  };
});
