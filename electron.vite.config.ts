import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    },
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer/src'),
        '@': resolve(__dirname, 'src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
