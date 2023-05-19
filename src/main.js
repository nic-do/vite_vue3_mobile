import { createApp } from 'vue'
import App from './App.vue'
import pluginsLibs from '@/plugins-libs'

const app = createApp(App)
/*其他自定义参数-begin*/

/*其他自定义参数-end*/
pluginsLibs.config(app)
// app.mount('#app')
