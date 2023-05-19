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

//支持替换webp的图片格式
const webpTest = /\.(jpe?g|png)/
let flag_isSupportWebp = null
const isSupportWebp = function () {
  //是否支持webp
  try {
    if (flag_isSupportWebp === null) {
      flag_isSupportWebp =
        document.createElement('canvas').toDataURL('image/webp', 0.5).indexOf('data:image/webp') ===
        0
    }
    return flag_isSupportWebp
  } catch (err) {
    return false
  }
}
console.log('--lazyloadOptions---', '如果lazyload 图片无法显示，尝试一下这里的逻辑')
//图片懒加载 回调
const lazyloadOptions = {
  filter: {
    progressive(listener, options) {
      //console.log('-----', '如果lazyload 图片无法显示，尝试一下这里的逻辑')
      //需要在vite.config.js做过配置
      // vue({template: { img: ['src', 'temp']}})
      //img temp属性 Lazyload-filer的progressive有关
      //如果出现无法 加载，尚未碰到过
      //<img alt="Vue logo" className="logo" v-lazy="imgpath2" width="125" height="125"/>
      //可以将 路径写在temp里，再在此处进行复值给src
      // <img v-lazy className="top-image" temp="./images/banner-new.png" />
      // 把temp的值赋给src
      // 似乎不需要用temp里的去
      // var vv=listener.el.attributes.getNamedItem('temp')
      // if (vv){
      //   listener.src = vv.value
      // }
    },
    webp(listener, options) {
      //考虑编译速度及热更新相关问题，DEV环境还是照旧
      if (import.meta.env.PROD) {
        let src = listener.src
        if (isSupportWebp() && webpTest.test(src)) {
          //对指定格式文件替换成webp；前提要有
          console.log('-----', '如果支持webp，放开此处代码')
          // let idx = src.lastIndexOf('.')
          // if (idx > 0) {
          //     listener.src =src.substring(0, idx)+ '.webp'
          // }
        }
      }
    }
  }
}

import DynamicScroller from './dynamic-scroller'
import SvgIcon from '@/components/svg/SvgIcon.vue'
const config = function (app) {
  ///////////////////////////////////////////
  // 使用unplugin-vue-components 按需加载的效果，不能同时全局引用
  // app.use(vant)
  ////////////////////////////////////////////
  //配置Lazyload 自定义回调
  app.use(Lazyload, lazyloadOptions)
  app.use(DynamicScroller)
  //全局注册svg-icon
  app.component('svg-icon', SvgIcon)
}
export default { config }
