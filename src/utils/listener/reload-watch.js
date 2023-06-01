let _beforeUnload_time = 0,
    _unload_time = 0
let _listener=null
let beforeunload=function (){
  _beforeUnload_time = new Date().getTime()
}
let unload=function (){
  _unload_time = new Date().getTime()
  if (_unload_time - _beforeUnload_time <= 1) {
    //业务代码
    //close
    _listener('close')
  } else {
    //reload
    _listener('reload')
  }
  clearListener()
}
const setListener = function (listener) {
  _listener=listener
  window.addEventListener('beforeunload',beforeunload )
  window.addEventListener('unload', unload)
}
const clearListener = function () {
  window.removeEventListener('beforeunload', beforeunload)
  window.removeEventListener('unload', unload)
}
export default { setListener,clearListener }