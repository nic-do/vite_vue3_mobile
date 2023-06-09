import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'
import router from '@/router'

//配置一些常用的全局样式
import '@/assets/main.css'

//按需要 是否要使用i18n
import i18n from '@/i18n'
//
import uiLibs from '../libs/ui-libs'
//按需要 缩减内部的动画库
import animLibs from '../libs/anim-libs'

///////////////////////////////////////
import VConsole from 'vconsole'
if (import.meta.env.DEV) {
  const vConsole = new VConsole(/*{ theme: 'dark' }*/)
  //vConsole.destroy()
}
///////////////////////////////////////
import { keepAliveStore } from '@/stores/keepalive'

async function config(app) {
  app.config.unwrapInjectedRef = true
  // 1. 错误异常处理
  app.config.errorHandler = (err, vm, info) => {
    console.error(err, vm, info)
  }
  app.config.warnHandler = (err, vm, info) => {
    console.warn(err, vm, info)
  }
  //自定义全局变量----begin----
  app.config.globalProperties.$useSvgLoad = true
  // if (import.meta.env.DEV) {
  //     app.config.globalProperties.$mockTest = mockTest
  // }

  //自定义全局变量----end----
  const pinia = createPinia()
  pinia.use(piniaPersist)
  app.use(pinia)

  uiLibs.config(app)
  animLibs.config(app)
  app.use(i18n.i18n)

  //改写route----begin----
  // 必要时，可以改写一些route的东西
  // 可以在其他地方修改，动态管理route
  // route.routes.forEach((item, index, array)=>{
  //     if (router.router.hasRoute(item))
  //         router.router.removeRoute(item)
  //     router.router.addRoute(item)
  // })
  //改写route-----end----
  router.router.addDynamicRoute()
  app.use(router.router)
  app.mixin({
    //注：无法操作 setup
    created() {
      keepAliveStore().removeAllAfter(this.$route.name)
    },
    mounted() {
      keepAliveStore().removeAllAfter(this.$route.name)
    },
    activated() {
      keepAliveStore().removeAllAfter(this.$route.name)
    },
    beforeUnmount() {},
    deactivated() {}
  })

  //如果aframe a-标签报错，添加以下代码
  // 将所有标签前缀为 `a-` 的标签视为自定义元素 a-frame用到
  // 如果无效，将此配置写到vite.conifig里
  //   app.config.compilerOptions.isCustomElement = (tag) => {
  //     return tag.startsWith('a-')
  //   }
  app.mount('#app')
}
export default { config }

console.log(' VITE_HI: ', import.meta.env.VITE_HI)
console.log(' VITE_BASE_URL: ', import.meta.env.VITE_BASE_URL)
console.log(' VITE_DEV_PRO_DATA: ', import.meta.env.VITE_DEV_PRO_DATA)
console.log(' VITE_BASE_URL: ', import.meta.env.BASE_URL)
console.log(' VITE_MODE: ', import.meta.env.MODE) //应用运行的模式 development
console.log(' VITE_PROD: ', import.meta.env.PROD) //应用是否运行在生产环境
console.log(' VITE_DEV: ', import.meta.env.DEV) //应用是否运行在开发环境, (永远与PROD相反)。
console.log(' VITE_SSR: ', import.meta.env.SSR) //应用是否运行在 server 上
