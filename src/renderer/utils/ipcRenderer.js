export const onReadToShow = (callback) => {
    window.electron.on('readyToShow', (...args) => {
        console.log('[ipcRenderer] onReadToShow', ...args)
        callback(...args)
    })
}

export const testToMain = () => {
    console.log('[ipcRenderer] testToMain')
    window.electron.send('testToMain', { msg: 'hello' })
}

export const testToMainWithResponse = () => {
    console.log('[ipcRenderer] testToMainWithResponse')
    return window.electron.invoke('testToMainWithResponse', { msg: 'hello main' })
}

export const createTestWindow = () => {
    console.log('[ipcRenderer] createTestWindow')
    window.electron.send('createTestWindow')
}