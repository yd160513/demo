const log = require('electron-log');
const path = require('path');
const fs = require('fs');
const { removeSync, formatDate } = require('./utils');
const archiver = require("archiver");

// 设置日志文件名基础名称
log.transports.file.fileName = `${formatDate(new Date(), 'date', true)}.log`;

// 控制台打印内容格式化为年-月-日 时:分:秒.毫秒 [级别] 内容。(注意: 这里格式化的是控制台中的，并不是文件中的。)
log.transports.console.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';

// 禁止日志文件轮转（轮转: 日志文件的轮转通过设置 maxSize 属性来实现。当日志文件的大小超过 maxSize 时，日志文件会被压缩并重命名为 .old.log，然后创建一个新的日志文件继续记录日志。）
log.transports.file.maxSize = 0; // 日志文件的最大大小（以字节为单位）。当日志文件超过此限制时，它将被移动到{文件名}.old.logfile。将其设置为 0 以禁用日志轮转。

// resolvePathFn 方法每调用一次日志打印都会调用一次。
log.transports.file.resolvePathFn = (variables, message) => {
    const logPath = path.join(variables.libraryDefaultDir, `${formatDate(new Date(), 'date', true)}.log`);
    return logPath
}

// 获取日志存储目录
const getLogDirectory = () => {
    /**
     * electron-log 日志存储目录
     * ---
     * path.dirname() 的作用:
     * eg: logPath 为 /home/user/docs/file.txt
     * path.dirname(logPath) 为 /home/user/docs
     */
    const logPath = path.dirname(log.transports.file.getFile().path);
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

    log.info('七天之前的日志文件: ', expiredFiles);

    expiredFiles.forEach(file => {
        const filePath = path.join(logDir, file);
        removeSync(filePath);
        console.log(`Deleted old log file: ${filePath}`);
    })
    log.info('删除七天之前的日志文件完成');
}

// 压缩日志目录中的日志文件
const compressLogFilesToZip = (logDir, zipFileName) => {
    return new Promise((resolve, reject) => {
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
            console.log(`Compressed ${archive.pointer()} total bytes`);
            console.log(`Zip file has been created at: ${zipFilePath}`);
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

log.info(`日志存储目录: ${getLogDirectory()}`);
deleteOldLogs();

module.exports = {
    log,
    getLogDirectory,
    compressLogFilesToZip,
}