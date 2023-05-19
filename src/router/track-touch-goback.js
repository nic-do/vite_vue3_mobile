function ismobileSafari() {
  var ua = navigator.userAgent.toLowerCase()
  if (
    ua.indexOf('applewebkit') > -1 &&
    ua.indexOf('mobile') > -1 &&
    ua.indexOf('safari') > -1 &&
    ua.indexOf('iphone') > -1
  ) {
    return true
  } else {
    return false
  }
}

if (ismobileSafari()) {
  // 尝试判断 浏览器的手势 导致的页面切换，有bug存在。
  // 1、ios右侧向左侧滑动一段距离后就没touch信息了
  // 2、左侧向右侧滑动，无法判断flip导致 侧滑判断不准
  //以下用的基准值-375 ，依据是：代码测试的手机屏幕宽度375，其他尺寸按此比例进行缩放
  if (window.history && window.history.pushState) {
    let touchBeginX = null
    let touchMove = null
    let tounBeginTime = -1
    window.addEventListener(
      'touchstart',
      function (event) {
        // 如果这个元素的位置内只有一个手指的话
        touchMove = null
        touchBeginX = null
        sessionStorage.removeItem('_touch_change')

        if (event.targetTouches.length == 1) {
          tounBeginTime = new Date().getTime()
          touchBeginX = event.targetTouches[0].screenX
          // console.log('--touchstart-0-',touchBeginX)
        }
      },
      false
    )
    window.addEventListener('touchend', function (event) {
      // console.log('--touchend--','------')
      if (touchBeginX < 18 && touchMove) {
        //ios 左向右 开始 0<x<18 左右
        let time = new Date().getTime() - tounBeginTime
        // console.log('--touchend--',touchMove.screenX+'|'+time)
        //也不一定准却，可能存在滑动一些距离再左 flip
        var scroll =
          touchMove.screenX > -((window.innerWidth * 140) / 375) && touchMove.screenX < -1
        var flip = time < 100 && touchMove.screenX < -((window.innerWidth * 163) / 375) //需要配合时间
        if (scroll || flip) {
          //有效的 左向右侧滑 move的x小于0
          // console.log('--touchmove-0-','------')
          sessionStorage.setItem('_touch_change', '1')
        } else {
          // console.log('--touchend--','---clear---')
          //滑动不到位，回退
          sessionStorage.removeItem('_touch_change')
        }
      } else {
        // console.log('--touchend--','---clear---')
        sessionStorage.removeItem('_touch_change')
      }
    })
    window.addEventListener('touchcancel', function (event) {
      console.log('--touchcancel--', '---clear---')
      sessionStorage.removeItem('_touch_change')
    })
    window.addEventListener(
      'touchmove',
      function (event) {
        // 如果这个元素的位置内只有一个手指的话
        if (event.targetTouches.length > 1) {
          // console.log('--touchmove--','more Touches:'+event.targetTouches.length)
        } else {
          touchMove = event.targetTouches[0]
          if (touchMove) {
            // if (touchBeginX<18&&touchMove.screenX<0){
            //
            // }
            let len = Math.abs(touchMove.screenX - touchBeginX)
            if (touchBeginX > window.innerWidth - (343 * window.innerWidth) / 375) {
              //ios 右向左 开始 距离右侧边<18 左右
              if (len > 18 && touchMove.screenX > window.innerWidth - 120) {
                //有效的 右向左侧滑 move的x不会小于  距离右侧边<120左右（滑到一定距离，触摸就会停止响应）
                // console.log('--touchmove-1-','------')
                sessionStorage.setItem('_touch_change', '1')
              } else {
                // sessionStorage.removeItem('_touch_change')
                // console.log('--touchmove-1-',len+'|'+touchMove.screenX+'|'+(window.innerWidth-120))
              }
            }
          }
        }
      },
      false
    )
  }
}
function reset() {
  sessionStorage.removeItem('_touch_change')
}
export default { reset }
