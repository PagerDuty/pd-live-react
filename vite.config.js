import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig(() => {
  return {
    server: {
      open: true,
    },
    build: {
      outDir: 'build',
    },
    plugins: [
      react({
        babel: {
          // presets: [...],
          // // Your plugins run before any built-in transform (eg: Fast Refresh)
          // plugins: [...],
          // Use .babelrc files
          babelrc: true,
          // Use babel.config.js files
          configFile: true,
        },
      }),
      // svgr options: https://react-svgr.com/docs/options/
      svgr(),
    ],
  };
});
