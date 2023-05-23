import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'

export const routeStore = defineStore(
  'routeStore',
  () => {
    //keepalive include数组
    const __data = ref([])
    //只读
    const data = computed(() => __data.value)
    function addData(keys) {
      if (keys) {
        __data.value.push(...keys)
      }
    }
    function clearData() {
      __data.value = []
    }
    return {
      data,
      addData,
      clearData,
      __data
    }
  },
  {
    persist: {
      //使用第三方缓存插件 ，可以自己用sessionStorage去存，效果一样
      enabled: true,
      // 自定义存储的 key，默认是 store.$id
      //key: "routeStore",
      //localStorage/sessionStorage 可以指定任何 extends Storage 的实例，默认是sessionStorage
      storage: sessionStorage,
      // state 中的字段名，按组打包储存
      paths: ['__data']
    }
  }
)
// setTimeout(function () {
//     //查看刷新页面 缓存恢复的情况
//   let dd = routeStore().data
//   console.log('---', dd)
// }, 1500)
