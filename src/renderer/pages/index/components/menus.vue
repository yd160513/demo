<script setup>
import router from "@renderer/router";
import { createTestWindow } from '@renderer/utils/ipcRenderer'
import {onMounted} from "vue";

const goto = (name) => {
  if (!name) return console.log('gotoWatermark', 'name is required');
  console.log('goto', name);
  router.push({ name });
}

const openTestWindow = () => {
  console.log('openTestWindow');

  createTestWindow()

}

onMounted(() => {

})

</script>

<template>
  <div class="menus">
    <el-button type="primary" @click="goto('watermark')">水印</el-button>
    <el-button type="primary" @click="goto('theme')">主题切换</el-button>
    <el-button type="primary" @click="openTestWindow">打开另一个窗口测试渲染进程间通信</el-button>
  </div>
</template>

<style scoped lang="scss"></style>
