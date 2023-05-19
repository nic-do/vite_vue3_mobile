<template>
  <page-root :pageScroll="true">
    <template v-slot:left>
      <van-icon name="manager" />
    </template>
    <!--    <template v-slot:title><div>我的title</div></template>-->
    <!--    <template v-slot:right><div>我的right</div></template>-->
    <template v-slot:body>
      <big-list
        ref="bigListRef"
        :config="config"
        :items="items.datas"
        @load="load($event, false)"
        @reload="load($event, true)"
      >
        <template v-slot:cell="{ scope }">
          <div
            class="van-hairline--bottom"
            style="display: flex; flex-direction: row; padding: 8px 10px"
            @click="rowClick(scope)"
          >
            <div class="avatar">
              <div style="width: 60px; height: 60px">
                <img
                  style="width: 60px; height: 60px"
                  class="icon"
                  :key="'avatar_' + scope.index"
                  v-prlx.mobile.background="{ speed: 10.12, fromBottom: true, custom: true }"
                />
                <!--                  :src="scope.data.avtar"-->
              </div>
            </div>
            <div
              style="display: flex; flex-direction: column; color: red; flex: 1; margin-left: 10px"
            >
              <span style="padding-bottom: 5px">
                {{ scope.data.title }}只在van-image中使用 --aspect-ratio
              </span>
              <span style="color: black">
                {{ scope.data.message }}只在van-image中使用 --aspect-ratio
              </span>
            </div>
          </div>
        </template>
      </big-list>
    </template>
  </page-root>
</template>

<script>
import { ref, getCurrentInstance, onActivated, provide, inject, nextTick } from 'vue'
import PageRoot, { PageNavDef } from '@/components/page/index'
import { useChildren, useParent } from '@vant/use'
import { useRouter } from 'vue-router'
import Is from '@/utils/is'
import BigList from '@/components/big-list'
import Api from '@/utils/axios/api'
import { showNotify } from 'vant'
export default {
  name: 'list_van',
  components: { PageRoot, BigList },
  props: ['relationKey'],
  setup(props, context) {
    //const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
    const router = useRouter(0)
    //通过父组件提供的relationKey,获取 父组件
    const { parent } = useParent(props.relationKey)
    //通过parent调用父组件通过linkChildren提供数据和方法
    ////////////////////////////////////
    //将relationKey 通过 props 传递给子组件
    const myRelationKey = Symbol('message-relation-Symbol')
    const { linkChildren } = useChildren(myRelationKey)
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
          router.goBack(-1, { data: 'backfrom list-van 333' })
          return false
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
    return {
      items: {
        datas: [] //显示的结束索引=start+length
      },
      config: {
        mode: 'vant'
      }
    }
  },
  created() {},
  mounted() {
     let name= getCurrentInstance().type.name
    if (history.state.data) {
      showNotify({ type: 'danger', message: JSON.stringify(history.state.data) })
    }
    this.init()
  },
  activated() {
    let goBackResult = history.state.goBackResult || this.$route.params.goBackResult
    if (goBackResult) {
      showNotify({ type: 'danger', message: JSON.stringify(goBackResult) })
    }
    this.init()
  },
  deactivated() {},
  beforeUnmount() {},
  methods: {
    init() {
      nextTick(async () => {
        if (this.config.mode != 'vant') {
          //首次加载
          await this.load(null, true)
        }
      })
    },
    rowClick(val) {
      if (val.index == 0) {
        this.$router.push({
          name: 'data_trans',
          state: {
            data: { userId: '123', from: 'list_van 发送' }
          }
        })
      }
    },
    async load(callback, refresh) {
      let isFinished = false
      let page = 0
      let pageSize = 20
      if (!refresh) {
        if (this.items.datas.length % pageSize == 0) {
          page = this.items.datas.length / pageSize
        } else {
          isFinished = true
        }
      }
      let res = await Api.Get(
        {
          page: page,
          pageSize: 20
        },
        '/api-dev/list/get'
      ).catch((err) => {})
      if (refresh) {
        this.items.datas = []
      }
      if (res.code == 200) {
        this.items.datas.push(...res.data.datas)
        if (res.data.datas.length < 20) {
          isFinished = true
        }
      }

      if (Is.isFunction(callback)) {
        callback({
          isFinished: isFinished
        })
      }
    }
  }
}
</script>

<style scoped></style>
<style lang="scss" scoped></style>
