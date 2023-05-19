// import {ref} from "vue";

let _scrollEl = null
let _navEl = null
let setLisenerFlag = false
let _callback = null
const config = function (scrollEl, navEl, callback) {
  _scrollEl = scrollEl
  _navEl = navEl
  _callback = callback
}
let needRemove_scrollEl_lisener = false
let scrollEl_lisener_flag = false
const configBigList = function (bigListRef, navEl, callback) {
  if (bigListRef.value.$refs.vanList) {
    _scrollEl = bigListRef.value.$refs.vanList.$el.ownerDocument.scrollingElement
  } else if (bigListRef.value.$refs.dyScroller) {
    _scrollEl = bigListRef.value.$refs.dyScroller.$el
    _scrollEl.addEventListener('scroll', scrollLisener)
    needRemove_scrollEl_lisener = true
  }
  _navEl = navEl
  _callback = callback
}
const scrollLisener = function () {
  if (_scrollEl && _navEl) {
    let flag1 = _navEl.style.display != 'none' && _navEl.style.visibility != 'hidden'
    let flag2 = _scrollEl.style.display != 'none' && _scrollEl.style.visibility != 'hidden'
    if (flag1 && flag2) {
      let rect1 = _navEl.getBoundingClientRect()
      let rect2 = _scrollEl.getBoundingClientRect()
      if (rect2.top <= rect1.top) {
        if (_scrollEl.scrollTop > rect1.height) {
          let dh = _scrollEl.scrollTop - rect1.height
          if (_scrollEl.scrollTop > 2 * rect1.height) {
            dh = 0
          } else {
            dh = 1 - (_scrollEl.scrollTop - rect1.height) / rect1.height
            if (dh > 0.9) {
              //最后一点距离无法收到
              dh = 1
            }
          }
          console.log('---alpha---', dh)
          if (_callback) {
            _callback({
              alpha: dh
            })
          }
        } else {
          if (_callback) {
            _callback({
              alpha: 1
            })
          }
        }
      }
      // if (rect1.bottom>rect2.top&&rect1.top<rect2.top){
      //     if (_callback){
      //         let dh=rect2.top-rect1.top
      //         // true,dh/rect1.height
      //         _callback({
      //             alpha:dh/rect1.height
      //         })
      //     }
      // }else if (rect1.top>rect2.top){
      //     if (_callback){
      //         _callback({
      //             alpha:0
      //         })
      //     }
      // }
    }
  }
}
const setLisener = function (flag) {
  if (flag) {
    if (needRemove_scrollEl_lisener) {
      if (scrollEl_lisener_flag) {
        scrollEl_lisener_flag = true
        if (_scrollEl) _scrollEl.addEventListener('scroll', scrollLisener)
      }
    }
    if (!setLisenerFlag) {
      setLisenerFlag = flag
      window.addEventListener('scroll', scrollLisener)
    }
  } else {
    scrollEl_lisener_flag = false
    if (_scrollEl) _scrollEl.removeEventListener('scroll', scrollLisener)
    setLisenerFlag = false
    window.removeEventListener('scroll', scrollLisener)
  }
}
const mounted = function () {
  setLisener(true)
}
const activated = function () {
  setLisener(true)
}
const unactivated = function () {
  setLisener(false)
}
const unmounted = function () {
  setLisener(false)
}

export default { config, configBigList, mounted, activated, unactivated, unmounted }
