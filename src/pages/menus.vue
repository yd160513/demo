<script setup>
import router from "./../router/index.js";

const gotoWatermark = () => {
  console.log('gotoWatermark', router);
  router.push({ name: "watermark" });
}
</script>

<template>
  <div class="menus">
    <el-button type="primary" @click="gotoWatermark">水印</el-button>
  </div>
</template>

<style scoped lang="scss"></style>
