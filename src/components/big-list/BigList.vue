<template>
  <van-pull-refresh
    ref="pullRefresh"
    v-model="isRefreshing"
    success-text="刷新成功"
    :disabled="(config && config.disabled) || disabledRefresh"
    @refresh="onRefresh"
  >
    <van-list
      class="vanlist"
      :style="clientHeight != null ? { minHeight: clientHeight } : {}"
      v-if="config && config.mode == 'vant' && canShowList"
      v-model:loading="isLoading"
      :finished="isFinished"
      :finished-text="config && config.finishedText"
      :offset="50"
      ref="vanList"
      direction="down"
      @load="onVantLoad"
    >
      <template v-for="(item, index) in items">
        <slot name="cell" :scope="{ data: item, index: index }"> </slot>
      </template>
    </van-list>
    <dynamic-scroller
      v-else-if="config && config.mode == 'scroller' && canShowList"
      class="scroller ignore prevent-sel"
      :style="clientHeight != null ? { height: clientHeight } : {}"
      :items="items"
      :min-item-size="config && config.rowHeight > 0 ? config.rowHeight : 54"
      :emitUpdate="true"
      @update="update"
      @resize="resize"
      @visible="visible"
      @hidden="hidden"
      @scroll="scroll"
      ref="dyScroller"
    >
      <template #before>
        <slot name="before">
          <div style="width: 100vw; text-align: center">头部</div>
        </slot>
      </template>
      <template v-if="!items || items.length == 0" #empty>
        <slot name="empty">
          <div style="width: 100vw; text-align: center">没有数据</div>
        </slot>
      </template>

      <template v-if="showFooter" #after>
        <slot name="after">
          <div v-if="isFinished" style="width: 100vw; text-align: center">
            {{ config && config.finishedText }}
          </div>
        </slot>
      </template>
      <template #default="{ item, index, active }">
        <!--1、 item里必须有id  且 不能重复
        2、dependencies是 实际会影响高度的字段-->
        <dynamic-scroller-item
          :item="item"
          :active="active"
          :size-dependencies="config && config.heigthDependencies ? config.heigthDependencies : []"
          :data-index="index"
          :data-active="active"
        >
          <slot name="cell" :scope="{ data: item, index: index }"> </slot>
        </dynamic-scroller-item>
      </template>
    </dynamic-scroller>
    <div v-else></div>
    <van-back-top
      class="big-list-part"
      v-if="isready && canShowList && config && config.mode == 'scroller'"
      target=".vue-recycle-scroller"
    />
    <!--    <van-back-top-->
    <!--            class="big-list-part"-->
    <!--      v-if="isready"-->
    <!--      :target="-->
    <!--        canShowList && config && config.mode == 'vant' ? '.vanlist' : '.vue-recycle-scroller'-->
    <!--      "-->
    <!--    />-->
  </van-pull-refresh>
</template>

<script>
import { useScrollParent } from '@vant/use'
import { nextTick, inject } from 'vue'
export default {
  name: 'bigList',
  setup() {
    const pagebody = inject('PageBody')
    const scrollParent = useScrollParent(pagebody)
    return {
      pagebody,
      scrollParent
    }
  },
  inject: ['navParams'],
  props: {
    items: Array,
    //navParams与scrollParent必须有效，autoHeight才能生效
    autoHeight: Boolean,
    config: {
      type: Object,
      default: function () {
        return {
          mode: 'vant',
          rowHeight: 54,
          heigthDependencies: [],
          finishedText: '没有更多了'
        }
      }
    }
  },
  computed: {
    canShowList: function () {
      return this.showList
    }
  },
  watch: {
    navParams: {
      deep: true,
      immediate: true,
      handler(newval, oldval) {
        //监听nav的显示状态
        this.calculate()
      }
    }
  },
  data() {
    return {
      isready: false,
      didx: 0,
      isRefreshing: false,
      isLoading: false,
      disabledRefresh: false,
      count: 0,
      showFooter: false,

      isFinished: false,
      isVantDoLoading: false,

      showList: false,
      clientHeight: null
    }
  },
  mounted() {
    this.addTouchmovePrevent()
    this.calculate()
    setTimeout(() => {
      this.isready = true
    }, 1000)
  },
  activated() {
    if (this.scrollTop != undefined) {
      if (this.$refs.dyScroller) {
        this.$refs.dyScroller.scrollTop = this.scrollTop
      }
      if (this.$refs.vanList) {
        this.$refs.vanList.$el.ownerDocument.scrollingElement.scrollTop = this.scrollTop
      }
    }
    this.addTouchmovePrevent()
  },
  deactivated() {
    if (this.$refs.dyScroller) {
      this.scrollTop = this.$refs.dyScroller.scrollTop
    }
    if (this.$refs.vanList) {
      this.scrollTop = this.$refs.vanList.$el.ownerDocument.scrollingElement.scrollTop
    }
    this.disabledRefresh = false
    this.removeTouchmovePrevent()
  },
  beforeUnmount() {
    this.disabledRefresh = false
    this.removeTouchmovePrevent()
  },
  methods: {
    calculate() {
      nextTick(() => {
        if (this.autoHeight && this.scrollParent) {
            if (this.scrollParent.clientHeight!=undefined){
                this.clientHeight = this.scrollParent.clientHeight + 'px'
            }else{
                this.clientHeight = this.pagebody.clientHeight + 'px'
            }
        }
        this.showList = true
      })
    },
    removeTouchmovePrevent() {
      this.flag_touchmovePrevent = false
      document.body.removeEventListener('touchmove', this.touchmovePrevent)
    },
    addTouchmovePrevent() {
      if (!this.flag_touchmovePrevent) {
        this.flag_touchmovePrevent = true
        document.body.addEventListener('touchmove', this.touchmovePrevent, { passive: false })
      }
    },
    touchmovePrevent(e) {
      if (!this.$refs.pullRefresh) return
      var pr = this.$refs.pullRefresh.$el.getElementsByClassName('van-pull-refresh__head')
      var flag2 = false
      if (pr && pr.length > 0) {
        flag2 = pr[0].children.length > 0
      }
      console.log('pullRefresh', flag2)
      //下拉刷新时阻止 滑动，可以部分解决 浏览器bounce
      if (this.isRefreshing || flag2) {
        // 阻止默认的处理方式(阻止下拉滑动的效果)
        if (e.cancelable) {
          e.preventDefault()
        }
      } else if (this.config && this.config.mode == 'vant' && this.isLoading) {
        if (e.cancelable) {
          e.preventDefault()
        }
      }
    },
    traverse(node) {
      const children = node.children // 获取所有子元素
      for (let i = 0; i < children.length; i++) {
        if (children[i].scrollTop > 40) {
          console.log('-----', '-------' + children[i].className)
        }
        this.traverse(children[i]) // 递归遍历子元素
      }
    },
    update(start, end, visibleStartIndex, visibleEndIndex) {},
    onRefresh() {
      var that = this
      this.isLoading = false
      this.$emit('reload', function (val) {
        if (val && val.isFinished) {
          that.isFinished = true
        }
        that.isRefreshing = false
      })
      this.isRefreshing = false
    },
    onVantLoad() {
      if (this.isRefreshing) {
        this.isLoading = false
      } else if (!this.isVantDoLoading) {
        this.isVantDoLoading = true
        this.load()
      }
    },
    load() {
      var that = this
      this.$emit('load', function (val) {
        // console.log('load', '--------------')
        if (val && val.isFinished) {
          that.isFinished = true
        }
        that.isLoading = false
        that.isVantDoLoading = false
      })
    },
    scroll() {
      var tt = this.$refs.dyScroller.$el.scrollTop //0 顶
      this.$emit('scroll', tt)
      if (this.disabledRefresh) {
        if (tt <= 0) {
          //禁用下拉刷新，因为scroll冲突
          this.disabledRefresh = false
        }
      } else if (tt > 2) {
        //启用下拉刷新
        this.disabledRefresh = true
      }
      var tth = this.$refs.dyScroller.$el.scrollHeight - 100 //总内容高度
      var h = this.$refs.dyScroller.$el.offsetHeight //可视高度
      if (tth - (tt + h) < 1) {
        if (!this.showFooter) {
          this.showFooter = true
          //loadMore
          if (!this.isLoading) {
            this.isLoading = true
            this.load()
          }
        }
      } else if (this.showFooter) {
        this.showFooter = false
      }
    },
    resize() {
      // console.log('resize')
    },
    visible() {
      // console.log('visible')
    },
    hidden() {
      // console.log('hidden')
    }
  }
}
</script>

<style scoped>
.scroller {
  /*如果不使用autoHeight*/
  /*通常需要 外部调整:deep(.scroller){}*/
  /*height: 100vh;*/
  /*  -webkit-overflow-scrolling: touch;*/
}
.vanlist {
  /*如果不使用autoHeight*/
  /*通常需要 外部调整:deep(.scroller){}*/
  /*min-height: 100vh;*/
}
</style>
