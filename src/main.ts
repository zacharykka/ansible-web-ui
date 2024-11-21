import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './style.css'
import App from './App.vue'
import router from './router'
import Sidebar from './components/Sidebar.vue'
import Content from './components/Content/index.vue'
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'

const app = createApp(App)

app.use(Antd)
app.use(router)
app.component(<string>Sidebar.name, Sidebar)
app.component(<string>Content.name, Content)
app.component(<string>Header.name, Header)
app.component(<string>Footer.name, Footer)

app.mount('#app')
