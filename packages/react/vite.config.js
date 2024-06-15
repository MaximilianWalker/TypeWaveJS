import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './examples/',
  test: {
    environment: 'jsdom'
  },
  resolve: {
    alias: {
      '@typewavejs/react': path.join(__dirname, 'src')
    }
  }
})
