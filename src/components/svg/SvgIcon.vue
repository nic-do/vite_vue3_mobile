<template>
  <svg
    :class="svgClass"
    v-bind="$attrs"
    aria-hidden="true"
    :name="name"
    :style="{ color: color, fontSize: fontSize + 'px' }"
  >
    <use :xlink:href="iconName"></use>
  </svg>
</template>
<script>
import svgLoad from '@/components/svg/svg-load'
import { getCurrentInstance, watch, ref } from 'vue'

export default {
  name: 'svg-icon',
  setup(props, context) {
    const name = ref('')
    const { proxy } = getCurrentInstance()
    const reload = function () {
      if (props.path) {
        let names = props.path.split('/')
        name.value = names[names.length - 1]
      }
      if (proxy.$useSvgLoad&&name.value) {
        //启用按需加载 （注：请禁用插件配置 svgload.config.js）
        svgLoad.loadsvg(props.path)
      }
    }
    watch(
      () => props.path,
      () => {
        reload()
      }
    )
    reload()
    return {
      name
    }
  },
  props: {
    path: {
      //   存名字-不要后缀
      type: String,
      required: true
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
