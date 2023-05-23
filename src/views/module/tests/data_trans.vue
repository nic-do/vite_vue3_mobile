<script setup name="data_trans">
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
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showNotify } from 'vant'

const route = useRoute()
const router = useRouter()
const props = defineProps(['relationKey', 'subflag'])
const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
// const router = useRouter()
////////////////////////////////////
const { parent } = useParent(props.relationKey)
//通过parent调用父组件通过linkChildren提供数据和方法

//将relationKey 通过 props 传递给子组件
const relationKey = Symbol('data_trans-relation-Symbol')
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
    },
    rightText: '关闭data',
    clickRight: function () {
      if (route.name == 'data_trans_sub_next') {
        router.goBack(-2, { data: 'backfrom ' + route.name + ' 99' })
      } else {
        showConfirmDialog({
          title: '标题',
          message: '返回上一页或主页。',
          confirmButtonText: '上一页',
          cancelButtonText: '主页'
        })
          .then(() => {
            // on confirm
            router.goBack(-1, { data: 'backfrom ' + route.name + ' 77' })
          })
          .catch(() => {
            // on cancel
            router.goBack('main', { data: 'backfrom ' + route.name + ' 88' })
          })
      }

      return false
    }
  })
})
//透传nav
provide('navParams', navDef)

const dataGet = ref('')
const dataGetSub = ref('')
onMounted(() => {
  if (history.state.data) {
    dataGet.value = history.state.data
  }
})
onActivated(() => {
  let goBackResult = history.state.goBackResult || route.params.goBackResult
  if (goBackResult) {
    dataGetSub.value = JSON.stringify(goBackResult)
  }
})
onDeactivated(() => {})
const goSub = function () {
  let name = 'data_trans_sub'
  if (props.subflag == 1) {
    name = 'data_trans_sub_next'
  }
  router.push({
    name: name,
    state: {
      data: { userId: '123', from: route.name + ' 发送' }
    }
  })
}
</script>
<template>
  <page-root>
    <template v-slot:left>
      <van-icon name="manager" />
    </template>
    <!--    <template v-slot:title><div>我的title</div></template>-->
    <!--    <template v-slot:right><div>我的right</div></template>-->
    <template v-slot:body>
      <div v-if="props.subflag == 1">
        <div>我是sub</div>
        <div v-if="dataGet">收到上一页数据{{ dataGet }}</div>
        <div v-if="dataGetSub">收到 返回数据{{ dataGetSub }}</div>
        <van-button @click="goSub">跳转 next</van-button>
      </div>
      <div v-else-if="props.subflag == 2">
        <div>我是next</div>
        <div v-if="dataGet">收到上一页数据{{ dataGet }}</div>
      </div>
      <div v-else>
        <div>我是data_trans</div>
        <div v-if="dataGet">收到上一页数据{{ dataGet }}</div>
        <div v-if="dataGetSub">收到sub 返回数据{{ dataGetSub }}</div>
        <van-button @click="goSub">跳转 data_trans_sub</van-button>
      </div>
    </template>
  </page-root>
</template>

<style scoped></style>
<style lang="scss" scoped></style>
