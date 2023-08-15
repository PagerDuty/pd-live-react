import { defineConfig } from 'vite';
import EnvironmentPlugin from 'vite-plugin-environment'
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';

export default defineConfig(() => {
  return {
    server: {
      open: true,
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
          // Use .babelrc files
          babelrc: true,
          // Use babel.config.js files
          configFile: true,
        },
      }),
      EnvironmentPlugin('all', { loadEnvFiles: true }),
      // svgr options: https://react-svgr.com/docs/options/
      svgr(),
      eslint(),
    ],
  };
});
