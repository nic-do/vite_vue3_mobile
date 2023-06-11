<script setup name="test_wujie">
import {
  ref,
  computed,
  watch,
  defineProps,
  getCurrentInstance,
  provide,
  inject,
  nextTick,
  onActivated,
  onDeactivated,
  reactive,
  onMounted
} from 'vue'
//页面根节点
import PageRoot, { PageNavDef } from '@/components/page/index'
import { useChildren, useParent } from '@vant/use'
import WujieVue from 'wujie-vue3'
import bus from '@/utils/wujie/event-bus'

const props = defineProps(['relationKey'])
const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
// const router = useRouter()
////////////////////////////////////
const { parent } = useParent(props.relationKey)
//通过parent调用父组件通过linkChildren提供数据和方法

//将relationKey 通过 props 传递给子组件
const relationKey = Symbol('test_wujie-relation-Symbol')
const { linkChildren } = useChildren(relationKey)
const calledByChild = function () {}
// 向子组件提供数据和方法
linkChildren({ calledByChild })
/////////////////////////////////////

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
      return true
    }
  })
})
//透传nav
provide('navParams', navDef)
onMounted(() => {
  let data = {
    name: 'trdproject',
    url: '//192.168.3.4:8080/test/trdproject/#/'
  }
  if (history.state.data) {
    data = history.state.data
  } else {
    setTimeout(function () {
      if (proxy.$wj_main) {
        bus.emit('to-trdproject', { type: 'from-main', msg: 'hello trdproject' })
      }
    }, 1500)
  }
  name.value = data.name
  url.value = data.url

    console.log('-----222---',name.value+'|'+url.value)
})
onActivated(() => {})
onDeactivated(() => {})
const name = ref(null)
const url = ref(null)
</script>
<template>
  <div>
<!--    <div>{{ name }}</div>-->
    <!--单例模式，name相同则复用一个无界实例，改变url则子应用重新渲染实例到对应路由 -->
    <div v-if="url">
      <WujieVue width="100%" height="100%" :name="name" :url="url" :sync="true"></WujieVue>
    </div>
  </div>
</template>

<style scoped></style>
<style lang="scss" scoped></style>
