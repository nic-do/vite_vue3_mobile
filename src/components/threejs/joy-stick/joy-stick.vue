<template>
  <div
    ref="leftPan"
    class="left-pan"
    :class="anim"
    style="background: #ff00004f"
    :style="{ visibility: ready ? 'visible' : 'hidden' }"
  >
    <van-icon
      ref="top"
      class="item"
      :style="{ top: top.top, left: top.left, visibility: ready ? 'visible' : 'hidden' }"
      :size="size"
      name="arrow-up"
    />
    <van-icon
      ref="left"
      v-if="ready"
      class="item"
      :style="{ top: left.top, left: left.left }"
      :size="size"
      name="arrow-left"
    />
    <van-icon
      ref="right"
      v-if="ready"
      class="item"
      :style="{ top: left.top, right: left.left }"
      :size="size"
      name="arrow"
    />
    <van-icon
      ref="bottom"
      v-if="ready"
      class="item"
      :style="{ bottom: top.top, left: top.left }"
      :size="size"
      name="arrow-down"
    />
    <div
      ref="center"
      class="center"
      :style="{ top: center.top, left: center.left, visibility: ready ? 'visible' : 'hidden' }"
    />
    <van-icon
      ref="aim"
      class="item aim"
      style="left: 20px; bottom: 150px"
      v-if="ready"
      size="36"
      name="add"
    />
    <!--        放外部 点击无法在触摸时，同时响应 -->
    <div class="jump btn" v-if="ready"></div>
    <div class="big btn" v-if="ready"></div>
    <div class="small small-1 btn" v-if="ready"></div>
    <div class="small small-2 btn" v-if="ready"></div>
    <div class="small small-3 btn" v-if="ready"></div>
  </div>
</template>

<script>
import { nextTick } from 'vue'
import Is from '@/utils/is'
export default {
  name: 'joy-stick',
  props: ['getRad', 'jump', 'shoot'],
  data() {
    return {
      ready: false,
      anim: '',
      size: 20,
      top: {
        top: '',
        left: ''
      },
      left: {
        top: '',
        left: ''
      },
      center: {
        topD: '',
        leftD: '',
        top: '',
        left: ''
      },
      touchBind: null,
      touchDom: null
    }
  },
  mounted() {
    window.addEventListener('resize', this.onWindowResize)
    nextTick(() => {
      this.touchDom = this.$refs.leftPan
      this.init()
      this.initPos()
    })
  },
  activated() {
    window.addEventListener('resize', this.onWindowResize)
    this.initPos()
  },
  deactivated() {
    window.removeEventListener('resize', this.onWindowResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onWindowResize)
    if (Is.isMobileDevice()) {
      this.touchDom.removeEventListener('touchstart', this.touchBind)
      this.touchDom.removeEventListener('touchmove', this.touchBind)
      this.touchDom.removeEventListener('touchend', this.touchBind)
      this.touchDom.removeEventListener('touchleave', this.touchBind)
      this.touchDom.removeEventListener('touchcancel', this.touchBind)
    } else {
      this.touchDom.removeEventListener('mousedown', this.touchBind)
      this.touchDom.removeEventListener('mouseup', this.touchBind)
      // this.touchDom.removeEventListener('mousemove', this.touchBind)

      document.body.removeEventListener('mouseleave', this.touchBind)
      document.body.removeEventListener('mouseup', this.touchBind)
      document.body.removeEventListener('mousemove', this.touchBind)
    }
    document.oncontextmenu = null
    document.removeEventListener('gesturestart', this.preventFunc)
  },
  methods: {
    onWindowResize() {
      this.initPos()
    },
    preventFunc(event) {
      event.preventDefault()
    },
    disableSomeThing() {
      document.oncontextmenu = function (e) {
        e.preventDefault()
      }
      // 禁用双指手势操作
      document.addEventListener('gesturestart', this.preventFunc.bind(this))
    },
    initPos() {
      let leftPan = this.$refs.leftPan
      leftPan.clientWidth
      leftPan.clientHeight
      let width = this.$refs.top.$el.clientWidth
      let height = this.$refs.top.$el.clientHeight
      let top = 0
      this.top = {
        left: `${(leftPan.clientWidth - width) / 2}px`,
        top: `${top}px`
      }
      this.left = {
        top: `${(leftPan.clientHeight - height) / 2}px`,
        left: `${top}px`
      }
      width = this.$refs.center.clientWidth
      height = this.$refs.center.clientHeight
      let ct = `${(leftPan.clientHeight - height) / 2}px`
      let cl = `${(leftPan.clientWidth - width) / 2}px`
      this.center = {
        top: ct,
        left: cl,
        topD: ct,
        leftD: cl
      }
    },
    init() {
      this.disableSomeThing()

      this.touchBind = this.touch.bind(this)
      setTimeout(() => {
        this.anim = 'leftPan-anim'
        this.ready = true
      }, 400)
      if (Is.isMobileDevice()) {
        this.touchDom.addEventListener('touchstart', this.touchBind, { passive: false })
        this.touchDom.addEventListener('touchmove', this.touchBind, { passive: false })
        this.touchDom.addEventListener('touchend', this.touchBind, { passive: false })
        this.touchDom.addEventListener('touchleave', this.touchBind, { passive: false })
        this.touchDom.addEventListener('touchcancel', this.touchBind, { passive: false })
      } else {
        //加入joystick的时候，如果手指滑动到stick内部再放开，domElement无法接收mouseup，因此在body里再加一个监听
        document.body.addEventListener('mouseup', this.touchBind, false)
        document.body.addEventListener('mouseleave', this.touchBind, false)
        this.touchDom.addEventListener('mousedown', this.touchBind, false)
        this.touchDom.addEventListener('mouseup', this.touchBind, false)
      }
    },

    setCenter(dx, dy) {
      let width = this.$refs.center.clientWidth
      let height = this.$refs.center.clientHeight
      let temp = { ...this.center }
      if (Math.abs(dy) < 1 && Math.abs(dx) < 1) {
        return false
      }
      temp.top = dy - width / 2 + 'px'
      temp.left = dx - height / 2 + 'px'
      this.center = temp
      return true
    },
    isAvailableEvent(event) {
      let target = event.target
      return (
        target == this.$refs.leftPan ||
        target == this.$refs.center ||
        target == this.$refs.left.$el ||
        target == this.$refs.top.$el ||
        target == this.$refs.right.$el ||
        target == this.$refs.bottom.$el
      )
    },
    allTouches(event) {
      let touches = []
      for (let i = 0; i < event.targetTouches.length; i++) {
        let target = event.targetTouches[i].target
        if (
          target == this.$refs.leftPan ||
          target == this.$refs.center ||
          target == this.$refs.left.$el ||
          target == this.$refs.top.$el ||
          target == this.$refs.right.$el ||
          target == this.$refs.bottom.$el
        ) {
          touches.push(event.targetTouches[i])
        }
      }
      return touches
    },
    isBtnEvent(event) {
      let target = event.target
      return target.className.indexOf('btn') >= 0
    },
    clickButton(event) {
      let target = event.target
      if (target.className.indexOf('jump') >= 0) {
        this.jump()
      } else if (target.className.indexOf('big') >= 0) {
        this.shoot(0)
      } else if (target.className.indexOf('small-1') >= 0) {
        this.shoot(1)
      } else if (target.className.indexOf('small-2') >= 0) {
        this.shoot(2)
      } else if (target.className.indexOf('small-3') >= 0) {
        this.shoot(3)
      }
    },
    touch(ev) {
      let event = ev || window.event
      let leftPan = this.$refs.leftPan
      if (this.isBtnEvent(event)) {
        if (event.type == 'touchstart' || event.type == 'mousedown') {
          this.clickButton(event)
        }
        if (Is.isMobileDevice()) {
          event.preventDefault() //双击放大
        }
        return
      } else if (this.$refs.aim && this.$refs.aim.$el == event.target) {
        if (!this.isTouching) {
          if (event.type == 'touchstart' || event.type == 'mousedown') {
            this.shoot(5)
          }
        }
        if (Is.isMobileDevice()) {
          event.preventDefault() //双击放大
        }
        return
      }
      // console.log('--0000--',event)
      if (event.type == 'touchstart' || event.type == 'mousedown') {
        if (event.type == 'mousedown') {
          document.body.removeEventListener('mousemove', this.touchBind)
          document.body.addEventListener('mousemove', this.touchBind, false)
        }
        let touch = null
        if (Is.isMobileDevice()) {
          // event.preventDefault()
          let touches = this.allTouches(event)
          if (touches.length > 0) {
            touch = touches[0]
          }
        } else {
          touch = event
        }
        if (
          touch &&
          this.setCenter(touch.clientX - leftPan.offsetLeft, touch.clientY - leftPan.offsetTop)
        ) {
          this.isTouching = true
          this.action(leftPan, touch)
        }
      } else if (
        event.type == 'touchend' ||
        event.type == 'touchleave' ||
        event.type == 'touchcancel' ||
        event.type == 'mouseup' ||
        event.type == 'mouseleave'
      ) {
        if (event.type == 'mouseup' || event.type == 'mouseleave') {
          document.body.removeEventListener('mousemove', this.touchBind)
        }
        if (Is.isMobileDevice()) {
          event.preventDefault() //双击放大
        }
        if (!this.isTouching) {
          return
        }
        let flag = this.isAvailableEvent(event)
        if (flag) {
          this.isTouching = false
          this.center.top = this.center.topD
          this.center.left = this.center.leftD
          this.getRad({ finished: true })
        }
      } else {
        let flag = event.type == 'touchmove' || event.type == 'mousemove'
        if (flag) {
          let touch = null
          if (Is.isMobileDevice()) {
            event.preventDefault()
            let touches = this.allTouches(event)
            if (touches.length > 0) {
              touch = touches[0]
            }
          } else {
            touch = event
          }
          if (
            touch &&
            this.setCenter(touch.clientX - leftPan.offsetLeft, touch.clientY - leftPan.offsetTop)
          ) {
            this.action(leftPan, touch)
          }
        }
      }
    },
    action(leftPan, touch) {
      let centerX = leftPan.offsetWidth / 2 + leftPan.offsetLeft
      let centerY = leftPan.offsetHeight / 2 + leftPan.offsetTop

      let dy = centerY - touch.clientY
      let dx = touch.clientX - centerX

      let tan = dy / dx
      let rad = Math.atan(tan)
      if (dx >= 0 && dy >= 0) {
        //do nothing
      } else if (dx >= 0 && dy < 0) {
        // rad += 2 * Math.PI
      } else if (dy >= 0 && dx < 0) {
        rad += Math.PI
      } else if (dy < 0 && dx < 0) {
        rad = rad - Math.PI
      }
      if (this.getRad != undefined) {
        this.getRad({ rad: rad })
      }
    }
  }
}
</script>

<style scoped>
/* 已测有效 */
* {
  -webkit-touch-callout: none; /*系统默认菜单被禁用*/
  -webkit-user-select: none; /*webkit浏览器*/
  -khtml-user-select: none; /*早起浏览器*/
  -moz-user-select: none; /*火狐浏览器*/
  -ms-user-select: none; /*IE浏览器*/
  user-select: none; /*用户是否能够选中文本*/
}
.left-pan {
  z-index: 5;
  position: fixed;
  bottom: 60px;
  left: 30px;
  width: 150px;
  height: 150px;
  border-radius: 150px;
}
.item {
  position: absolute;
}
.center {
  z-index: 5;
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 60px;
  background: green;
}
.jump {
  position: fixed;
  bottom: 60px;
  right: 320px;
  border-radius: 340px;
  background: red;
  width: 70px;
  height: 70px;
}
.big {
  position: fixed;
  bottom: 60px;
  right: 40px;
  width: 120px;
  height: 120px;
  border-radius: 120px;
  background: red;
}
.small {
  position: fixed;
  width: 70px;
  height: 70px;
  border-radius: 70px;
  background: red;
}
.small-1 {
  bottom: 230px;
  right: 40px;
}
.small-2 {
  bottom: 170px;
  right: 160px;
}
.small-3 {
  bottom: 60px;
  right: 210px;
}
.leftPan-anim {
  animation: zoom-in 0.3s linear;
  animation-fill-mode: forwards;
}
@keyframes zoom-in {
  0% {
    opacity: 0.4;
    /*transform: scale(0.6);*/
  }
  100% {
    opacity: 1;
    /*transform: scale(1);*/
  }
}
</style>
