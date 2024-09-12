# 功能点的合集
- [x] 水印
- [x] 切换主题

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

## 定义 css 变量的不同方式
```css
/* 1. 使用伪类选择器 :root */
:root {
    --background-color: #ffffff;
    --text-color: #000000;
}

/* 2. 使用媒体查询 */
@media (prefers-color-scheme: dark) {
    :root {
        --background-color: #000000;
        --text-color: #ffffff;
    }
}

/* 3. 使用属性选择器  */
[data-theme='dark'] {
    --background-color: pink;
    --text-color: #ffffff;
}
```

```css
/* 使用 css 变量 */
body {
    background-color: var(--background-color);
    color: var(--text-color);
}
```

- 第一种方式 `:root` 伪类选择器中，这样在全局下都可以使用这些变量。默认采用的就是这个值。
- 第二种方式 `@media (prefers-color-scheme: dark)` 检测到系统主题是深色模式时则重新定义全局的 CSS 变量。
- 第三种方式 `[data-theme='dark']` 当 HTML 元素具有 data-theme='dark' 属性时重新定义全局的 CSS 变量。
    > 这种方式对应的切换主题的方式是通过 JS 来动态修改 HTML 元素的 data-theme 属性值。



