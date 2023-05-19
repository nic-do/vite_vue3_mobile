<template>
  <div class="pageRoot">
    <transition name="nav-animation">
      <van-nav-bar
        class="page-nav"
        ref="navBar"
        v-if="nav && nav.show"
        :fixed="nav && nav.fixed"
        :placeholder="nav && nav.placeholder"
        :clickable="nav && nav.clickable"
        :border="nav && nav.border"
        :safe-area-inset-top="nav && nav.safeAreaInsetTop"
        :left-arrow="nav && nav.leftArrow"
        :z-index="nav ? nav.zIndex : 100"
        :title="nav ? nav.title : '标题'"
        :left-text="nav ? nav.leftText : '返回'"
        :right-text="nav ? nav.rightText : ''"
        @click-left="clickLeft"
        @click-right="clickRight"
      >
        <template v-if="$slots.right" #right>
          <slot name="right" />
        </template>
        <template v-if="$slots.left" #left>
          <slot name="left" />
        </template>
        <template v-if="$slots.title" #title>
          <slot name="title" />
        </template>
      </van-nav-bar>
    </transition>
    <div
      ref="pagebody"
      class="page-body"
      :class="{
        'page-scroll': pageScroll,
        'nav-no-holder': nav && nav.show && !nav.placeholder && !fullPage,
        'nav-holder': nav && nav.show && nav.placeholder && !fullPage,
        'full-h': !nav || !nav.show || fullPage
      }"
    >
      <slot name="body">
        <van-empty :description="pageUnSetError" />
      </slot>
      <van-back-top v-if="pageScroll && isready" class="page-root-part" target=".page-body" />
    </div>
  </div>
</template>

<script>
import { ref, provide, isRef, computed, nextTick, inject } from 'vue'
import PageNavDef from '@/components/page/page-nav-def'
export default {
  name: 'page-root',
  inject: ['navParams'],
  props: {
    pageScroll: {
      type: Boolean,
      default: true
    },
    fullPage: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    let pagebody = ref('pagebody')
    const i18n_t = inject('i18n_t')
    const pageUnSetError = computed(() => {
      return i18n_t('common.pageUnSetError')
    })

    provide('PageBody', pagebody)
    let navDef = PageNavDef.config({
      title: computed(() => {
        // 直接赋值 无响应式，是否有其他方式？？？
        return i18n_t('default.nav.title')
      }),
      leftText: computed(() => {
        return i18n_t('default.nav.leftText')
      }),
      clickLeft: function () {
        return true
      }
    })
    return {
      pageUnSetError,
      //不能少，用于big-list autoHeight计算
      pagebody,
      navDef,
      i18n_t
    }
  },
  computed: {
    nav: function () {
      var pp = this.navParams
      var vv = pp ? (isRef(pp) ? pp.value.nav : pp.nav) : null
      // this.resetNav(0)
      return vv || this.navDef
    }
  },
  watch: {
    pageScroll: {
      deep: true,
      immediate: true,
      handler() {}
    }
  },
  data() {
    return {
      isready: false
    }
  },
  mounted() {
    setTimeout(() => {
      this.isready = true
    }, 1000)
  },
  activated() {
    if (this.scrollTop != undefined) {
      this.$refs.pagebody.scrollTop = this.scrollTop
    }
  },
  deactivated() {
    if (this.$refs.pagebody) {
      this.scrollTop = this.$refs.pagebody.scrollTop
    }
  },
  updated() {},
  beforeUnmount() {},
  methods: {
    clickLeft() {
      if (!this.nav || !this.nav.clickable) {
        //属性设置无效，响应过滤
        return
      }
      if (this.nav.clickLeft != undefined) {
        if (this.nav.clickLeft()) {
          this.$router.go(-1)
        }
      } else {
        this.$router.go(-1)
      }
    },
    clickRight() {
      if (!this.nav || !this.nav.clickable) {
        //属性设置无效，响应过滤
        return
      }
      if (this.nav.clickRight != undefined) {
        this.nav.clickRight()
      }
    }
  }
}
</script>

<style scoped>
.nav-animation-enter-from {
  opacity: 0;
  transform: translateY(-92px);
}
.nav-animation-leave-to {
  opacity: 0;
  transform: translateY(-92px);
}
.nav-animation-leave-active,
.nav-animation-enter-active {
  transition: ease-in-out 0.25s;
}
</style>
<style lang="scss" scoped>
.pageRoot {
  width: 100vw;
  height: 100vh;
}

.page-body {
  width: 100vw;
}
.full-h {
  height: 100vh;
}
.nav-no-holder {
  /*
使用固定高度，是因为 滚动后切换页面，会页面跳动，未找到解决方法
*/
  padding-top: var(--van-nav-bar-height);
  height: calc(100vh - var(--van-nav-bar-height));
}
.nav-holder {
  /*
使用固定高度，是因为 滚动后切换页面，会页面跳动，未找到解决方法
*/
  height: calc(100vh - var(--van-nav-bar-height));
}
</style>
