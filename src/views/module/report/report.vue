<script setup name="report">
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
  reactive
} from 'vue'
//页面根节点
import PageRoot, { PageNavDef } from '@/components/page/index'
import { useChildren, useParent } from '@vant/use'
import reportChild from '@/views/module/report/reportChild.vue'
import ReportChild from '@/views/module/report/reportChild.vue'
import ReportChild2 from '@/views/module/report/reportChild2.vue'
const props = defineProps(['relationKey'])
// const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
// const router = useRouter()
////////////////////////////////////
const parent = useParent(props.relationKey)
//将myRelationKey通过 props 传递给子组件
const relationKey = Symbol('report-relation-Symbol')
const { linkChildren } = useChildren(relationKey)
const calledByChild = function (val) {
  alert(val + '|' + calledByChildParams.value)
}
const calledByChildParams = reactive({
  value: '1111'
})
// 向子组件提供数据和方法
linkChildren({ calledByChild, calledByChildParams })
/////////////////////////////////////

onActivated(() => {})
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
      return true
    }
  })
})
//透传nav
provide('navParams', navDef)
</script>
<template>
  <page-root>
    <template v-slot:left>
      <van-icon name="manager" />
    </template>
    <!--    <template v-slot:title><div>我的title</div></template>-->
    <!--    <template v-slot:right><div>我的right</div></template>-->
    <template v-slot:body>
      <div>我是report</div>
      <report-child :relation-key="relationKey"> </report-child>
      <report-child2 :relation-key="relationKey"></report-child2>
    </template>
  </page-root>
</template>

<style scoped></style>
<style lang="scss" scoped></style>
