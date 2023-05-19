let _listener = null
const setListener = function (listener) {
  _listener = listener
  clearListener()
  document.onmousedown = touchListener
  document.body.addEventListener('touchmove', touchListener, { passive: false })
  document.onscroll = touchListener
  document.onkeydown = touchListener
}
const clearListener = function () {
  document.onmousedown = null
  document.body.removeEventListener('touchmove', touchListener)
  document.onscroll = null
  document.onkeydown = null
}
const touchListener = function () {
  if (_listener) _listener()
}
export default { setListener, clearListener }
