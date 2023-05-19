<template>
  <div style="width: 100vw; height: 100vh; overflow: hidden; overflow-y: scroll">
    <van-space direction="vertical" size="10" style="min-height: 120vh">
      <!--      <van-divider>数字动画-&#45;&#45;begin</van-divider>-->
      <!--        <van-space direction="horizontal" size="20">-->
      <!--            <v-number class="v-number-example" :value="number" />-->
      <!--            <v-number v-model="likes" :value="number2"></v-number>-->
      <!--        </van-space>-->
      <!--        <div @click="number -= 20">点击</div>-->
      <!--      <van-divider >数字动画-&#45;&#45;end</van-divider>-->
      <div style="display: flex; flex-direction: column">
        <div>2x-3x-img</div>
        <div class="bg_x2_x3_img"></div>
          <img class="x2_x3_img"/>
        <div>测试图片上传（mock）</div>
        <v-uploader></v-uploader>
        <van-button style="width: 200px" v-wave>wave动画</van-button>
      </div>
      <div>
        <van-divider>svg显示---begin</van-divider>
        <van-space direction="horizontal" size="20">
          <svg-icon name="logo2" path="main" color="black" size="24">
            <!--            这个颜色改不了-->
          </svg-icon>
          <svg-icon name="youjiantou" color="blue" size="24"></svg-icon>
          <van-icon name="wechat" color="orange" size="24" />
          <van-icon name="qq" color="red" size="24" />
          <van-icon name="weibo" color="pink" size="24" />
          <van-icon name="alipay" color="black" size="24" />
        </van-space>
        <van-divider>svg显示---begin</van-divider>
      </div>
      <div>
        <van-divider>v-animate-css---begin</van-divider>
        <div class="box" v-animate-css.click="'tada'" @click="animatecssShow = !animatecssShow">
          点解显示隐藏的内容
        </div>
        <div class="box" v-animate-css.click="animationInfinite">点击闪烁</div>
        <div class="animate__animated animate__bounce" v-if="animatecssShow">
          An animated element
        </div>
        <transition name="box">
          <div class="box" v-if="animatecssShow">5687987gyuioi</div>
        </transition>
        <transition
          name="box"
          enter-active-class="animate__animated animate__backInDown"
          leave-active-class="animate__animated animate__backOutRight"
        >
          <div class="box" v-if="animatecssShow">45678908</div>
        </transition>
        <van-divider>v-animate-css---end</van-divider>
      </div>
      <div>
        <van-divider>vue2-animate---begin</van-divider>
        <div @click="vue2AnimateShow = !vue2AnimateShow">点击查看动画</div>
        <transition name="fade">
          <div class="box" v-show="vue2AnimateShow">vue2-animate-1</div>
        </transition>
        <transition-group name="bounce" tag="渲染的父元素标签">
          <template v-for="value in 2" :key="'' + value + 'dd'">
            <div class="box" v-show="vue2AnimateShow">vue2-animate-2</div>
          </template>
        </transition-group>
        <van-divider>vue2-animate---end</van-divider>
      </div>
      <div>
        <van-divider>vue3-sfc-transitions---begin</van-divider>
        <div @click="sfctransitionsShow = !sfctransitionsShow">点击查看动画</div>
        <transition name="slide-x">
          <div class="box" v-show="sfctransitionsShow">sfc-transitions-1</div>
        </transition>
        <transition-group name="zoom" tag="渲染的父元素标签">
          <template v-for="value in 2" :key="'' + value + 'dd'">
            <div class="box" v-show="sfctransitionsShow">sfc-transitions-2</div>
          </template>
        </transition-group>
        <van-divider>vue3-sfc-transitions---end</van-divider>
      </div>
      <div>
        <van-divider>animate-onscroll---begin</van-divider>
        <div v-animate-onscroll.repeat="{ up: 'animated slideInLeft' }" class="img3">
          <!--              <div style="color: red" v-prlx.mobile.background="{ speed: 100.12 }" />-->
        </div>
        <div v-animate-onscroll="'animated flip'" class="anibox">Animate me once upon scroll</div>
        <!--如果每次滚动到当前位置 重复动画，则添加repeat -->
        <div v-animate-onscroll.repeat="'animated flip'" class="anibox">永远滚动时动画我</div>

        <!-- 如果每次 -->
        <div v-animate-onscroll.repeat="{ up: 'animated slideInLeft' }" class="anibox">
          滚动方向 up
        </div>

        <div v-animate-onscroll.repeat="{ down: 'animated flip' }">多个动画0</div>
        <!--  -->
        <div v-animate-onscroll.repeat="{ down: 'animated flip' }" class="anibox">
          滚动方向 down
        </div>
        <!-- 多个动画 -->
        <div v-animate-onscroll="{ down: 'animated flip', up: 'animated rotateOut' }">多个动画</div>
        <van-divider>animate-onscroll---end</van-divider>
      </div>

      <div>
        <van-divider>prlx---begin</van-divider>
        <div v-prlx.mobile.background="{ speed: 0.12 }" class="img2"></div>
        <van-grid style="width: 100vw" square class="van-hairline--bottom">
          <van-grid-item v-for="value in 8" :key="value" icon="photo-o" text="文字" v-wave>
            <template v-slot:icon>
              <div
                v-prlx.mobile.background="{ speed: 0.12, fromBottom: true, custom: true }"
                class="img"
              />
            </template>
          </van-grid-item>
        </van-grid>
        <van-divider>prlx---end</van-divider>
      </div>
      <div>
        <van-divider>prlx---begin</van-divider>
        <div v-prlx.mobile.background="{ speed: 0.12 }" class="img2"></div>
        <van-grid style="width: 100vw" square class="van-hairline--bottom">
          <van-grid-item v-for="value in 8" :key="value" icon="photo-o" text="文字" v-wave>
            <template v-slot:icon>
              <div
                v-prlx.mobile.background="{ speed: 0.12, fromBottom: true, custom: true }"
                class="img"
              />
            </template>
          </van-grid-item>
        </van-grid>
        <van-divider>prlx---end</van-divider>
      </div>
      <div>
        <van-divider>图片按比例显示---begin</van-divider>
        <div>在线图片懒加载；高宽2/1</div>
        <van-image
          style="width: 50%; --aspect-ratio: 0.5"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
        />
        <div>在线图片懒加载；宽高2/1</div>
        <van-image
          style="width: 50%; --aspect-ratio: 2"
          src="https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg"
        />
        <div style="display: flex; flex-direction: column">
          在线图片懒加载；宽高1/1
          <van-image
            v-lazy
            :src="'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg'"
            style="width: 50%; --aspect-ratio: 1"
          />
        </div>

        <div style="margin-top: 20px">资源图片；宽高1/2</div>
        <van-image :src="imgpath2" style="width: 50%; --aspect-ratio: 0.5" />

        <div>资源图片；宽高2/1</div>
        <van-image :src="imgpath2" style="width: 50%; --aspect-ratio: 2" />

        <div>资源图片；宽高1/1</div>
        <van-image v-lazy :src="imgpath2" style="width: 50%; --aspect-ratio: 1" />
        <div style="margin-top: 20px">"img" 为何不起作用</div>
        <img
          alt="Vue logo"
          class="logo"
          :src="imgpath2"
          style="width: 50%; --aspect-ratio: 2"
          v-prlx.mobile.background="{ speed: 10.12, fromBottom: true, custom: true }"
        />
        <!--资源图片懒加载-->
        <img
          v-animate-onscroll.repeat="'swing'"
          alt="Vue logo"
          class="logo"
          v-lazy="imgpath2"
          style="width: 100%; --aspect-ratio: 2"
        />

        <div class="icon" style="width: 50%; --aspect-ratio: 2"></div>
        <van-divider>图片按比例显示---end</van-divider>
      </div>
    </van-space>
  </div>
</template>

<script>
import { useParent } from '@vant/use'
import { nextTick } from 'vue'
import VNumber from '@/components/v-number'
import VUploader from '@/components/v-uploader/v-uploader.vue'
import imgpath from '@/assets/png/555.webp'
export default {
  name: 'TTab',
  props: ['relationKey'],
  components: {
    VUploader,
    VNumber
  },
  setup(props, context) {
    const { parent } = useParent(props.relationKey)
    return {
      parent
    }
  },
  data() {
    return {
      imgpath2: imgpath,
      number: 200,
      likes: 153,
      number2: 100,
      animatecssShow: false,
      vue2AnimateShow: false,
      sfctransitionsShow: false,
      animationInfinite: {
        classes: 'fadeIn', //动画名
        duration: 150, //动画时间
        delay: 10, // 动画开始前延迟的时长
        iteration: 'infinite' //动画将重复的次数。任何整数或无限迭代
      }
    }
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  deactivated() {
    this.setScrollCache()
  },
  beforeUnmount() {
    this.setScrollCache()
  },
  methods: {
    init() {
      nextTick(() => {
        let top = this.parent.getScrollTop(this.$options.name, this.$el.scrollTop)
        if (top != undefined) {
          this.$el.scrollTop = top
          console.log('mounted', this.$el.scrollTop)
        }
      })
    },
    setScrollCache() {
      this.parent.setScrollTop(this.$options.name, this.$el.scrollTop)
      console.log('beforeUnmount', this.$el.scrollTop)
    }
  }
}
</script>
<style scoped>
.img {
  width: 40px;
  height: 40px;
  background-image: url('@/assets/img/m1.png');
  display: flex;
  align-items: center;
}
.img2 {
  width: 90px;
  height: 90px;
  background-image: url('@/assets/img/m1.png');
  display: flex;
  align-items: center;
}

.img3 {
  width: 160px;
  height: 160px;
  background-image: url('@/assets/img/m1.png');
  display: flex;
  align-items: center;
}
.box-enter-active {
  animation: backInDown 1s;
}
.box-leave-active {
  animation: backOutDown 1s;
}

.overlay--blue {
  background: linear-gradient(180deg, var(--color-end, #004357), transparent);
}
.text--white {
  color: #fff;
}
.v-number-example {
  font-size: 100px;
  color: PaleVioletRed;
}

@keyframes swing {
  /*v-animate-onscroll.repeat="'swing'" */
  10% {
    transform: rotate(10deg);
  }

  40% {
    transform: rotate(-10deg);
  }

  60% {
    transform: rotate(5deg);
  }

  80% {
    transform: rotate(-5deg);
  }
}
</style>
<style lang="scss">
.x2_x3_img{
  @include bg_img_2_3x('m');
  width: 100px;
  height: 100px;
}

.bg_x2_x3_img{
  @include img_2_3x('m');
  width: 100px;
  height: 100px;
}
</style>
