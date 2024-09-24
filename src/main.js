import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './renderer/styles/light.css'
import './renderer/styles/dark.css'
import './renderer/styles/global.css'
import App from './renderer/App.vue'
import router from './renderer/router/index.js'
import './renderer/utils/logger'
import { setupGlobalErrorHandler } from './renderer/utils/errorHandler'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)

// 设置全局错误处理器
setupGlobalErrorHandler(app)

app.mount('#app')
