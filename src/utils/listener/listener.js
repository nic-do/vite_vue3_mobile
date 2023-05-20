function removeEventListener(el, event, func) {
  if (el && event && func) {
    if (event.indexOf('Animation') == 0) {
      let lower = event.toLowerCase()
      let es = []
      es.push('webkit' + event)
      es.push('moz' + event)
      es.push('MS' + event)
      es.push('o' + lower)
      es.push(lower)
      es.forEach((value, index, array) => {
        el.removeEventListener(value, func)
      })
    } else if (event.indexOf('animation') == 0) {
      console.log('--提示--', '需要使用这种格式 AnimationEnd')
    } else {
      el.removeEventListener(event, func)
    }
  }
}
function addEventListener(el, event, func) {
  if (el && event && func) {
    if (event.indexOf('Animation') == 0) {
      let lower = event.toLowerCase()
      let es = []
      es.push('webkit' + event)
      es.push('moz' + event)
      es.push('MS' + event)
      es.push('o' + lower)
      es.push(lower)
      es.forEach((value, index, array) => {
        el.removeEventListener(value, func)
        el.addEventListener(value, func)
      })
    } else if (event.indexOf('animation') == 0) {
      console.log('--提示--', '需要使用这种格式 AnimationEnd')
    } else {
      el.removeEventListener(event, func)
      el.addEventListener(event, func)
    }
  }
}
export default { removeEventListener, addEventListener }
