////配合postcss-viewport-units处理兼容问题--begin
import viewportunitsbuggyfillhacks from 'viewport-units-buggyfill/viewport-units-buggyfill.hacks'
import viewportunitsbuggyfill from 'viewport-units-buggyfill'
viewportunitsbuggyfill.init({
  hacks: viewportunitsbuggyfillhacks
})
////配合postcss-viewport-units处理兼容问题--end
//////////////////////////////////////

///////////////////////////////////////////
// 测试 unplugin-vue-components 按需加载的效果，需要去掉的全局引入的
// vant4.2 按需加载 功能正常但是 样式不正常，因此使用全量引入
// vant4.3.1 按需引入目前显示均正常

// 全局引入
// import vant from 'vant'
// import 'vant/lib/index.theme'

// nplugin-vue-components按需引入额外的需要引入的部分
// Vant 中有个别组件是以函数的形式提供的，包括 Toast，Dialog，Notify 和 ImagePreview 组件。）
// Toast
import { showToast } from 'vant'
import 'vant/es/toast/style'
// Dialog
import { showDialog } from 'vant'
import 'vant/es/dialog/style'
// Notify
import { showNotify } from 'vant'
import 'vant/es/notify/style'
// ImagePreview
import { showImagePreview } from 'vant'
import 'vant/es/image-preview/style'
///////////////////////////////////////////
import { Lazyload } from 'vant'
// import VueLazyload from 'vue-lazyload'
// // 此lazy-load与 vant的重复 只需一次即可
// app.use(VueLazyload, lazyloadOptions)

//图片懒加载 回调
const lazyloadOptions = {
  filter: {
    progressive(listener, options) {
      //备注：van-image组件 不需要处理，而且其listener.el是div，img是其子节点
      //解决原生img 使用v-lazy:src=''后不显示的问题
      if (listener.el){
        if (listener.el.tagName=='IMG'&&
            listener.el.src!=listener.src){
          listener.el.src=listener.src
        }
      }
    },
    // webp(listener, options) {
    //   //考虑编译速度及热更新相关问题，DEV环境还是照旧
    //   if (import.meta.env.PROD) {
    //     let src = listener.src
    //     if (isSupportWebp() && webpTest.test(src)) {
    //       //对指定格式文件替换成webp；前提要有
    //       console.log('-----', '如果支持webp，放开此处代码')
    //       // let idx = src.lastIndexOf('.')
    //       // if (idx > 0) {
    //       //     listener.src =src.substring(0, idx)+ '.webp'
    //       // }
    //     }
    //   }
    // }
  }
}

import DynamicScroller from './dynamic-scroller'
import { defineAsyncComponent } from 'vue'
const config = function (app) {
  ///////////////////////////////////////////
  // 使用unplugin-vue-components 按需加载的效果，不能同时全局引用
  // app.use(vant)
  ////////////////////////////////////////////
  //配置Lazyload 自定义回调
  app.use(Lazyload, lazyloadOptions)
  app.use(DynamicScroller)
  // 异步注册
  app.component(
    'svg-icon',
    defineAsyncComponent(() => import('@/components/svg/SvgIcon.vue'))
  )
}
export default { config }
