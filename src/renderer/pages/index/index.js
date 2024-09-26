import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@renderer/styles/light.css'
import '@renderer/styles/dark.css'
import '@renderer/styles/global.css'
import Index from './index.vue'
import router from '@renderer/router'
import { setPageName } from '@renderer/utils/logger'
import { setupGlobalErrorHandler } from '@renderer/utils/errorHandler'

setPageName('index')

const app = createApp(Index)
app.use(ElementPlus)
app.use(router)

// 设置全局错误处理器
setupGlobalErrorHandler(app)

app.mount('#app')
