<template>
  <svg
    :class="svgClass"
    v-bind="$attrs"
    aria-hidden="true"
    :style="{ color: color, fontSize: fontSize + 'px' }"
  >
    <use :xlink:href="iconName"></use>
  </svg>
</template>
<script>
import i18n from '@/i18n'
import svgLoad from '@/components/svg/svg-load'
import { getCurrentInstance } from 'vue'

export default {
  name: 'svg-icon',
  setup(props, context) {
    const { proxy } = getCurrentInstance()
    if (proxy.$useSvgLoad) {
      //启用按需加载 （注：请禁用插件配置 svgload.config.js）
      svgLoad.loadsvg(props.name, props.path)
    }
    return {}
  },
  props: {
    svg: null,
    name: {
      //   存名字-不要后缀
      type: String,
      required: true
    },
    path: {
      //可以 含name-不要后缀
      type: String,
      default: null
    },
    color: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: '14'
    }
  },
  computed: {
    iconName() {
      return `#icon-${this.name}`
    },
    svgClass() {
      return `svg-icon icon-${this.name}`
    },
    fontSize() {
      return this.size
    }
  },
  mounted() {}
}
</script>

<style>
.svg-icon {
  font-size: inherit;
  fill: currentColor;
  width: 1em;
  height: 1em;
  text-indent: 0;
}
</style>
<!--<template>-->
<!--    <svg class="SvgIcon" aria-hidden="true" style="width: 60px;height: 60px;color: red">-->
<!--        <use :xlink:href="symbolId" />-->
<!--    </svg>-->
<!--</template>-->

<!--<script>-->
<!--import {defineComponent, computed} from 'vue';-->

<!--export default defineComponent({-->
<!--    name: 'svg-icon',-->
<!--    props: {-->
<!--        name: {-->
<!--            type: String,-->
<!--            required: true,-->
<!--        }-->
<!--    },-->
<!--    setup(props) {-->
<!--        const symbolId = computed(() => `#icon-${props.name}`)-->
<!--        return {symbolId}-->
<!--    }-->
<!--});-->
<!--</script>-->
<!--<style scoped>-->
<!--.SvgIcon {-->
<!--    font-size: inherit;-->
<!--    fill: currentColor;-->
<!--    width: 1em;-->
<!--    height: 1em;-->
<!--    text-indent: 0;-->
<!--}-->
<!--</style>-->
