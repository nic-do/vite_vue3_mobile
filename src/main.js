import { createApp } from 'vue'
import App from './App.vue'
import pluginsLibs from '@/plugins-libs'
import {testInit} from './test-wujie'
import bus from '@/utils/wujie/event-bus'
const app = createApp(App)
/*其他自定义参数-begin*/
if (location.href.indexOf('wj_main')>0){
    app.config.globalProperties.$wj_main = true
    bus.on('to-main',function (data){
        window.alert(JSON.stringify(data))
    })
    testInit()
}
/*其他自定义参数-end*/
pluginsLibs.config(app, (data) => {

})
// app.mount('#app')
