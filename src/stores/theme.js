import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import ThemeStyle from '@/utils/theme/theme-style'
import ThemeLoad from '@/utils/theme/theme-load'
export const themeStore = defineStore('theme', () => {
  const __data = ref(null)
  const data = computed(function () {
    if (!__data.value) {
      let value = null
      let theme = __getData()
      if (theme) {
        value = theme.theme
        if (theme.themeVars) {
          let themeVarsCode = ThemeStyle.config(value, theme.themeVars)
          ThemeLoad.loadCssCode(themeVarsCode, value)
        }
      }
      __data.value = value
    }
    return __data.value
  })
  function setData(val, themeVars) {
    __data.value = val
    if (val) {
      sessionStorage.setItem(
        'theme',
        JSON.stringify({
          theme: val,
          themeVars: themeVars
        })
      )
    } else {
      sessionStorage.removeItem('theme')
    }
  }
  function __getData() {
    var cache = sessionStorage.getItem('theme')
    if (cache) {
      return JSON.parse(cache)
    }
    return null
  }

  return { data, setData }
})
