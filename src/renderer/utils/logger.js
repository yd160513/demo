import logger from 'electron-log/renderer'

let pageName = ''

export const setPageName = (name) => {
    pageName = name
}

export const getPageName = (name) => {
    return pageName
}

// 创建 console 方法与 electron-log 方法的映射
const methodMapping = {
    log: logger.info,
    info: logger.info,
    warn: logger.warn,
    error: logger.error,
    debug: logger.debug,
    trace: logger.verbose,
};

console.log('import.meta.env.MODE: ', import.meta.env.MODE)

// 重写 console 方法。开发环境下方便调试则不重写 console 方法
// import.meta.env.MODE !== 'development' &&
Object.keys(methodMapping).forEach(method => {
    console[method] = (...args) => {
        methodMapping[method].call(logger.functions, `[from: ${getPageName()}]`, ...args);
    }
});


console.log('TEST LOG =========================================================')

setTimeout(() => {
    console.log('TEST LOG 2 =========================================================')
}, 10000)

logger.info('TEST LOG 3 logger')