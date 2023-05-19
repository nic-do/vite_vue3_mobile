<template>
  <!--  1、在pageRoot中写死了高度，开启overflow：scroll-y页面内滚动，在deactive和active处理偏移
        注：同目录下的 page不可以用在这里，问题有点大
-->
  <!--  2、不设置页面高度，使用浏览器的默认滚动；存在的问题 页面滚动后，再来回切换，会有跳动
         跳动原因是 window.document.scrollingElement的scrollTop 切换前自动改变，未找到处理方法
-->
  <!--  缺点：第一种需要 自己处理，可能处理的情况较多；优点是不会右跳动
           第二种 可以全局处理，但是上述问题暂时无解-->
  <!-- 如果用第一种 beforeEnter到cancelAnimation 都可以不用监听-->
  <!-- 如果是第二种 beforeEnter到cancelAnimation 需要监听，如下逻辑已完成-->
  <!--  :mode="mode" appear :name="transitionName" -->
  <transition
    :name="animationName"
    @before-enter="beforeEnter"
    @before-leave="beforeLeave"
    @after-leave="afterLeave"
    @after-enter="afterEnter"
    @enter-cancelled="cancelAnimation"
    @leave-cancelled="cancelAnimation"
  >
    <slot></slot>
  </transition>
</template>

<script>
import { keepAliveStore } from '@/stores/keepalive'
import PositionFixer from './position-fixer'
import StateHelper from './state-helper'

export default {
  props: {
    forceTransitionName: {
      default: ''
    },
    // 链接驱动保存位置吗
    driveByUrl: {
      default: false
    }
  },
  computed: {
    animationName: function () {
      return this.transitionName
    }
  },
  data() {
    let keepAlives = keepAliveStore()
    return {
      keepAlives: keepAlives,
      transitionName: 'vue-page-animation-fade'
    }
  },

  created() {
    this.positionFixer = new PositionFixer({})
    this.stateHelper = new StateHelper(this.driveByUrl)
    this.watchRouter()
  },

  beforeUnmount() {
    this.unwatchRouter()
  },

  activated() {
    this.watchRouter()
  },

  deactivated() {
    this.unwatchRouter()
  },

  methods: {
    watchRouter() {
      if (!this._unwatchRouter) {
        this._unwatchRouter = this.$watch('$route', (to, from) => {
          let isForward = to.isForward
          let isBack = to.isBack
          if (!this._isWatchingRouter) {
            return
          }
          if (to.matched && to.matched.length > 1) {
            //
            this.transitionName = 'vue-page-animation-fade'
            console.log('transitionName-to', this.transitionName + '-' + to.name)
            return
          }
          let lastScrollY = this._lastScrollY || 0
          if (from._lastScrollY != undefined) {
            lastScrollY = from._lastScrollY || 0
            // console.log('--_lastScrollY--',from._lastScrollY)
          }
          // 触发这个函数时，history.state 的值，已经更变了，浏览器的高度，也被重置了
          // 唯一的困难，就是把变化前的浏览器高度，给弄回来~~~

          const stateHelper = this.stateHelper
          const positionFixer = this.positionFixer

          stateHelper.update()
          stateHelper.saveLastPosition(lastScrollY)

          let transitionName = this.forceTransitionName || ''

          if (!transitionName) {
            //浏览器手势滑动导致的前进后退跟踪
            let _touch_change = sessionStorage.getItem('_touch_change')
            sessionStorage.removeItem('_touch_change')
            let isTouchHappened = _touch_change == '1' || _touch_change == '2'
            if (_touch_change == '1') {
              console.log('---', '可能是侧滑')
            } else if (_touch_change == '2') {
              console.log('---', '可能是侧滑-flip')
            }
            if (isTouchHappened) {
              transitionName = 'vue-page-animation-none'
              this.keepAlives.addData(to.name)
            } else if (stateHelper.isPageBack() || isBack) {
              //返回上一页
              transitionName = 'vue-page-animation-right'
              this.keepAlives.removeData(from.name)
            } else if (stateHelper.isPageForward() || isForward) {
              //下一页
              transitionName = 'vue-page-animation-left'
              this.keepAlives.addData(to.name)
            } else {
              transitionName = 'vue-page-animation-fade'
              this.keepAlives.addData(to.name)
            }
          }

          this.transitionName = transitionName
          console.log('transitionName-to', transitionName + '-' + to.name)
        })
      }

      this._isWatchingRouter = true
    },

    unwatchRouter() {
      // @notcie 如果通过 beforeEach 添加的钩子，则可以把这个 if 判断删除
      if (this._calculateScroll) {
        const hooks = this.$router.beforeHooks
        const fn = this._calculateScroll
        if (hooks && hooks.indexOf(fn) >= 0) {
          this.$router.beforeHooks.splice(hooks.indexOf(fn), 1)
        }
        this._calculateScroll = null
      }

      this._isWatchingRouter = false
    },

    beforeLeave(el) {
      const positionFixer = this.positionFixer
      const stateHelper = this.stateHelper

      positionFixer.lockScroll()

      this._leaveFixer = positionFixer.fixElementPos(
        el,
        stateHelper.getLastPosition() || 0,
        'beforeLeave'
      )
      // console.log('_leaveFixer',this._leaveFixer)
    },

    beforeEnter(el) {
      const positionFixer = this.positionFixer
      const stateHelper = this.stateHelper

      // @notice 如果强制指定切换后的滚动位置，则按指定的来修复
      let scrollY = null
      if (stateHelper.isPageBack()) {
        scrollY = el.getAttribute('data-vue-paga-animation-back')
      } else if (stateHelper.isPageForward()) {
        scrollY = el.getAttribute('data-vue-paga-animation-forward')
      }
      scrollY = scrollY || stateHelper.getCurrentPosition()

      positionFixer.lockScroll()
      this._enterFixer = positionFixer.fixElementPos(el, scrollY, 'beforeEnter')
      // console.log('_enterFixer',this._enterFixer)
    },

    afterLeave() {
      const positionFixer = this.positionFixer
      positionFixer.unlockScroll()
      if (!this.stateHelper.isPageBack()) this._leaveFixer && this._leaveFixer.clear()
      this._leaveFixer = null
      if (this.transitionName != '') {
        setTimeout(() => {
          this.transitionName = ''
        }, 10)
      }
    },

    afterEnter(el) {
      const positionFixer = this.positionFixer
      positionFixer.unlockScroll()
      const isFixWindowScroll = true
      this._enterFixer && this._enterFixer.clear(isFixWindowScroll)
      this._enterFixer = null

      if (this.transitionName != '') {
        setTimeout(() => {
          this.transitionName = ''
        }, 10)
      }
    },

    cancelAnimation() {
      this.afterLeave()
      this.afterEnter()
    }
  }
}
</script>

<style scoped>
.vue-page-animation-left-enter-from,
.vue-page-animation-right-leave-to {
  transform: translateX(65vw);
}
.vue-page-animation-left-leave-to,
.vue-page-animation-right-enter-from {
  transform: translateX(-65vw);
}
/*时长*/
.vue-page-animation-left-leave-active,
.vue-page-animation-left-enter-active,
.vue-page-animation-right-leave-active,
.vue-page-animation-right-enter-active,
.vue-page-animation-fade-enter-active,
.vue-page-animation-fade-leave-active {
  position: absolute;
  top: 0;
  transition: ease-in-out 0.25s;
}

/*首次进入 淡入淡出*/
.vue-page-animation-fade-enter-active,
.vue-page-animation-fade-leave-to {
  opacity: 0.6;
}
.vue-page-animation-fade-enter-to,
.vue-page-animation-fade-leave-active {
  opacity: 1;
}

/*给侧滑用的 */
.vue-page-animation-none-active,
.vue-page-animation-none-leave-to {
  opacity: 0;
  display: none;
}
.vue-page-animation-none-enter-to,
.vue-page-animation-none-leave-active {
  opacity: 0;
  display: none;
}
</style>
