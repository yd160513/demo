import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    // 使用 sass
    css: {
        preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
})
