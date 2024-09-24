const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

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

const _formatNormalize = (formatter) => {

    if (typeof formatter === 'function') return formatter

    if (typeof formatter !== 'string') {
        throw new TypeError('formatter must be a function or a string')
    }

    if (formatter === 'date') {
        formatter = 'yyyy-MM-dd'
    } else if (formatter === 'datetime') {
        formatter = 'yyyy-MM-dd hh:mm:ss'
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
    // log.info('待格式化的时间:', date)
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
    // log.info('格式化后的时间:', formattedDate)
    return formattedDate
}

module.exports = {
    removeSync,
    formatDate
}