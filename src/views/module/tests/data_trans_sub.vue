<script setup name="data_trans_sub">
import data_trans from './data_trans.vue'
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
// //页面根节点
// import PageRoot, { PageNavDef } from '@/components/page/index'
// import { useChildren, useParent } from '@vant/use'
// import { useRouter } from 'vue-router'
// import { showConfirmDialog} from 'vant'
//
// const router = useRouter()
// const props = defineProps(['relationKey'])
// // const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
// // const router = useRouter()
// ////////////////////////////////////
// const { parent } = useParent(props.relationKey)
// //通过parent调用父组件通过linkChildren提供数据和方法
//
// //将relationKey 通过 props 传递给子组件
// const relationKey = Symbol('data_trans-relation-Symbol')
// const { linkChildren } = useChildren(relationKey)
// const calledByChild = function () {}
// // 向子组件提供数据和方法
// linkChildren({ calledByChild })
// /////////////////////////////////////
//
// const i18n_t = inject('i18n_t')
//
// const navDef = reactive({
//   nav: PageNavDef.config({
//     show: true,
//     clickable: true,
//     leftArrow: false,
//     placeholder: true,
//     title: computed(() => {
//       // 直接赋值 无响应式，是否有其他方式？？？
//       return i18n_t('main.nav.title')
//     }),
//     leftText: computed(() => {
//       return i18n_t('main.nav.leftText')
//     }),
//     clickLeft: function () {
//       return true
//     },
//     rightText: '关闭data',
//     clickRight: function () {
//       showConfirmDialog({
//         title: '标题',
//         message: '返回上一页或主页。',
//         confirmButtonText: '上一页',
//         cancelButtonText: '主页'
//       })
//         .then(() => {
//           // on confirm
//           router.goBack(-1, { data: 'backfrom data_trans 33' })
//         })
//         .catch(() => {
//           // on cancel
//           router.goBack('main', { data: 'backfrom data_trans 33' })
//         })
//       return false
//     }
//   })
// })
// //透传nav
// provide('navParams', navDef)
//
// const dataGet = ref('')
// onMounted(() => {
//   if (history.state.data) {
//     dataGet.value = history.state.data
//   }
// })
// onActivated(() => {})
// onDeactivated(() => {})

</script>
<template>
  <data_trans :subflag="1"></data_trans>
<!--  <page-root>-->
<!--    <template v-slot:left>-->
<!--      <van-icon name="manager" />-->
<!--    </template>-->
<!--    &lt;!&ndash;    <template v-slot:title><div>我的title</div></template>&ndash;&gt;-->
<!--    &lt;!&ndash;    <template v-slot:right><div>我的right</div></template>&ndash;&gt;-->
<!--    <template v-slot:body>-->
<!--      <div>我是data_trans</div>-->
<!--      <div>收到数据{{ dataGet }}</div>-->

<!--    </template>-->
<!--  </page-root>-->
</template>

<style scoped></style>
<style lang="scss" scoped></style>
