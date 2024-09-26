const logger = require('electron-log');
const path = require('path');

const getCurrentDate = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${MM}-${dd}`;
};

logger.initialize();

// 设置日志文件名基础名称
logger.transports.file.fileName = `${getCurrentDate()}.log`;

// 控制台打印内容格式化为年-月-日 时:分:秒.毫秒 [级别] 内容。(注意: 这里格式化的是控制台中的，并不是文件中的。)
logger.transports.console.format = '{y}-{m}-{d} {h}:{i}:{s}.{ms} [{level}] {text}';

// 禁止日志文件轮转（轮转: 日志文件的轮转通过设置 maxSize 属性来实现。当日志文件的大小超过 maxSize 时，日志文件会被压缩并重命名为 .old.log，然后创建一个新的日志文件继续记录日志。）
logger.transports.file.maxSize = 0; // 日志文件的最大大小（以字节为单位）。当日志文件超过此限制时，它将被移动到{文件名}.old.logfile。将其设置为 0 以禁用日志轮转。

// resolvePathFn 方法每调用一次日志打印都会调用一次。
logger.transports.file.resolvePathFn = (variables, message) => {
    const logPath = path.join(variables.libraryDefaultDir, `${getCurrentDate()}.log`);
    return logPath
}

logger.info('logger initialized ================');

module.exports = logger