import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  server: {
    port: 3000,
    open: true
  }
})
