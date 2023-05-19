<template>
  <!--  Van主题控制  -->
  <van-config-provider :theme="theme" :theme-vars="themeVars(theme)">
    <router-view class="vue-page-animation-router-view" v-slot="{ Component }">
      <vue-page-animation>
        <keep-alive :include="keepAlives">
          <component :is="Component" :key="$route.path" />
        </keep-alive>
      </vue-page-animation>
    </router-view>
  </van-config-provider>
</template>

<script>
import VuePageAnimation from '@/components/page-animation'
import { keepAliveStore } from '@/stores/keepalive'
import { themeStore } from '@/stores/theme'

export default {
  name: 'appRoot',
  components: { VuePageAnimation },
  computed: {
    keepAlives() {
      return keepAliveStore().data
    },
    theme() {
      return themeStore().data
    },
    themeVars: function () {
      // 注：奇怪的问题
      // dev模式下 这里用function(val)，方法里面可以直接使用this
      // preview模式下 这里用function(val)，方法里无法直接使用this
      // 因此这里改成了 => 方法
      return (val) => {
        let theme = this.themes
        if (val != 'red' && val != 'dark') theme = []
        return theme
      }
    }
  },
  data() {
    return {
      count: 1,
      themes: {
        //vant 组件的 themevar，可从vant各组件目录的样式中查找到
        // rateIconFullColor: '#07c160',
        // sliderBarHeight: '4px',
        // sliderButtonWidth: '20px',
        // sliderButtonHeight: '20px',
        // sliderActiveBackground: '#07c160',
        buttonPrimaryBackground: '#07c160',
        buttonPrimaryBorderColor: '#07c160',
        buttonPrimaryColor: 'red'
      }
    }
  },
  mounted() {}
}
</script>

<style scoped>
.vue-page-animation-router-view {
}
</style>
