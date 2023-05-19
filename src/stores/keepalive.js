import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'

export const keepAliveStore = defineStore(
  'keepAlive',
  () => {
    //keepalive include数组
    const __data = ref([])
    //页面的状态，用来恢复浏览器刷新用-- 尚未使用
    const __pageState = reactive({})
    const __excludes = ['login']
    //只读
    const data = computed(() => __data.value)
    function addData(name) {
      if (name) {
        if (__excludes.indexOf(name) >= 0) {
          return
        }
        if (__data.value.indexOf(name) < 0) {
          __data.value.push(name)
        }
      }
    }
    function removeData(name) {
      let idx = name ? __data.value.indexOf(name) : -1
      if (idx >= 0) {
        __data.value.splice(idx, 1)
      }
      delete __pageState[name]
    }
    function removeAll(exceptName) {
      console.log('--keepalived--', 'call-removeAll')
      if (__data.value && __data.value.length > 0) {
        let flag = false
        if (exceptName && __data.value.indexOf(exceptName) >= 0) {
          flag = true
        }
        __data.value = []
        Object.keys(__pageState).forEach((key) => {
          delete __pageState[key]
        })
        if (flag) addData(exceptName)
      }
    }
    function removeAllAfter(name) {
      if (__data.value) {
        let index = __data.value.indexOf(name)
        if (index >= 0 && __data.value.length - 1 > index) {
          const removed = __data.value.splice(index + 1)
          removed.forEach((value, index, array) => {
            delete __pageState[value]
          })
          console.log('--keepalived--removed-', removed)
        }
      }
    }

    function setPageState(name, state) {
      if (name) {
        __pageState[name] = state
      }
    }
    function getPageState(name) {
      return __pageState[name]
    }
    return {
      data,
      addData,
      removeData,
      removeAll,
      removeAllAfter,
      setPageState,
      getPageState,
      __data,
      __pageState
    }
  },
  {
    persist: {
      //使用第三方缓存插件 ，可以自己用sessionStorage去存，效果一样
      enabled: true,
      // 自定义存储的 key，默认是 store.$id
      //key: "keepAlive",
      //localStorage/sessionStorage 可以指定任何 extends Storage 的实例，默认是sessionStorage
      storage: sessionStorage,
      // state 中的字段名，按组打包储存
      paths: ['__data', '__pageState']
    }
  }
)
// setTimeout(function () {
//     //查看刷新页面 缓存恢复的情况
//   let dd = keepAliveStore().data
//   console.log('---', dd)
// }, 2000)
