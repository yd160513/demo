const { app, BrowserWindow, net, protocol, crashReporter, nativeImage } = require('electron');
const path = require('path');
const { pathToFileURL } = require('url');
const logger = require('./logger')
const { compressLogFilesToZip, getLogDirectory, formatDate, sendToRenderer, ipcMainOn, ipcMainInvoke} = require('./utils');

logger.info('日志文件存储目录: ', getLogDirectory())
logger.debug('应用启动时间: ', formatDate(new Date(), 'datetime', true));

// 是否是开发环境
const isDev = !app.isPackaged;
logger.info('是否是开发环境:', isDev);

// 应用图标
const appIcon = nativeImage.createFromPath(path.join(__dirname, '../../public/icons/png/256x256.png'));

// 开发环境下启动热更新
if (isDev) {
    require('electron-reload')(__dirname, {
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

// 统一不同平台的崩溃日志存储路径
app.setPath('crashDumps', path.join(app.getPath('userData'), 'crashes'));
// 启动崩溃报告器
crashReporter.start({
    uploadToServer: false
})

// 监听渲染进程崩溃事件
app.on('render-process-gone', (event, webContents, details) => {
    logger.error('渲染进程奔溃，render-process-gone 事件触发', details);
})
// 监听子进程崩溃事件
app.on('child-process-gone', (event, details) => {
    logger.error('子进程奔溃，child-process-gone 事件触发', details);
})
// 监听未捕获的 JavaScript 异常事件
process.on('uncaughtException', (error) => {
    logger.error('监听到未捕获的 JavaScript 异常事件，uncaughtException 事件触发', error);
    app.exit();
})
// 监听未处理的 Promise 拒绝事件
process.on('unhandledRejection', (reason, promise) => {
    logger.error('监听到未处理的 Promise 拒绝事件，unhandledRejection 事件触发', reason, promise);
    app.exit();
})

// 赋予该自定义协议特定的权限（如安全性、标准协议特性等）
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true, stream: true } }
])

function createOtherWindow() {
    const win = new BrowserWindow({
        width: 500,
        height: 500,
        icon: appIcon,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
        },
    });

    win.loadURL('http://localhost:5173/other');

    win.webContents.on('did-finish-load', () => {
        logger.info('did-finish-load callback 触发，Loaded URL:', win.webContents.getURL());
    });

    win.once('ready-to-show', () => {
        logger.info('ready-to-show 事件触发');
        sendToRenderer(win, 'readyToShow', 'test other window')
    })
}

function createMainWindow() {
    logger.info('preload.js 的加载路径:', path.join(__dirname, 'preload.js'));
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: appIcon,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
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
        logger.info('did-finish-load callback 触发，Loaded URL:', win.webContents.getURL());
        logger.info('启动定时器，5秒后压缩日志文件')
        setTimeout(() => {
            logger.info('开始压缩日志文件');
            compressLogFilesToZip().then(zipFilePath => {
                logger.info('日志文件压缩完成，压缩包路径:', zipFilePath);
            })
        }, 5000);
    });

    win.once('ready-to-show', () => {
        logger.info('ready-to-show 事件触发');
        sendToRenderer(win, 'readyToShow', 1, 2, 3)
    })

}

ipcMainOn('createTestWindow', () => {
    logger.info('ipcMainOn createTestWindow callback');
    createOtherWindow();
})

ipcMainOn('testToMain', (event, ...args) => {
    logger.info('ipcMainOn testToMain callback:', ...args);
});

ipcMainInvoke('testToMainWithResponse', (event, ...args) => {
    logger.info('ipcMainOn testToMainWithResponse callback:', ...args);
    return 'testToMainWithResponse response';
})

app.on('ready', () => {

    // 设置 dock 图标(开发环境下生效)
    app.dock.setIcon(appIcon)

    // 使用 protocol.handle 注册自定义协议 app
    protocol.handle('app', async (request) => {
        logger.info('request.url:', request.url, __dirname);
        // request.url 是 win.loadURL 传入的: app://dist/web/index.html。
        const url = request.url.slice('app://'.length); // 去掉 'app://' 部分
        const filePath = path.normalize(path.join(__dirname, '../../', url))
        logger.info('filePath: ', filePath);
        const fileUrl = pathToFileURL(filePath).toString();
        logger.info('fileUrl:', fileUrl);

        return net.fetch(fileUrl);
    });

    // // 注册自定义协议 app TODO: 这种方式在后续版本被废弃
    // protocol.registerFileProtocol('app', (request, callback) => {
    //     // request.url 是 win.loadURL 传入的: app://dist/web/index.html。
    //     const url = request.url.slice('app://'.length); // 去掉 'app://' 部分
    //     const filePath = path.normalize(path.join(__dirname, '../../', url))
    //     logger.info('app protocol:', __dirname, filePath);
    //     callback({ path: filePath });
    // });

    createMainWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
    }
});

// 应用退出
app.on('before-quit', () => {
    logger.info('before-quit 事件触发');
    app.exit()
});
