# 功能点的合集
- [x] 水印(watermark)

# 项目搭建遇到的问题
## 使用 sass
```bash
npm install -D sass-embedded
```
```js
// vue.config.js
export default defineConfig({
    // 使用 sass
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    }
})
```