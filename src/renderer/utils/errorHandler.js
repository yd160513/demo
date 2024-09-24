// 捕获同步错误
window.onerror = function (message, source, lineno, colno, error) {
    console.error('捕获到同步错误:', { message, source, lineno, colno, error });
    // 这里可以添加上报错误的逻辑
};

// 捕获未处理的 Promise 拒绝
window.onunhandledrejection = function (event) {
    console.error('捕获到未处理的 Promise 拒绝:', event.reason);
    // 这里可以添加上报错误的逻辑
};

export function setupGlobalErrorHandler(app) {
    app.config.errorHandler = (err, vm, info) => {
        console.error('捕获到 Vue 错误:', { err, vm, info });
        // 这里可以添加上报错误的逻辑
    }
}
