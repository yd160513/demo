<script setup>
  import {onMounted} from "vue";
  import {initChannel, onChannelMessage, sendMsg} from "@renderer/utils/channel";
  import {onReadToShow} from "@renderer/utils/ipcRenderer";

  console.log('test other.vue log')

  const channelHandler = () => {

    onChannelMessage((message) => {
      console.log('收到渲染进程间发来的消息，onChannelMessage 触发: ', message)

    })

    const subIds = ['syncInfo']
    initChannel(subIds).then((channel) => {
      console.log('initChannel success')
    }).catch(err => {
      console.error('initChannel error', err)
    })

  }

  onMounted(() => {
    console.log('other.vue mounted')

    onReadToShow((...data) => {
      console.log('onReadToShow', ...data)

      channelHandler()

      console.log('测试: 5秒后向主窗口发送消息')
      // 测试: 5秒后向主窗口发送消息
      setTimeout(() => {
        console.log('测试: 向主窗口发送消息')
        sendMsg('syncInfo', 'syncInfo message from other.vue')
      }, 5000)

    })

  })

</script>

<template>
  <div class="root">
    这里是另外一个入口，
    在控制台中可看到渲染进程间通信日志。
  </div>
</template>

<style lang="scss" scoped>
.root {
  width: 100%;
  height: 100%;
}
</style>
