<template>
  <div class="backto" style="background: white">
    <div v-for="index in 100" :key="100 + index">
        {{index}}测试van-back-top
    </div>
    <van-back-top :bottom="90" target=".backto"></van-back-top>
  </div>
</template>

<script>
import { useParent } from '@vant/use'
import { nextTick } from 'vue'
export default {
  name: 'STab',
  props: ['relationKey'],
  setup(props, context) {
    const { parent } = useParent(props.relationKey)
    return {
      parent
    }
  },
  data() {
    return {
      tabsActive: 0
    }
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  deactivated() {
    this.setScrollCache()
  },
  beforeUnmount() {
    this.setScrollCache()
  },
  methods: {
    init() {
      nextTick(() => {
        let top = this.parent.getScrollTop(this.$options.name, this.$el.scrollTop)
        if (top != undefined) {
          this.$el.scrollTop = top
          console.log('mounted', this.$el.scrollTop)
        }
      })
    },
    setScrollCache() {
      this.parent.setScrollTop(this.$options.name, this.$el.scrollTop)
      console.log('beforeUnmount', this.$el.scrollTop)
    },
    rendered() {
      setTimeout(() => {
        let top = this.parent.getScrollTop(this.$options.name, this.$el.scrollTop)
        if (top != undefined) {
          this.$el.scrollTop = top
          console.log('mounted', this.$el.scrollTop)
        }
      }, 20)
    }
  }
}
</script>

<style scoped></style>
