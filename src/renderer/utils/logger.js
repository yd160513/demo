import log from 'electron-log'

// 创建 console 方法与 electron-log 方法的映射
const methodMapping = {
    log: log.info,
    info: log.info,
    warn: log.warn,
    error: log.error,
    debug: log.debug,
    trace: log.verbose,
};

// 重写 console 方法。开发环境下方便调试则不重写 console 方法
import.meta.env.MODE === 'development' && Object.keys(methodMapping).forEach(method => {
    console[method] = methodMapping[method].bind(log);
});