//动画
import VWave from 'v-wave'
import VueAnimateOnScroll from './vue-anim-onscroll'
// import VueParticlesBg from './vue-particles-bg'
// import Particles from 'vue3-particles'

// import VueKinesis from "vue-kinesis";
import VuePrlx from './vue-prlx'
import VAnimateCss from 'v-animate-css' //
import 'vue2-animate/dist/vue2-animate.min.css' //
import 'vue3-sfc-transitions/dist/style.css'

const config = function (app) {
  //粒子特效背景
  //带反馈特效--问题：不显示
  // app.use(VueParticlesBg)
  //
  // app.use(Particles)

  // ios手机上动画无效
  // app.use(VueKinesis);

  //动画
  app.directive('prlx', VuePrlx)
  app.use(VAnimateCss)
  app.use(VueAnimateOnScroll)
  //给点击 增加 波纹效果
  app.use(VWave)
}
export default { config }
