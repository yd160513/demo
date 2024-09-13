import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './renderer/styles/light.css'
import './renderer/styles/dark.css'
import './renderer/styles/global.css'
import App from './renderer/App.vue'
import router from './renderer/router/index.js'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)

app.mount('#app')
