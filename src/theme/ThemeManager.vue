<template>
  <van-collapse v-model="activeNames">
    <van-collapse-item title="基础Theme" name="1">
      <template v-for="(item, key) in themes" :key="key">
        <div v-if="item.value.indexOf('var') < 0" style="background: white" @click="click(key)">
          <div>{{ key }}-{{ item.value }}</div>
          <div style="background: #0000001f; width: 45px; height: 30px; padding-left: 5px">
            <div style="width: 40px; height: 30px" :style="'background:' + item.value" />
          </div>
        </div>
      </template>
    </van-collapse-item>
  </van-collapse>
  <van-action-sheet
    teleport="body"
    v-model:show="show"
    :title="key"
    cancel-text="确定"
    @cancel="cancel"
  >
    <theme-edit ref="editor" />
  </van-action-sheet>
</template>

<script>
import ThemeEdit from '@/theme/ThemeEdit.vue'
import ThemeStyle from '@/utils/theme/theme-style'
import ThemeLoad from '@/utils/theme/theme-load'
import { themeStore } from '@/stores/theme'
import { reactive } from 'vue'

export default {
  name: 'themeManager',
  components: { ThemeEdit },
  setup() {
    let themeVars = ThemeStyle.themeVars()
    let themes = reactive({})
    for (let key in themeVars) {
      themes[key] = {
        value: themeVars[key]
      }
      if (themeVars[key].indexOf('var') < 0) {
        themes[key] = {
          value: themeVars[key]
        }
      }
    }
    return {
      themes
    }
  },
  data() {
    return {
      show: false,
      activeNames: [1],
      key: '',
      color: {
        hexValue: '#ffffff'
      }
    }
  },
  methods: {
    click(key) {
      this.key = key
      this.show = true
    },
    cancel() {
      this.color = this.$refs.editor.getValues()
      if (this.key) {
        this.themes[this.key].value = this.color.hexValue
      }
      let themeV = {}
      for (let key in this.themes) {
        themeV[key] = this.themes[key].value
      }
      let themeType = 'test'
      let themeConfig = ThemeStyle.config(themeType, themeV)
      ThemeLoad.loadCssCode(themeConfig, themeType, true)
      themeStore().setData(themeType, themeV)

      //直接设置 html的style 优先级高于 上面设置的theme
      // let temp = themeConfig.substring(themeConfig.indexOf('{') + 1)
      // temp = temp.substring(0, temp.length - 1)
      // let properties = temp.split(';')
      // for (let i = 0; i < properties.length; i++) {
      //   let prop = properties[i].split(':')
      //   if (prop.length > 1) {
      //     let pp = prop[0].trim()
      //     if (prop[1].indexOf('var') < 0)
      //       ThemeLoad.setThemeVar(pp, prop[1])
      //   }
      // }
    }
  }
}
</script>

<style scoped></style>
