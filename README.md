# 功能点的合集
- [x] 水印
- [x] 切换主题
- [x] 集成 Electron
  - [x] 通过一个命令即启动 Electron 也启动 web 服务；Electron 退出时关闭 web 服务。
  - [x] 项目整体采用 ESModule (通用性不高，后面恢复成 CommonJS)
  - [x] 区分开发环境和生产环境，加载不同的 URL
    - [ ] 生产环境下采用自定义协议加载，那么如何调试？
  - [x] 通过自定义协议加载资源
  - [x] 日志收集
  - [x] 崩溃、异常采集
  - [x] 进程间通信
  - [x] 打包不同项目版本
  - [ ] sqlite 的相关配置
  - [x] 主进程热更新
  - [ ] 新老版本不同协议间的配置同步
  - [x] 项目限制 node 及 npm 版本

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

## 通过一个命令即启动 Electron 也启动 web 服务
```json
{
    "scripts": {
      "dev:web": "vite",
      "dev:pc": "concurrently --kill-others \"npm run dev:web\" \"npm run electron:serve\"",
      "electron:serve": "wait-on http://localhost:5173 && electron ."
    }
}
```
### 命令解析: `concurrently`
同时执行多个命令。
- --kill-others 选项
  > 当其中一个命令执行失败时，会终止所有的命令。
  > 
  > 问: 启动了一个 electron 应用 A，又启动了 electron 应用 B，在应用 A 中我增加了 concurrently 的 --kill-others 选项，那么在结束应用 B 的时候会应用到 A 吗?
  > 
  > 答: 不会，concurrently 的 --kill-others 选项只会影响由同一个 concurrently 命令启动的进程。
  
### 命令解析: `wait-on`
等待指定的资源（如文件、端口、HTTP(s) 端点等）变为可用状态后再执行后续的命令。

## 通过 npm 命令设置环境变量
```json
{
    "scripts": {
      "test": "cross-env NODE_ENV=development node -e \"console.log(process.env.NODE_ENV)\""
    }
}
```
- cross-env 是一个用于设置环境变量的工具，能够在跨平台（Windows、macOS、Linux）上统一设置环境变量。
- 通过`process.env.NODE_ENV`获取。

## 项目整体采用 ESModule
### 设置方式
在 package.json 中设置 type 为 module： 这样可以使整个项目默认使用 ESModule。  
```json
{
  "type": "module"
}
```
### 注意点
- 在 ESModule 中 __dirname 和 __filename 是不可用的，可以通过 import.meta.url 来获取当前文件的路径。
  > 定义 __filename: `const __filename = fileURLToPath(import.meta.url);`  
  > 定义 __dirname: `const __dirname = path.dirname(__filename);`
- 引入 preload.js 时需要改为 .cjs。改为 .cjs 是因为项目整体采用的是 ESModule，但是 preload 选项只支持 CommonJS，所以需要将其显示的指定为 CommonJS。
  ```js
  webPreferences: {
    preload: path.join(__dirname, 'preload.cjs')
  }
  ```


## 区分开发环境和生产环境，加载不同的 URL
### 两种方式
- 开发环境采用 web 服务的 URL，开发和调试更加方便。
  > 优点:
  > - 开发方便：可以直接使用现有的 Web 开发工具和调试工具。   
  > - 动态内容：可以轻松加载和更新动态内容。   
  > - 部署灵活：可以将前端和后端分开部署，适应不同的部署环境。  
  > 
  > 缺点:  
  > - 依赖网络：需要网络连接，可能会受到网络延迟和不稳定的影响。
  > - 安全性较低：需要处理跨域问题和潜在的安全漏洞。
  
- 生产环境采用自定义协议的 URL，更安全且可以离线运行。
  > 优点:
  > - 更安全：自定义协议可以避免跨域问题和潜在的安全漏洞。   
  > - 离线可用：不依赖外部网络，可以在离线环境下运行。   
  > - 更快地加载速度：资源可以直接从本地文件系统加载。
  >
  > 缺点:
  > - 配置复杂：需要额外配置自定义协议和处理相关资源。 
  > - 开发调试不便：需要额外的调试工具和配置。

### 代码实现
> - 使用 protocol.registerSchemesAsPrivileged 注册自定义协议。
> - 在开发环境中使用 loadURL 加载本地服务器地址。
> - 在生产环境中使用 loadURL 加载自定义协议的 URL。
```js
// ...

// 是否是开发环境
const isDev = !app.isPackaged;
console.log('isDev:', isDev);

// 赋予该自定义协议特定的权限（如安全性、标准协议特性等）
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true, stream: true } }
]);

// ...

app.on('ready', () => {

  // 注册自定义协议 app
  protocol.handle('app', async (request) => {
    log.info('request.url:', request.url, __dirname);
    // request.url 是 win.loadURL 传入的: app://dist/web/index.html。
    const url = request.url.slice('app://'.length); // 去掉 'app://' 部分
    log.info('url: ', url)
    const filePath = path.normalize(path.join(__dirname, '../../', url))
    log.info('filePath: ', filePath);
    const fileUrl = pathToFileURL(filePath).toString();
    log.info('fileUrl:', fileUrl);

    return net.fetch(fileUrl);
  });

  createWindow();
});

// ...

function createWindow() {
  // ...

  // 开发环境采用本地地址，生产环境采用打包后的文件
  if (isDev) {
    win.loadURL('http://localhost:5173'); // Vue 项目运行的地址
  } else {
    win.loadURL(path.join('app://.', 'dist/web/index.html'));
  }

}
```

#### 注意点: 注册自定义协议 path.normalize(path.join(__dirname, '../../', url)) 中 ../../ 的原因:
```js
// 注册自定义协议 app
protocol.handle('app', async (request) => {
  log.info('request.url:', request.url, __dirname);
  // request.url 是 win.loadURL 传入的: app://dist/web/index.html。
  const url = request.url.slice('app://'.length); // 去掉 'app://' 部分
  log.info('url: ', url)
  const filePath = path.normalize(path.join(__dirname, '../../', url))
  log.info('filePath: ', filePath);
  const fileUrl = pathToFileURL(filePath).toString();
  log.info('fileUrl:', fileUrl);

  return net.fetch(fileUrl);
});
```
1. electron 的入口文件是 src/main/main.js，__dirname 是 /Applications/demo.app/Contents/Resources/app.asar/src/main。
2. request.url.substr(6) 去掉 'app://' 部分后的 url 是 dist/web/index.html。
3. 如果 path.join(__dirname, url) 的话，会变成 /Applications/demo.app/Contents/Resources/app.asar/src/main/dist/web/index.html。
4. 而正确的路径是 /Applications/demo.app/Contents/Resources/app.asar/dist/web/index.html，所以需要 ../../ 来回退两级目录。
> 那直接 const filePath = path.normalize(url) 不就可以了吗？
> 不可以，因为需要获取到文件的绝对路径，而 path.normalize(url) 只是将 url 中的斜杠进行规范化，不会获取到文件的绝对路径。

## electron 采用 ESModule 形式加载对应处理
### 设置方式
在 package.json 中设置 type 为 module： 这样可以使整个项目默认使用 ESModule。  
```json
{
  "type": "module"
}
```

## 解压 asar 文件
- 安装 asar
```bash
npm install -g asar
```
- 解压 asar 文件
```bash
asar extract <path-to-asar-file> <output-directory>
```

## 项目限制 node 及 npm 版本
### 设置方式
1. 在 package.json 中设置 engines 字段:  
```json
{
  "engines": {
    "node": "20.17.0",
    "npm": "10.8.2"
  }
}
```
2. 设置 preinstall 字段并定义对应脚本:   
```json
{
  "scripts": {
    "preinstall": "node check-node-version.js"
  }
}
```
```js
// check-node-version.js
import semver from 'semver';
/**
 * TODO: 增加 assert { type: 'json' } 的原因:
 * 1. package.json 设置了 "type": "module", 导致项目是按照 ESModule 的方式加载模块的。
 * 如果不增加 assert { type: 'json' }，那么 import packageJson from '../package.json' 会报错:
 *      TypeError [ERR_IMPORT_ASSERTION_TYPE_MISSING]: Module "file:///xxx/xxx/xxx/demo/package.json" needs an import attribute of type "json"
 * 提示需要明确的类型断言来确定文件的类型。
 */
import packageJson from '../package.json' assert { type: 'json' };

const requiredVersion = packageJson.engines.node;
const currentVersion = process.version;

console.log('当前 Node.js 版本：', currentVersion);
console.log('要求 Node.js 版本：', requiredVersion);

if (!semver.satisfies(currentVersion, requiredVersion)) {
  console.error(`当前 Node.js 版本为 ${currentVersion}，但此项目要求 Node.js 版本为 ${requiredVersion}。请更新 Node.js 版本。`);
  process.exit(1);
}

console.log('Node.js 版本检查通过。');

```
### 注意点
#### 只在 package.json 中设置 engines 字段，不设置 preinstall 字段
在执行 `npm install` 时，会提示当前 Node.js 版本不符合要求，但是不会终止安装。
```bash
npm warn EBADENGINE Unsupported engine {
npm warn EBADENGINE   package: 'my-vue-app@0.0.0',
npm warn EBADENGINE   required: { node: '14.16.0' },
npm warn EBADENGINE   current: { node: 'v20.17.0', npm: '10.8.2' }
npm warn EBADENGINE }
```
## vite 项目中没有采用 ts，npm run dev 时提示: The CJS build of Vite's Node API is deprecated. 
原因:
vite 配置文件 vite.config.js 以 js 结尾，vite 会默认采用 CommonJS 的方式加载配置文件，所以会提示 The CJS build of Vite's Node API is deprecated。
解决方式: 将 vite.config.js 改为 vite.config.cjs。
> See https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated for more details.

## 日志收集
通过 electron-log 实现。 
- 主进程
  > [具体实现](https://github.com/yd160513/demo/blob/main/src/main/logger.js)
  
  封装的方法有:
  - 压缩日志目录中的日志文件
  - 删除七天之前的日志文件
  
- 渲染进程
  > [具体实现](https://github.com/yd160513/demo/blob/main/src/renderer/utils/logger.js)
  
  方便业务使用则重写了 console 的部分方法。

## 崩溃、异常采集
通过 electron 提供的 crash-reporter + api 实现，具体配置可见:

- 主进程配置
  ```js
  // 统一不同平台的崩溃日志存储路径
  app.setPath('crashDumps', path.join(app.getPath('userData'), 'crashes'));
  // 启动崩溃报告器
  crashReporter.start({
    uploadToServer: false
  })
  
  // 监听渲染进程崩溃事件
  app.on('render-process-gone', (event, webContents, details) => {
    log.error('渲染进程奔溃，render-process-gone 事件触发', details);
  })
  // 监听子进程崩溃事件
  app.on('child-process-gone', (event, details) => {
    log.error('子进程奔溃，child-process-gone 事件触发', details);
  })
  // 监听未捕获的 JavaScript 异常事件
  process.on('uncaughtException', (error) => {
    log.error('监听到未捕获的 JavaScript 异常事件，uncaughtException 事件触发', error);
    app.exit();
  })
  // 监听未处理的 Promise 拒绝事件
  process.on('unhandledRejection', (reason, promise) => {
    log.error('监听到未处理的 Promise 拒绝事件，unhandledRejection 事件触发', reason, promise);
    app.exit();
  })
  ```

- 渲染进程配置
  ```js
  // 捕获同步错误
  window.onerror = function (message, source, lineno, colno, error) {
      console.error('捕获到同步错误:', { message, source, lineno, colno, error });
      // 这里可以添加上报错误的逻辑
  };
  
  // 捕获未处理的 Promise 拒绝
  window.onunhandledrejection = function (event) {
      console.error('捕获到未处理的 Promise 拒绝:', event.reason);
      // 这里可以添加上报错误的逻辑
  };
  
  export function setupGlobalErrorHandler(app) {
      app.config.errorHandler = (err, vm, info) => {
          console.error('捕获到 Vue 错误:', { err, vm, info });
          // 这里可以添加上报错误的逻辑
      }
  }
  ```
  
## 进程间通信
### 主进程和渲染进程之间
- send -> on
- invoke -> handle

### 渲染进程和渲染进程之间
不通过主进程转发，直接利用 [BroadcastChannel](https://developer.mozilla.org/zh-CN/docs/Web/API/BroadcastChannel) 广播的形式渲染进程直接通信。

## BrowserWindow 中 icon 属性的影响范围
- 窗口的标题栏：在窗口的左上角（在 macOS 上）或左上角（在 Windows 和 Linux 上）。
- 任务栏：在 Windows 上，窗口的图标会显示在任务栏中。
- Alt+Tab 切换窗口时：在 Windows 和 Linux 上，使用 Alt+Tab 切换窗口时会显示窗口的图标

## 开发环境下 Dock 栏图标如何设置
```js
app.on('ready', () => {
    // 设置 Dock 图标
    app.dock.setIcon(appIcon);

});
```

## package.json 中增加 `"postinstall": "electron-builder install-app-deps"`
> To ensure your native dependencies are always matched electron version, simply add script To ensure your native dependencies are always matched electron version, simply add script "postinstall": "electron-builder install-app-deps" to your package.json.

要确保您的本机依赖项始终匹配电子版本，只需添加脚本要确保您的本机依赖项始终匹配电子版本，只需添加脚本 "postinstall": "electron-builder install-app-deps" 给你的 package.json 。
> “本机依赖项始终与 Electron 版本匹配”指的是确保你的项目中使用的所有本机模块（如那些使用 node-gyp 编译的模块）与当前使用的 Electron 版本兼容。由于 Electron 使用了自定义的 Node.js 版本和 V8 引擎，直接使用 npm 安装的本机模块可能与 Electron 不兼容。因此，需要重新编译这些本机模块以确保它们与 Electron 版本匹配。

## 打包不同项目版本
> 具体实现: [build-multiple-versions.js](https://github.com/yd160513/demo/blob/main/scripts/build-multiple-versions.js)  

### 整体流程:
每个版本会有对应的配置，遍历配置，将版本的配置覆盖 electron-builder 的配置，依次执行 build 命令。

#### 1. 定义多个版本的配置。
```js
// 定义多个版本的配置
const versions = [
    { name: 'demo-v1', version: '0.0.1', appId: 'com.demo.app.v1' },
    { name: 'demo-v2', version: '0.0.2', appId: 'com.demo.app.v2' },
    // 可以继续添加更多版本
];
```
#### 2. 定义脚本，遍历版本配置，将版本的配置覆盖 electron-builder 的配置，依次执行打包命令。
```js
// 读取 package.json 文件
const packageJsonPath = path.resolve(__dirname, './../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

versions.forEach((config) => {
  // 修改 package.json 中的字段
  packageJson.name = config.name;
  packageJson.version = config.version;
  packageJson.build.appId = config.appId;
  packageJson.build.directories.output = `dist/pc/${config.name}-v${config.version}`;

  // 写回 package.json 文件
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');

  // 执行打包命令
  try {
    execSync('npm run build:pc', { stdio: 'inherit' });
  } catch (error) {
    console.error(`打包 ${config.name} 失败:`, error);
  }
});
```