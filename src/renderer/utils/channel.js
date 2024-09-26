import { getPageName } from "./logger";

const CHANNEL_NAME = '[BroadcastChannel]'

let channel = null
let messageCallback = null
let subCmds = []

export const DEFAULT_SUB = []

export const onChannelMessage = (callback) => {
    messageCallback = callback
}

export const initChannel = (subIds = []) => {
    console.log(`${CHANNEL_NAME} init，subIds: `, subIds)
    subCmds = subIds
    return new Promise(resolve => {
        channel = new BroadcastChannel('renderer-channel')
        channel.addEventListener('message', (event) => {
            const data = JSON.parse(event.data)
            if (subCmds.includes(data.cmdId)) {
                console.log(`${CHANNEL_NAME} receive message: `, data)
                messageCallback && messageCallback(data)
            }
        })
        resolve()
    })
}

export const sendMsg = (cmdId, data) => {
    console.log(`${CHANNEL_NAME} send message: `, cmdId, data)
    if (!channel) return console.log(`${CHANNEL_NAME} channel is not init`)
    const jsonData = JSON.stringify({ cmdId, from: getPageName(), data })
    channel.postMessage(jsonData)
    console.log(`${CHANNEL_NAME} send message success, cmdId: ${cmdId}, data: `, data)
}