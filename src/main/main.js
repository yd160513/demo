// const { app, BrowserWindow, protocol } = require('electron');
// const path = require('path');
import { app, BrowserWindow, net, protocol } from 'electron';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import log from 'electron-log';

// 获取当前模块的文件路径和目录名
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

log.info('__dirname', __dirname, path.join(__dirname, '../../'))

// 是否是开发环境
const isDev = !app.isPackaged;
log.info('isDev:', isDev);

// 赋予该自定义协议特定的权限（如安全性、标准协议特性等）
protocol.registerSchemesAsPrivileged([
    { scheme: 'app', privileges: { secure: true, standard: true, stream: true } }
])

function createWindow() {
    log.info('preload.js ======', __dirname, path.join(__dirname, 'preload.js'));
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'), // 改为 .cjs，否则 preload 会识别为 CommonJS，但是项目整体采用的是 ESModule，就会报错。
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
        log.info('Loaded URL:', win.webContents.getURL());
    });

}

app.on('ready', () => {

    // 使用 protocol.handle 注册自定义协议 app
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
    console.log('before-quit');
    app.exit()
});