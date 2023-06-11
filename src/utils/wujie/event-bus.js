import { bus } from 'wujie'
let win = null
if (window.__POWERED_BY_WUJIE__) {
  win = window.$wujie
} else {
  win = window
}
if (win && win.wj_bus_listener == undefined) {
  win.wj_bus_listener = {}
}
let listener = win?.wj_bus_listener
const on = function (event, callback) {
  if (listener) {
    let func = listener[event]
    if (func != undefined) {
      off(event, func)
    }
    listener[event] = callback
    if (window.__POWERED_BY_WUJIE__) {
      window.$wujie?.bus.$on(event, callback)
    } else {
      // 主应用监听事件
      bus.$on(event, callback)
    }
  }
}
const off = function (event, listener) {
  if (window.__POWERED_BY_WUJIE__) {
    window.$wujie?.bus.$off(event, listener)
  } else {
    // 主应用取消事件监听
    bus.$off(event, listener)
  }
}
const emit = function (event, data) {
  if (window.__POWERED_BY_WUJIE__) {
    window.$wujie?.bus.$emit(event, data)
  } else {
    // 主应用发送事件
    bus.$emit(event, data)
  }
}
export default { on, off, emit }
