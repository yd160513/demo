<script setup>
import { onMounted } from 'vue'
import {onReadToShow, testToMain, testToMainWithResponse} from "../../utils/ipcRenderer";
import {initChannel, onChannelMessage, sendMsg} from "../../utils/channel";

const channelHandler = () => {

  onChannelMessage((message) => {
    console.log('收到渲染进程间发来的消息，onChannelMessage 触发: ', message)

    sendMsg('syncInfo', 'syncInfo message from index.vue')

  })

  const subIds = ['syncInfo']
  initChannel(subIds).then(() => {
    console.log('initChannel success')
  }).catch(err => {
    console.error('initChannel error', err)
  })

  sendMsg('syncInfo', 'syncInfo message from index.vue')

}

onMounted(() => {
  console.log('App.vue mounted')


  onReadToShow((...data) => {
    console.log('onReadToShow', ...data)

    channelHandler()

  })

  testToMain()

  testToMainWithResponse().then(res => {
    console.log('testToMainWithResponse 响应: ', res)
  })

})

</script>

<template>
  <div class="root">
    123
    <router-view></router-view>
  </div>
</template>

<style lang="scss" scoped>
.root {
  width: 100%;
  height: 100%;
}
</style>
