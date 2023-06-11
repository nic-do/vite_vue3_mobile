import { createApp } from 'vue'
import App from './App-study.vue'
import pluginsLibs from '@/plugins-libs'

import bus from '@/utils/wujie/event-bus'
import { setupApp, preloadApp } from 'wujie'
if (window.__POWERED_BY_WUJIE__) {
  ////////////////////无界微前端-子工程-再套一个/////////////////////////////
  setupApp({
    name: 'secproject',
    url: '//192.168.3.4:8080/test2/secproject/#/',
    exec: true,
    sync: true
  })
  preloadApp({ name: 'secproject' })
  bus.on('to-trdproject',function (data){
    alert(JSON.stringify(data))
  })
}
///////////////////////////////////////////////
const app = createApp(App)
/*其他自定义参数-begin*/
app.config.globalProperties.$pj_name = 'trdproject'
/*其他自定义参数-end*/
pluginsLibs.config(app)

