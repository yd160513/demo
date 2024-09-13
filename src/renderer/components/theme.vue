<script setup>
import { ref, watch } from 'vue'

// 主题种类
const FOLLOW_SYSTEM = 'follow'
const LIGHT = 'light'
const DARK = 'dark'

// 当前主题
const currentTheme = ref('')
// 跟随系统时的临时主题
const tempTheme = ref('')
// 系统的主题
const media = window.matchMedia('(prefers-color-scheme: dark)')

watch(currentTheme, (val, oldVal) => {
  if (!val) {
    return console.log('watch currentTheme', 'val is empty')
  }

  if (val === LIGHT || val === DARK) {
    document.documentElement.setAttribute('data-theme', val)
  }

  // 主题切换过程中的动态效果
  document.body.classList.add('theme-transition')
  setTimeout(() => {
    document.body.classList.remove('theme-transition')
  }, 500) // 动态效果持续时间

})

watch(tempTheme, (val, oldVal) => {
  console.log('watch tempTheme', val)
  if (!val) {
    return console.log('watch tempTheme', 'val is empty')
  }

  if (val === LIGHT || val === DARK) {
    document.documentElement.setAttribute('data-theme', val)
  }

  // 主题切换过程中的动态效果
  document.body.classList.add('theme-transition')
  setTimeout(() => {
    document.body.classList.remove('theme-transition')
  }, 500) // 动态效果持续时间
})

// 获取本地存储的主题
const getLocalTheme = () => {
  const curr = localStorage.getItem('theme')
  console.log('getLocalTheme', curr)
  return curr
}

// 设置主题到本地存储
const setLocalTheme = (theme) => {
  if (!theme) {
    return console.log('setLocalTheme', 'theme is empty')
  }
  const curr = getLocalTheme()
  if (curr === theme) {
    return console.log('setLocalTheme', 'theme is same')
  }
  console.log('setLocalTheme', theme)
  localStorage.setItem('theme', theme)
}

const themeChangeHandler = (val) => {
  console.log('themeChangeHandler', currentTheme.value)
  setLocalTheme(currentTheme.value)
  changeTheme(currentTheme.value)
}

const init = () => {
  console.log('init')
  const theme = getLocalTheme()

  console.log('init theme', theme)

  // 本地存储中没有主题时，设置为默认主题(浅色)
  if (!theme) {
    console.log('init', 'no theme')
    currentTheme.value = LIGHT
    return setLocalTheme(currentTheme.value)
  }

  changeTheme(theme)

}

// 切换主题处理
const changeTheme = (theme) => {
  console.log('changeTheme', theme)

  currentTheme.value = theme
  console.log('切换 app 主题为', theme)

  // 本地存储中的主题为浅色/深色，应用当前主题
  if (theme === LIGHT || theme === DARK) {
    /**
     * 如果不重置会有问题:
     * 1. 系统为深色，应用默认选择浅色
     * 2. app 切换为跟随系统，再切换到浅色
     * 3. app 再切换到跟随系统，app 的主题不会跟随系统切换到深色
     * 原因就是在 2 中切换到跟随系统时 tempTheme 已经被设置为深色了，切换到浅色时 tempTheme 依然是深色，再次切换到跟随系统时，因为 tempTheme 还是深色，所以不会触发 tempTheme 的 watch，也就不会触发主题的切换。
     */
    tempTheme.value = ''

    media.removeEventListener('change', systemThemeChange)
    console.log('系统主题切换监听已被移除')
    return
  }

  // 本地存储中的主题为跟随系统，获取当前系统主题，监听系统主题变化
  if (theme === FOLLOW_SYSTEM) {
    tempTheme.value = media.matches ? DARK : LIGHT
    console.log('系统主题为', tempTheme.value)

    media.addEventListener('change', systemThemeChange)

    console.log('media2', media)
    console.log('系统主题切换监听已添加')
  }
}

// 系统主题切换 callback
const systemThemeChange = (e) => {
  console.log('systemThemeChange', e)
  tempTheme.value = e.matches ? DARK : LIGHT
  console.log('系统主题切换为', tempTheme.value)
}

init()


/**
 * 1: 浅色
 * 2: 深色
 * 3: 跟随系统
 */

</script>

<template>
  <div class="theme">
    <div class="tip">
      切换主题 demo
    </div>
    <div class="btn-box">
      <el-radio-group @change="themeChangeHandler" v-model="currentTheme">
        <el-radio :value="'light'">浅色</el-radio>
        <el-radio :value="'dark'">深色</el-radio>
        <el-radio :value="'follow'">跟随系统</el-radio>
      </el-radio-group>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>