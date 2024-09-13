import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    base: './', // 配置项目的基础公共路径。它指定了在开发和生产环境中，所有静态资源的基础路径。默认情况下，base 选项的值是 '/'，表示根路径。
    plugins: [vue()],
    build: {
        outDir: 'dist/web', // 输出目录
        emptyOutDir: true, // 在构建之前清空输出目录
    },
    // 使用 sass
    css: {
        preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
})