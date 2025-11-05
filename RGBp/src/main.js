// src/main.js
import { createApp } from 'vue'
import App from './App.vue'

// 解决 Naive UI 的字体和图标问题
import naive from 'naive-ui'

const app = createApp(App)
app.use(naive) // 注册 Naive UI
app.mount('#app')
