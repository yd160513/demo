<script setup>
import router from "./../router/index.js";

const goto = (name) => {
  if (!name) return console.log('gotoWatermark', 'name is required');
  console.log('goto', name);
  router.push({ name });
}
</script>

<template>
  <div class="menus">
    <el-button type="primary" @click="goto('watermark')">水印</el-button>
    <el-button type="primary" @click="goto('theme')">主题切换</el-button>
  </div>
</template>

<style scoped lang="scss"></style>
