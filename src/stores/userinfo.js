import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const userInfoStore = defineStore('userinfo', () => {
  const __data = ref(null)
  const data = computed(function () {
    if (!__data.value) {
      __data.value = __getData()
    }
    return __data.value
  })
  function setData(val) {
    __data.value = val
    if (val) {
      sessionStorage.setItem('userinfo', JSON.stringify(val))
    } else {
      sessionStorage.removeItem('userinfo')
    }
  }
  function __getData() {
    var cache = sessionStorage.getItem('userinfo')
    if (cache) {
      return JSON.parse(cache)
    }
    return null
  }

  return { data, setData }
})
