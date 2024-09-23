const { app, BrowserWindow, net, protocol } = require('electron');
const path = require('path');
const { fileURLToPath, pathToFileURL } = require('url');
const { log } = require('./logger')
const reload = require('electron-reload')

// 是否是开发环境
const isDev = !app.isPackaged;
log.info('是否是开发环境:', isDev);

// 开发环境下启动热更新
if (isDev) {
    reload(__dirname, {
        electron: path.join(__dirname, '../../node_modules', '.bin', 'electron'),
        forceHardReset: true, // 主进程入口文件关联的所有文件发生变化时，强制重启；而不是只监听主进程入口文件这一个文件的变化。
        /**
         * 应用程序覆盖了一些默认设置 quit 或者 close 操作（例如，关闭最后一个应用程序窗口会隐藏该窗口而不是退出应用程序）。
         * 在这种情况下，应用程序可能不会重新启动，因为 Electron Reload 无法退出应用程序。
         * 为了解决这个问题，可以使用 hardResetMethod 选项来覆盖默认的退出操作。
         */
        hardResetMethod: 'quit'
    });
}

// 赋予该自定义协议特定的权限（如安全性、标准协议特性等）
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true, stream: true } }
])

function createWindow() {
    log.info('preload.js 的加载路径:', path.join(__dirname, 'preload.js'));
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // 开发环境采用本地地址，生产环境采用打包后的文件
    if (isDev) {
        win.loadURL('http://localhost:5173'); // Vue 项目运行的地址
    } else {
        win.loadURL(path.join('app://', 'dist/web/index.html'));
    }

    // 打印当前加载的 URL
    win.webContents.on('did-finish-load', () => {
        log.info('did-finish-load callback 触发，Loaded URL:', win.webContents.getURL());
    });

}

app.on('ready', () => {

    // 使用 protocol.handle 注册自定义协议 app
    protocol.handle('app', async (request) => {
        log.info('request.url:', request.url, __dirname);
        // request.url 是 win.loadURL 传入的: app://dist/web/index.html。
        const url = request.url.slice('app://'.length); // 去掉 'app://' 部分
        const filePath = path.normalize(path.join(__dirname, '../../', url))
        log.info('filePath: ', filePath);
        const fileUrl = pathToFileURL(filePath).toString();
        log.info('fileUrl:', fileUrl);

        return net.fetch(fileUrl);
    });

    // // 注册自定义协议 app TODO: 这种方式在后续版本被废弃
    // protocol.registerFileProtocol('app', (request, callback) => {
    //     // request.url 是 win.loadURL 传入的: app://dist/web/index.html。
    //     const url = request.url.slice('app://'.length); // 去掉 'app://' 部分
    //     const filePath = path.normalize(path.join(__dirname, '../../', url))
    //     log.info('app protocol:', __dirname, filePath);
    //     callback({ path: filePath });
    // });

    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// 应用退出
app.on('before-quit', () => {
    log.info('before-quit 事件触发');
    app.exit()
});
