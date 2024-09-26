const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');
const archiver = require("archiver");
const logger = require('./logger')
const packageJson = require('../../package.json');

const projectName = packageJson.name;
const projectVersion = packageJson.version;

// 删除指定路径下的文件或目录
const removeSync = (targetPath) => {
    // 检查目录是否存在
    if (fs.existsSync(targetPath)) {
        // 获取目标目录的文件状态信息
        const stats = fs.statSync(targetPath);
        // 目录
        if (stats.isDirectory()) {
            // 遍历目录中的每个文件或子目录，递归调用 removeSync 方法删除它们
            fs.readdirSync(targetPath).forEach(file => {
                const curPath = path.join(targetPath, file);
                removeSync(curPath);
            });
            // 删除空目录
            fs.rmdirSync(targetPath);
        }
        // 文件
        else {
            // 删除文件
            fs.unlinkSync(targetPath);
        }
    }
}

// 获取日志存储目录
const getLogDirectory = () => {
    /**
     * electron-logger 日志存储目录
     * ---
     * path.dirname() 的作用:
     * eg: logPath 为 /home/user/docs/file.txt
     * path.dirname(logPath) 为 /home/user/docs
     */
    const logPath = path.dirname(logger.transports.file.getFile().path);
    return logPath;
}

// 删除七天之前的日志文件
const deleteOldLogs = () => {
    const logDir = getLogDirectory();
    // 读取日志目录下的所有文件
    const files = fs.readdirSync(logDir);
    const now = new Date();

    // 过滤出七天之前的日志文件
    const expiredFiles = files.filter(file => {
        const filePath = path.join(logDir, file);
        const stats = fs.statSync(filePath);
        const fileAgeInDays = (now - new Date(stats.mtime)) / (1000 * 60 * 60 * 24);
        return fileAgeInDays > 7;
    });

    logger.info('七天之前的日志文件: ', expiredFiles);

    expiredFiles.forEach(file => {
        const filePath = path.join(logDir, file);
        removeSync(filePath);
        logger.info(`Deleted old logger file: ${filePath}`);
    })
    logger.info('删除七天之前的日志文件完成');
}

// 压缩日志目录中的日志文件
const compressLogFilesToZip = () => {
    return new Promise((resolve, reject) => {
        const compressDate = formatDate(new Date(), 'datetime', true);
        const logDir = getLogDirectory();
        const zipFileName = `${projectName}-${projectVersion}-logs_${compressDate}.zip`;
        // 读取目录下的所有文件
        const files = fs.readdirSync(logDir);
        // 过滤出所有 .log 文件
        const logFiles = files.filter(file => file.endsWith('.log'));

        // 创建一个写入流，用于生成 zip 压缩包
        const zipFilePath = path.join(logDir, zipFileName);
        const output = fs.createWriteStream(zipFilePath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // 设置压缩级别
        });

        // 监听流事件：完成和错误
        output.on('close', () => {
            logger.info(`Compressed ${archive.pointer()} total bytes`);
            logger.info(`Zip file has been created at: ${zipFilePath}`);
            resolve(zipFilePath);
        });

        archive.on('error', (err) => {
            reject(err);
        });

        // 将压缩包的输出流绑定到文件流
        archive.pipe(output);

        // 将所有 .log 文件添加到压缩包中
        logFiles.forEach(file => {
            const filePath = path.join(logDir, file);
            archive.file(filePath, { name: file });
        });

        // 完成压缩过程
        archive.finalize();
    })
}

const _formatNormalize = (formatter) => {

    if (typeof formatter === 'function') return formatter

    if (typeof formatter !== 'string') {
        throw new TypeError('formatter must be a function or a string')
    }

    if (formatter === 'date') {
        formatter = 'yyyy-MM-dd'
    } else if (formatter === 'datetime') {
        formatter = 'yyyy-MM-dd HH:mm:ss'
    }

    const formatterFunc = (dateInfo) => {
        const {yyyy, MM, dd, HH, mm, ss, ms} = dateInfo

        return formatter.replaceAll('yyyy', yyyy).replaceAll('MM', MM).replaceAll('dd', dd).replaceAll('HH', HH).replaceAll('mm', mm).replaceAll('ss', ss).replaceAll('ms', ms)
    }

    return formatterFunc
}

/**
 * 格式化时间
 */
const formatDate = (date, formatter, isPad = false) => {
    logger.info('待格式化的时间:', date)
    formatter = _formatNormalize(formatter)
    const dateInfo = {
        yyyy: date.getFullYear(),
        MM: isPad ? String(date.getMonth() + 1).padStart(2, '0') : date.getMonth() + 1,
        dd: isPad ? String(date.getDate()).padStart(2, '0') : date.getDate(),
        HH: isPad ? String(date.getHours()).padStart(2, '0') : date.getHours(),
        mm: isPad ? String(date.getMinutes()).padStart(2, '0') : date.getMinutes(),
        ss: isPad ? String(date.getSeconds()).padStart(2, '0') : date.getSeconds(),
        ms: isPad ? String(date.getMilliseconds()).padStart(3, '0') : date.getMilliseconds()
    }
    const formattedDate = formatter(dateInfo)
    logger.info('格式化后的时间:', formattedDate)
    return formattedDate
}

// 主进程向渲染进程发送消息
const sendToRenderer = (window, channel, ...data) => {
    logger.info(`[ipcMain] send, channel=${channel}, args: `, ...data);
    window.webContents.send(channel, ...data);
}

// 主进程通过 on 监听渲染进程发来的消息
const ipcMainOn = (channel, callback) => {
    logger.info(`[ipcMain] on, channel=${channel}`);
    ipcMain.on(channel, callback);
}

// 主进程通过 invoke 监听渲染进程发来的消息
const ipcMainInvoke = (channel, callback) => {
    logger.info(`[ipcMain] invoke, channel=${channel}`);
    ipcMain.handle(channel, callback);
}

module.exports = {
    removeSync,
    getLogDirectory,
    deleteOldLogs,
    compressLogFilesToZip,
    formatDate,
    sendToRenderer,
    ipcMainOn,
    ipcMainInvoke
}