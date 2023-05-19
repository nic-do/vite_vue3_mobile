<template>
  <page-root>
    <template v-slot:left>
      <van-icon name="manager" />
    </template>
    <!--    <template v-slot:title><div>我的title</div></template>-->
    <!--    <template v-slot:right><div>我的right</div></template>-->
    <template v-slot:body>
      <div>我是reportChild</div>
    </template>
  </page-root>
</template>

<script>
import { ref, computed, reactive, getCurrentInstance, provide, inject, nextTick } from 'vue'
import PageRoot, { PageNavDef } from '@/components/page/index'
import { useChildren, useParent } from '@vant/use'

export default {
  name: 'reportChild',
  components: { PageRoot }, //option 模式需要声明
  props: ['relationKey'],
  setup(props, context) {
    //const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
    //通过父组件提供的relationKey,获取 父组件
    const { parent } = useParent(props.relationKey)
    parent.calledByChildParams.value = '3333'
    parent.calledByChild('我是reportChild')
    //通过parent调用父组件通过linkChildren提供数据和方法
    ////////////////////////////////////
    //将relationKey 通过 props 传递给子组件
    const myRelationKey = Symbol('reportChild-relation-Symbol')
    const { linkChildren } = useChildren(myRelationKey)
    const calledByChild = function (val) {}
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
    return {
      parent,
      navDef,
      i18n_t,
      myRelationKey,
      calledByChild
    }
  },
  data() {
    return {}
  },
  created() {},
  mounted() {
    console.log('--reportChild-goBackResult--', this.goBackResult)
    this.init()
  },
  activated() {
    this.init()
  },
  deactivated() {},
  beforeUnmount() {},
  methods: {
    init() {
      nextTick(() => {})
    }
  }
}
</script>

<style scoped></style>
<style lang="scss" scoped></style>
