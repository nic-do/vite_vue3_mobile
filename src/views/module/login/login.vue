<script setup name="login">
import {
  provide,
  ref,
  computed,
  getCurrentInstance,
  reactive,
  nextTick,
  inject,
  onMounted,
  onActivated,
  onBeforeUnmount,
  onDeactivated
} from 'vue'
//路由跳转用
import { useRouter } from 'vue-router'
//页面根节点
import PageRoot, { PageNavDef } from '@/components/page'
import {listener,touchWatch} from '@/utils/listener/index.js'
import {userInfoStore} from "@/stores/userinfo";
import {login} from "@/request/user.js";
const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
const router = useRouter()
const i18n_t = inject('i18n_t')
const shouldStopAnim = ref(false)
function canRunAnim(resolve, delay) {
  if (!shouldStopAnim.value) {
    if (delay && delay > 0) {
      return setTimeout(() => {
        resolve()
      }, delay)
    } else {
      resolve()
    }
  }
  return null
}
onMounted(() => {
  init()
})
onActivated(() => {
  init()
})
onDeactivated(() => {
  shouldStopAnim.value = true
  clearAllListener()
})

onBeforeUnmount(() => {
  shouldStopAnim.value = true
  clearAllListener()
})
const textRef = ref('textRef')
const imageLogoRef = ref('imageLogoRef')
const meteorAnimRef = ref('meteorAnimRef')
const inputHiddenRef = ref('inputHiddenRef')
const logoShadowRef = ref('logoShadowRef')

//动画初始状态
const showInputLogin = ref(false)
const showLogo = ref(false)
const logoShadow = ref('')
const logoShadowAlpha = ref('')
const init = function () {
  nextTick(() => {
    if (!showInputLogin.value) {
      showInputLogin.value = !showInputLogin.value
      showLogo.value = !showLogo.value
    }
      listener.addEventListener(textRef.value, 'AnimationEnd', animFinished)
    listener.addEventListener(imageLogoRef.value.$el, 'AnimationEnd', animFinished)
    listener.addEventListener(meteorAnimRef.value, 'AnimationEnd', animFinished)
    listener.addEventListener(inputHiddenRef.value, 'AnimationEnd', animFinished)
    listener.addEventListener(logoShadowRef.value, 'AnimationEnd', animFinished)
      touchWatch.setListener(touchListener)
    // document.onmousedown = touchListener
    // document.body.addEventListener('touchmove', touchListener, { passive: false })
    // document.onscroll = touchListener
    // document.onkeypress = touchListener
    startTimerTouch()
  })
}
const clearAllListener = function () {
  listener.removeEventListener(textRef.value, 'AnimationEnd', animFinished)
  listener.removeEventListener(imageLogoRef.value.$el, 'AnimationEnd', animFinished)
  listener.removeEventListener(meteorAnimRef.value, 'AnimationEnd', animFinished)
  listener.removeEventListener(inputHiddenRef.value, 'AnimationEnd', animFinished)
  listener.removeEventListener(logoShadowRef.value, 'AnimationEnd', animFinished)
    touchWatch.clearListener()
  // document.onmousedown = null
  // document.body.removeEventListener('touchmove', touchListener)
  // document.onscroll = null
  // document.onkeypress = null
  if (timerTouch.value) {
    clearTimeout(timerTouch.value)
    timerTouch.value = null
  }
}

// 监听屏幕 是否在操作----begin----
// 改变显示状态
const inputHidden = ref('')
const timerTouch = ref(null)
const startTimerTouch = function () {
  if (timerTouch.value) {
    clearTimeout(timerTouch.value)
    timerTouch.value = null
  }
  timerTouch.value = canRunAnim(() => {
    inputHidden.value = 'input-hidden'
    logoShadowAlpha.value = 'logo-shadow-alpha-0'
  }, 3000)
}
const touchListener = function (event) {
  startTimerTouch()
  if (inputHidden.value == 'input-hidden') {
    inputHidden.value = 'input-hidden-cancel'
    logoShadowAlpha.value = ''
  }
}
//监听屏幕 是否在操作---end---
const privacyText = ref('版权：NIC')
const textBorderCls = ref('text-content') //text-border
const logoTopAnimCls = ref('logo-top-anim')
const animFinished = function (event) {
  let target = event.currentTarget
  if (target == textRef.value) {
    if (textBorderCls.value == 'text-content') {
      if (privacyText.value.indexOf(event.target.innerText) == privacyText.value.length - 1) {
        canRunAnim(() => {
          textBorderCls.value = 'text-bg-anim text-border'
        }, 300)
      }
    } else if (textBorderCls.value == 'text-bg-anim text-border') {
      textBorderCls.value = 'text-bg-anim'
      canRunAnim(() => {
        textBorderCls.value = 'text-bg-anim text-border'
      }, 2500)
    }
  } else if (target == imageLogoRef.value.$el) {
    logoTopAnimCls.value = ''
    logoShadow.value = 'logo-shadow'
  } else if (target == meteorAnimRef.value) {
    if (inputHidden.value == 'input-hidden') {
      changeMeteorAnim()
    } else {
      meteorAnim.name = ''
    }
  } else if (event.target == inputHiddenRef.value) {
    changeMeteorAnim()
  }
}

// 流星--------begin-------
const meteorAnim = reactive({
  name: '', //meteor
  top: 360,
  right: 160,
  duration: 0.5,
  delay: 1 //没有用到
})
function changeMeteorAnim() {
  meteorAnim.name = ''
  canRunAnim(() => {
    let right =
      parseInt(Math.random() * [window.innerWidth + 1 - window.innerWidth / 2]) +
      window.innerWidth / 3
    let top = parseInt(Math.random() * [window.innerHeight / 2 + 1])
    meteorAnim.top = top
    meteorAnim.right = right - 200
    meteorAnim.name = 'meteor'
  }, meteorAnim.duration * 1100)
}
//流星--------end-------
//NavBar-----begin-----
const navDef = reactive({
  nav: PageNavDef.config({
    show: false,
    title: '78909',
    clickable: false,
    leftArrow: false,
    placeholder: false
  })
})
//透传nav
provide('navParams', navDef)
//NavBar-----end-----
//语言切换 相关----begin----
const vanFrom = ref('vanFrom')
const nameInput = ref('nameInput')
const pwdInput = ref('pwdInput')
const filed = computed(() => {
  let holder = i18n_t('login.input.name.placeholder')
  let name = {
    text: i18n_t('login.input.name.text'),
    placeholder: i18n_t('login.input.name.placeholder'),
    rules: [{ required: true, message: holder }]
  }
  holder = i18n_t('login.input.pwd.placeholder')
  let pwd = {
    text: i18n_t('login.input.pwd.text'),
    placeholder: holder,
    rules: [{ required: true, message: holder }]
  }
  resetErrorMessage(nameInput, 'name')
  resetErrorMessage(pwdInput, 'password')
  return {
    name: name,
    pwd: pwd
  }
})
const resetErrorMessage = function (refObj, name) {
  //如果已经显示错误信息，需要主动validate一次
  if (refObj && refObj.value && vanFrom) {
    nextTick(function () {
      let els = refObj.value.$el.getElementsByClassName('van-field__error-message')
      if (els && els.length > 0) {
        //用来改变 错误提示的 语言
        vanFrom.value.validate(name).catch((e) => {})
      }
    })
  }
}
//表单及 语言切换 相关----end----

//表单 相关----begin----
const form = reactive({
  name: 'john996',
  pwd: '123456'
})
const onSubmit = async function (values) {
  let res= await login({username:form.name,password:form.pwd})
    if (res.code==200){
       console.log('--login--',res)
        userInfoStore().setData(res.data)
        router.replace({
          path: '/mainhome'
        })
    }

}
//表单 相关----end----

import imgpath2 from '@/assets/img/m1.png'
import imgearch from '@/assets/img/earth.png'

</script>
<template>
  <page-root class="page-back-xk">
    <!--自定义van-nav-bar的slot-->
    <!--    <template v-slot:left></template>-->
    <!--    <template v-slot:title><div>我的title</div></template>-->
    <!--    <template v-slot:right><div>我的right</div></template>-->
    <template v-slot:body>
      <div class="content">
        <div
          ref="meteorAnimRef"
          :class="meteorAnim.name"
          :style="{
            top: meteorAnim.top + 'px',
            right: meteorAnim.right + 'px',
            '--duration': meteorAnim.duration + 's'
          }"
        />
        <div class="earth-panel">
          <van-image
            width="380"
            height="380"
            :src="imgearch"
            class="animate__animated animate__slideInLeft"
          />
        </div>

        <div class="input-sec">
          <div class="logo-sec">
            <div
              ref="logoShadowRef"
              :class="logoShadow + ' ' + logoShadowAlpha"
              style="width: 90px; height: 90px; overflow: hidden"
            >
              <van-image
                ref="imageLogoRef"
                v-show="showLogo"
                width="90"
                height="90"
                class="logo-top"
                :class="logoTopAnimCls"
                :src="imgpath2"
              ></van-image>
            </div>
          </div>
          <div ref="inputHiddenRef" :class="inputHidden">
            <van-form
              ref="vanFrom"
              @submit="onSubmit"
              style="display: flex; flex-direction: column; align-items: center"
            >
              <transition name="input-login">
                <div class="input-back" v-show="showInputLogin">
                  <div style="margin: 10px 0% 40px 0%">
                    <van-field
                      ref="nameInput"
                      v-model="form.name"
                      name="name"
                      :label="filed.name.text"
                      :placeholder="filed.name.placeholder"
                      :rules="filed.name.rules"
                    />
                    <van-field
                      ref="pwdInput"
                      v-model="form.pwd"
                      type="password"
                      name="password"
                      :label="filed.pwd.text"
                      :placeholder="filed.pwd.placeholder"
                      :rules="filed.pwd.rules"
                    />
                  </div>
                </div>
              </transition>

              <transition name="btn-login">
                <div class="login-button" v-show="showInputLogin">
                  <!--避免干扰-->
                  <van-button
                    v-wave
                    round
                    type="primary"
                    native-type="submit"
                  >
                    <template v-slot:icon>
                      <svg-icon name="youjiantou" color="white" size="24"></svg-icon>
                    </template>
                  </van-button>
                </div>
              </transition>
              <div class="trd-login">
                <van-icon name="wechat" color="white" size="24" />
                <van-icon name="qq" color="white" size="24" />
                <van-icon name="weibo" color="white" size="24" />
                <van-icon name="alipay" color="white" size="24" />
              </div>
            </van-form>
          </div>
        </div>

        <div class="privacy-class">
          <div v-animate-css.click="'tada'">
            <div ref="textRef" class="text" :class="textBorderCls">
              <span v-for="(txt, idx) in privacyText" :key="idx">
                {{ txt }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </page-root>
</template>

<style scoped>
/*背景*/
.page-back-xk {
  width: 100vw;
  background-color: #070606;
  perspective: 500px;
  overflow: hidden;
}
/*旋转*/
.page-back-xk::after {
  z-index: 1;
  content: '' !important;
  background-image: radial-gradient(white, rgba(255, 255, 255, 0.2) 4px, transparent 40px),
    radial-gradient(white, rgba(255, 255, 255, 0.15) 5px, transparent 30px),
    radial-gradient(white, rgba(255, 255, 255, 0.1) 3px, transparent 40px),
    radial-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1) 2px, transparent 30px);
  background-size: 550px 550px, 350px 350px, 250px 250px, 150px 150px;
  background-position: 0 0, 40px 60px, 130px 270px, 70px 100px;
  position: absolute;
  top: -50vh;
  left: -50vh;
  height: 200vh;
  width: 200vh;
  animation: rotateImg 40s infinite linear;
  transform-style: preserve-3d;
}
@keyframes rotateImg {
  100% {
    background-image: radial-gradient(white, rgba(255, 255, 255, 0.2) 2px, transparent 40px),
      radial-gradient(white, rgba(255, 255, 255, 0.15) 3px, transparent 30px),
      radial-gradient(white, rgba(255, 255, 255, 0.1) 2px, transparent 40px),
      radial-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1) 1px, transparent 30px);
    transform: translateZ(-60px) rotateZ(360deg);
  }

  50% {
    background-image: radial-gradient(white, rgba(255, 255, 255, 0.2) 3px, transparent 40px),
      radial-gradient(white, rgba(255, 255, 255, 0.25) 2px, transparent 30px),
      radial-gradient(white, rgba(255, 255, 255, 0.1) 3px, transparent 40px),
      radial-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1) 2px, transparent 30px);
    transform: translateZ(-30px) rotateZ(180deg);
  }

  0% {
    background-image: radial-gradient(white, rgba(255, 255, 255, 0.2) 2px, transparent 40px),
      radial-gradient(white, rgba(255, 255, 255, 0.15) 3px, transparent 30px),
      radial-gradient(white, rgba(255, 255, 255, 0.1) 2px, transparent 40px),
      radial-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1) 1px, transparent 30px);
    transform: translateZ(0px) rotateZ(0deg);
  }
}

.content {
  height: 100vh;
  position: relative;
  z-index: 2;
  overflow: hidden;
}

/*从顶部向下*/
.input-login-enter-active {
  animation: backInDown 1s;
}
/*从底部向上*/
.btn-login-enter-active {
  animation: backInUp 1s;
}

:deep(.van-cell),
:deep(.van-cell-group) {
  background: transparent;
}
:deep(.van-field__control),
:deep(.van-field__label),
:deep(.van-field) {
  color: white;
}
:deep(.van-cell:after) {
  position: relative;
}
.input-back {
  background: #28282d9f;
  width: 76vw;
  border-radius: 20px;
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.input-sec {
  position: absolute;
  width: 100vw;
  top: 140px;
  .logo-sec {
    width: 100%;
    display: flex;
    justify-content: center;
    min-height: 200px;
    padding-bottom: 72px;
  }
  .logo-shadow {
    background: #03e9f4;
    box-shadow: 0 0 15px #03e9f4, 0 0 15px #03e9f4, 0 0 15px #03e9f4, 0 0 15px #03e9f4;
  }
  @keyframes logo-shadow-alpha-frame {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0.35;
    }
  }
  .logo-shadow-alpha-0 {
    animation: logo-shadow-alpha-frame 0.5s linear;
    animation-delay: 2.2s;
    animation-fill-mode: forwards;
  }
  .logo-top {
    overflow: hidden;
  }
  .logo-top-anim {
    opacity: 0;
    animation-name: zoom;
    animation-delay: 1s;
    animation-duration: 0.4s;
    animation-fill-mode: forwards;
    @keyframes zoom {
      0% {
        opacity: 0;
        transform: scale(0);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  /*缩小*/
  .input-hidden {
    animation: input-hidden-zoom 0.5s linear;
    animation-delay: 2s;
    animation-fill-mode: forwards;
  }
  /*恢复*/
  .input-hidden-cancel {
    animation: input-hidden-zoom-cancel 0.15s linear;
    animation-fill-mode: forwards;
  }
  @keyframes input-hidden-zoom {
    0% {
      opacity: 1;
      transform: scale(1);
    }
    100% {
      opacity: 0.4;
      transform: scale(0.6);
    }
  }
  @keyframes input-hidden-zoom-cancel {
    0% {
      opacity: 0.4;
      transform: scale(0.6);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
}
.login-button {
  margin-top: -56px;
  :deep(.van-button--primary) {
    width: 112px;
    height: 112px;
    background: #28282d9f;
    border-color: #28282d00;
    background: linear-gradient(to right bottom, #f59fe6 0%, #a542e5 100%);
    /*filter: hue-rotate(0deg);*/
    overflow: hidden;
    .van-button__icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    animation: button-bg-frame 1s infinite linear;
    @keyframes button-bg-frame {
      //位移+颜色 切换
      100% {
        filter: hue-rotate(0deg);
        //background-position: -150% 0;
      }
      50% {
        filter: hue-rotate(45deg);
        //background-position: 0% 0;
      }
      0% {
        filter: hue-rotate(0deg);
        //background-position: 150% 0;
      }
    }
  }
}

.trd-login {
  width: 360px;
  display: flex;
  flex-direction: row;
  margin-top: 32px;
  justify-content: space-between;
  i {
    opacity: 0;
    animation: alpha-frame 0.5s ease-in-out;
    animation-fill-mode: forwards;
  }
  @for $i from 1 through 4 {
    i:nth-child(#{$i}) {
      @if $i==2 or $i==3 {
        margin-top: 30px;
      }
      //$time : (1+0.3*($i - 1))+s;
      //animation-delay: $time;
      animation-delay: (1+0.3 * ($i - 1)) + s; //逐次延时效果
    }
  }
  @keyframes alpha-frame {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
}

/*地球*/
.earth-panel {
  animation: rotateEarth 40s infinite linear;
  z-index: 0;
  position: absolute;
  left: -400px;
  bottom: -320px;
  animation-delay: 1.3s;
  @keyframes rotateEarth {
    100% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    0% {
      transform: rotate(360deg);
    }
  }
}

/*版权*/
.privacy-class {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: absolute;
  width: 100vw;
  margin-bottom: 80px;
  bottom: 0;
  .text {
    /*放在logo里 手机浏览器无效？？*/
    font-size: 36px;
    /*背景动画，背景图和背景色*/
    /*1、背景图：图片本身有尺寸，可以不设置*/
    /*background: url('@/assets/img/m1.png');*/
    /*2、背景色*/
    //background: linear-gradient(to right, #02fdfc 0%, #fe31c4 100%);
    background: linear-gradient(to right, red, orange, yellow, green, cyan, blue, purple);
    /*背景自适应div*/
    background-size: 150% 100%;
    /*3、使用动画必须设一个背景尺寸*/
    //animation: text-bg-anim 4s infinite linear;
    /*4、clip必须放在background 后面*/
    -webkit-background-clip: text;
    background-clip: text;
  }
  .text-content {
    span {
      animation: text-content-anim 0.12s linear;
      animation-fill-mode: forwards;
    }
    @for $i from 1 through 6 {
      span:nth-child(#{$i}) {
        animation-delay: (0.13 * $i) + s; //逐次延时效果
      }
    }
  }
  @keyframes text-content-anim {
    100% {
      color: transparent;
    }
  }
  .text-bg-anim {
    animation: text-bg-frame 4s infinite linear;
    color: transparent;
  }
  @keyframes text-bg-frame {
    //位移+颜色 切换
    100% {
      filter: hue-rotate(0deg);
      background-position: -150% 0;
    }

    50% {
      filter: hue-rotate(360deg);
      background-position: 0% 0;
    }

    0% {
      filter: hue-rotate(180deg);
      background-position: 150% 0;
    }
  }

  .text-border::before {
    position: absolute;
    width: 200px;
    height: 60px;
    top: -7px;
    left: calc(50% - 100px);
    border: 2px solid #ffd700;
    border-radius: 10px;
    opacity: 0;
    animation: borderAni 3s linear;
    overflow: hidden;
  }
  @keyframes borderAni {
    0% {
      opacity: 0.1;
      clip-path: inset(0 0 0 98%);
      border-color: #ffd700;
    }
    25% {
      opacity: 0.3;
      clip-path: inset(0 98% 0 0);
      border-color: #d0ff00;
    }
    50% {
      opacity: 1;
      clip-path: inset(98% 0 0 0);
      border-color: #00ff59;
    }
    75% {
      opacity: 0.9;
      clip-path: inset(0 0 0 98%);
      border-color: #00ffd9;
    }
    90% {
      opacity: 0.6;
      clip-path: inset(0 0 98% 0);
      border-color: #0059ff;
    }
    100% {
      opacity: 0.3;
      clip-path: inset(0 0 98% 0);
      border-color: #f700ff;
    }
  }
}

.meteor {
  position: absolute;
  width: 400px;
  height: 15px;
  z-index: 0;
  transform: translateX(100px) rotateZ(315deg);
  animation: meteor-frame var(--duration) ease-in; //infinite
  background: linear-gradient(to right, white, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.1));
  clip-path: polygon(0 0, 0% 100%, 100% 50%);

  border-radius: 15px;
}
@keyframes meteor-frame {
  0% {
    opacity: 0.3;
  }
  100% {
    opacity: 1;
    transform: translateX(-600px) translateY(600px) rotateZ(315deg);
  }
}
</style>
