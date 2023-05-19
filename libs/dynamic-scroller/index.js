import { defineAsyncComponent } from 'vue'
import config from './config'
// import RecycleScroller from './components/RecycleScroller.vue'
// import DynamicScroller from './components/DynamicScroller.vue'
// import DynamicScrollerItem from './components/DynamicScrollerItem.vue'
// export {
//   RecycleScroller,
//   DynamicScroller,
//   DynamicScrollerItem,
// }
export { default as IdState } from './mixins/IdState'
function registerComponents (app, prefix) {
  // app.component(`${prefix}recycle-scroller`, RecycleScroller)
  // app.component(`${prefix}RecycleScroller`, RecycleScroller)
  // app.component(`${prefix}dynamic-scroller`, DynamicScroller)
  // app.component(`${prefix}DynamicScroller`, DynamicScroller)
  // app.component(`${prefix}dynamic-scroller-item`, DynamicScrollerItem)
  // app.component(`${prefix}DynamicScrollerItem`, DynamicScrollerItem)
  //异步注册
  app.component(
      `${prefix}recycle-scroller`,
      defineAsyncComponent(() => import('./components/RecycleScroller.vue'))
  )
  app.component(
      `${prefix}RecycleScroller`,
      defineAsyncComponent(() => import('./components/RecycleScroller.vue'))
  )
  app.component(
      `${prefix}dynamic-scroller`,
      defineAsyncComponent(() => import('./components/DynamicScroller.vue'))
  )
  app.component(
      `${prefix}DynamicScroller`,
      defineAsyncComponent(() => import('./components/DynamicScroller.vue'))
  )
  app.component(
      `${prefix}dynamic-scroller-item`,
      defineAsyncComponent(() => import('./components/DynamicScrollerItem.vue'))
  )
  app.component(
      `${prefix}DynamicScrollerItem`,
      defineAsyncComponent(() => import('./components/DynamicScrollerItem.vue'))
  )
}
const plugin = {
  // eslint-disable-next-line no-undef
  install (app, options) {
    const finalOptions = Object.assign({}, {
      installComponents: true,
      componentsPrefix: '',
    }, options)

    for (const key in finalOptions) {
      if (typeof finalOptions[key] !== 'undefined') {
        config[key] = finalOptions[key]
      }
    }

    if (finalOptions.installComponents) {
      registerComponents(app, finalOptions.componentsPrefix)
    }
  },
}

export default plugin
