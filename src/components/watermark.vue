<script setup>

// 生成水印图片
import {onBeforeUnmount, onMounted} from "vue";

let observer = null;

// 生成水印
const createWatermark = (text, angle = 20) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const ratio = window.devicePixelRatio;
  console.log('ratio', ratio);
  const font = '20px Arial'
  ctx.font = font;

  // 获取文本在当前字体设置下的宽度和高度
  const metrics = ctx.measureText(text);
  const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  const textWidth = metrics.width;
  console.log('textWidth', textWidth, 'textHeight', textHeight);

  // 根据文本尺寸和旋转角度计算画布尺寸
  const radians = -angle * Math.PI / 180;
  const canvasWidth = Math.abs(textWidth * Math.cos(radians)) + Math.abs(textHeight * Math.sin(radians));
  const canvasHeight = Math.abs(textWidth * Math.sin(radians)) + Math.abs(textHeight * Math.cos(radians));
  canvas.width = canvasWidth + 10;
  canvas.height = canvasHeight + 10;

  // 在画布上绘制文本 TODO: 再次设置 font 的原因: 之前设置的 font 在调整 canvas 尺寸后会失效
  ctx.font = font;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  // 将画布的原点（0,0）移动到画布的中心位置。canvasWidth / 2 和 canvasHeight / 2 分别是画布宽度和高度的一半。
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  // 将画布的坐标系旋转指定的弧度
  ctx.rotate(radians);
  // 将文本的起始位置向左移动半个文本宽度
  ctx.fillText(text, -textWidth / 2, textHeight);

  return canvas.toDataURL('image/png');
}

// 添加水印
const addWatermark = () => {
  const watermarkDiv = document.getElementById('watermark');
  // 获取 class 为 watermark 的 div
  const watermarkParent = document.querySelector('.watermark');
  const dataURL = createWatermark('a水印测试1234567890水印测试1234567890b');

  console.log('addWatermark', dataURL);

  if (!watermarkDiv) {
    // TODO: 通过 createElement 创建的元素，给其应用样式表中定义的样式类，如果样式表使用了 scoped 则不会生效
    const newWatermarkDiv = document.createElement('div');
    newWatermarkDiv.id = 'watermark';
    newWatermarkDiv.style.backgroundImage = `url(${dataURL})`;
    watermarkParent.appendChild(newWatermarkDiv);
  } else {
    watermarkDiv.style.backgroundImage = `url(${dataURL})`;
  }

  console.log('注册监听');

  // 监听水印元素的变化，如果该元素被删除则重新添加
  observer = new MutationObserver((mutationsList) => {
    for (let mutation of mutationsList) {
      mutation.removedNodes.forEach((node) => {
        if (node.id === 'watermark') {
          addWatermark();
        }
      });
    }
  });

  observer.observe(watermarkParent, {childList: true});

}

// 移除水印
const removeWatermark = () => {
  let watermarkDiv = document.getElementById('watermark');
  console.log('removeWatermark', watermarkDiv, observer);

  if (watermarkDiv) {
    watermarkDiv.remove();
    watermarkDiv = null
  }
  if (observer) {
    observer.disconnect();
    observer = null
  }

}

onMounted(() => {
  addWatermark()

  // Test
  // setTimeout(() => {
  //   removeWatermark()
  // }, 5000)
})

onBeforeUnmount(() => {
  removeWatermark()
})

</script>

<template>
<div class="watermark">
  这里是水印 demo
  <div id="watermark"></div>
</div>
</template>

<style lang="scss">
#watermark {
  position: fixed;
  top: 0;
  left: 0;
  border: 1px solid red;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>