import { resolve, join } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  build: {
    // cssCodeSplit: false,
    lib: {
      entry: resolve(__dirname, 'src/index.jsx'),
      name: '@typewavejs/react',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  test: {
    environment: 'jsdom'
  },
  resolve: {
    alias: {
      '@typewavejs/react': join(__dirname, 'src')
    }
  }
});
