const { contextBridge, ipcRenderer } = require('electron');
const logger = require('electron-log')

contextBridge.exposeInMainWorld('electron', {
    send: (channel, data) => {
        logger.info(`[ipcRenderer] send, channel=${channel}, args=${JSON.stringify(data)}`);
        ipcRenderer.send(channel, data);
    },
    invoke: (channel, data) => {
        logger.info(`[ipcRenderer] invoke, channel=${channel}, args=${JSON.stringify(data)}`);
        return ipcRenderer.invoke(channel, data);
    },
    on: (channel, callback) => {
        logger.info(`[ipcRenderer] on, channel=${channel}`);
        return ipcRenderer.on(channel, (event, ...args) => callback(...args));
    },
})
