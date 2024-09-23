const log = require('electron-log');
const path = require('path');

// 获取文件基础名称
const getBaseName = () => {
    // 将日志名称按照当天日期命名
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month}-${day}`;
}
// 设置日志文件名基础名称
log.transports.file.fileName = `${getBaseName()}.log`;

// 控制台打印内容格式化为年-月-日 时:分:秒.毫秒 [级别] 内容。(注意: 这里格式化的是控制台中的，并不是文件中的。)
log.transports.console.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';

// resolvePathFn 方法每调用一次日志打印都会调用一次。
log.transports.file.resolvePathFn = (variables, message) => {
    const logPath = path.join(variables.libraryDefaultDir, `${getBaseName()}.log`);
    return logPath
}

// 获取日志存储目录
const getLogDirectory = () => {
    /**
     * electron-log 默认的日志存储目录
     * ---
     * path.dirname() 的作用:
     * eg: logPath 为 /home/user/docs/file.txt
     * path.dirname(logPath) 为 /home/user/docs
     */
    const defaultLogPath = path.dirname(log.transports.file.getFile().path);
    return defaultLogPath;
}

log.info(`日志存储目录: ${getLogDirectory()}`);

module.exports = {
    log,
    // getLogDirectory
}