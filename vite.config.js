import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to suppress Vite warnings for dynamic imports in auto-generated Cmajor files
    {
      name: 'cmajor-vite-ignore',
      transform(code, id) {
        if (id.includes('cmaj-audio-worklet-helper.js') || 
            id.includes('cmaj-patch-view.js') || 
            id.includes('cmaj-patch-connection.js')) {
          return {
            code: code.replace(/import\s*\(/g, 'import(/* @vite-ignore */ '),
            map: null
          };
        }
      }
    }
  ],
  resolve: {
    alias: {
      '/cmaj_api': path.resolve(__dirname, './src/cmaj_api'),
    },
  },
})
