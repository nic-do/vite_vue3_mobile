<script setup name="mainhome">
import {
  provide,
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  onActivated,
  onDeactivated,
  reactive,
  getCurrentInstance,
  inject
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showDialog, showNotify } from 'vant'
import { useChildren } from '@vant/use'
//国际化
import i18n from '@/i18n'
import { themeStore } from '@/stores/theme'
//页面根节点
import PageRoot, { PageNavDef } from '@/components/page/index'
import FTab from '@/views/module/main/childs/FTab.vue'
import STab from '@/views/module/main/childs/STab.vue'
import TTab from '@/views/module/main/childs/TTab.vue'
import ThemeManager from '@/theme'
import ThemeLoad from '@/utils/theme/theme-load'
import ThemeStyle from '@/utils/theme/theme-style'
const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy

const route = useRoute()
const router = useRouter()
onMounted(() => {})
onActivated(() => {
  let goBackResult = history.state.goBackResult || route.params.goBackResult
  if (goBackResult) {
    showNotify({ type: 'danger', message: JSON.stringify(goBackResult) })
  }
  console.log('--main-goBackResult--', goBackResult)
})
onDeactivated(() => {})

const i18n_t = inject('i18n_t')

const navDef = reactive({
  nav: PageNavDef.config({
    show: true,
    clickable: true,
    leftArrow: false,
    placeholder: true,
    title: computed(() => {
      // 直接赋值 无响应式，是否有其他方式？？？
      return i18n_t('main.nav.title')
    }),
    leftText: computed(() => {
      return i18n_t('main.nav.leftText')
    }),
    clickLeft: function () {
      showPopupLeft.value = true
    }
  })
})
//透传nav
provide('navParams', navDef)
//
const page = ref('page')
const swipeWidth = ref(0)
const callNextTick = function () {
  nextTick(function () {
    swipeWidth.value = page.value.$el.clientWidth / 3
  })
}
callNextTick()

const tabbarActive = ref(0)
const tabbarIcon = ref({
  active: 'https://fastly.jsdelivr.net/npm/@vant/assets/user-active.png',
  inactive: 'https://fastly.jsdelivr.net/npm/@vant/assets/user-inactive.png'
})

const animName = ref('vue-page-animation-left')
const tabbarBeforeChange = function (val) {
  if (tabbarActive && (val > tabbarActive.value || val < tabbarActive.value)) {
    if (val > tabbarActive.value) {
      animName.value = 'vue-page-animation-left'
    } else if (val < tabbarActive.value) {
      animName.value = 'vue-page-animation-right'
    }
    return true
  }
  return false
}

const RELATION_KEY = Symbol('my-relation')
const { linkChildren } = useChildren(RELATION_KEY)
const objScrollTop = reactive({})
const setScrollTop = (key, scrollTop) => {
  objScrollTop[key] = scrollTop
}
const getScrollTop = (key) => {
  return objScrollTop[key]
}

const changeLan = function () {
  let curLang = i18n.useCurrentLang().value
  actions.forEach((item) => {
    item.disabled = item.name == curLang
    item.color = item.disabled ? '#ee0a24' : 'black'
  })
  showActionSheet.value = true
}

// 向子组件提供数据和方法
linkChildren({ setScrollTop, getScrollTop, changeLan })

const showPopupLeft = ref(false)
const showActionSheet = ref(false)
const actions = reactive([])
const files = import.meta.glob('@/i18n/messages/vantlang/*.mjs') // 自定义规则
for (let i in files) {
  const newName = i.replace(/\/i18n\/messages\/vantlang\//, '').replace(/.mjs/, '')
  actions.push({
    name: newName
  })
}
const onSelect = async function (item) {
  showActionSheet.value = false
  await i18n.useLocale(item.name)
}

const change = async function (type) {
  if (type == 0) {
    changeLan()
  } else if (type == 1) {
    let cssname = 'green'
    let themeVars = ThemeStyle.themeVars()
    themeVars.background2 = cssname
    let scode = ThemeStyle.config(cssname, themeVars)
    ThemeLoad.loadCssCode(scode, cssname)
    themeStore().setData(cssname, themeVars)
  }
}
</script>
<template>
  <page-root ref="page" class="main-page" :page-scroll="false">
    <template v-slot:left>
      <van-icon name="manager" />
    </template>
    <!--    <template v-slot:title><div>我的title</div></template>-->
    <!--    <template v-slot:right><div>我的right</div></template>-->
    <template v-slot:body>
      <van-action-sheet
        v-model:show="showActionSheet"
        :actions="actions"
        :cancel-text="'取消'"
        description="语言切换"
        @select="onSelect"
      />
      <!-- 左侧弹出 -->
      <van-popup
        v-model:show="showPopupLeft"
        position="left"
        :style="{ width: '60%', height: '100%' }"
      >
        <van-cell-group>
          <van-cell
            style="margin-top: 10px"
            icon="manager"
            title="manager"
            value="内容"
            label="描述信息"
          />
          <theme-manager />
          <van-cell title="切换语言" value="内容" label="切换语言" @click="change(0)" />
          <van-cell title="切换主题" value="内容" label="黑白主题" @click="change(1)" />
        </van-cell-group>
      </van-popup>
      <transition :name="animName">
        <f-tab
          :relation-key="RELATION_KEY"
          class="page-scroll"
          v-if="tabbarActive == 0"
          :class="{
            'no-nav': !navDef.nav.show,
            'nav-holder': navDef.nav.show && navDef.nav.placeholder,
            'nav-no-holder': navDef.nav.show && !navDef.nav.placeholder
          }"
        />
        <s-tab
          :relation-key="RELATION_KEY"
          class="page-scroll"
          v-else-if="tabbarActive == 1"
          :class="{
            'no-nav': !navDef.nav.show,
            'nav-holder': navDef.nav.show && navDef.nav.placeholder,
            'nav-no-holder': navDef.nav.show && !navDef.nav.placeholder
          }"
        />
        <t-tab
          :relation-key="RELATION_KEY"
          class="tab-page page-scroll"
          v-else-if="tabbarActive == 2"
          :class="{
            'no-nav': !navDef.nav.show,
            'nav-holder': navDef.nav.show && navDef.nav.placeholder,
            'nav-no-holder': navDef.nav.show && !navDef.nav.placeholder
          }"
        />
        <van-empty v-else></van-empty>
      </transition>

      <!--          注：截止目前 tabbar的 route模式存在 首次显示空白的问题-->
      <van-tabbar v-model="tabbarActive" :before-change="tabbarBeforeChange" safe-area-inset-bottom>
        <van-tabbar-item v-wave badge="3">
          <span>首页</span>
          <template #icon="props">
            <img :src="props.active ? tabbarIcon.active : tabbarIcon.inactive" />
          </template>
        </van-tabbar-item>
        <van-tabbar-item v-wave icon="search">推荐</van-tabbar-item>
        <van-tabbar-item v-wave icon="setting-o">个人</van-tabbar-item>
      </van-tabbar>
    </template>
  </page-root>
</template>

<style scoped>
.no-nav {
  height: calc(100vh - var(--van-tabbar-height));
}
.nav-holder {
  height: calc(100vh - var(--van-tabbar-height) - var(--van-nav-bar-height));
}
.nav-no-holder {
  /*padding-top: var(--van-nav-bar-height);*/
  height: calc(100vh - var(--van-tabbar-height) - var(--van-nav-bar-height));
}
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
  transition: ease-in-out 0.25s;
}
</style>