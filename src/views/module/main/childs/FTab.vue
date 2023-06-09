<template>
  <div>
    <!--注意：van-tabs默认 是lazy-load。导致切换时，没有准确高度，需要延迟去更新scrollTop 或者 关闭lazy-load
-->
    <van-tabs
      ref="root"
      style="width: 100vw"
      v-model:active="tabsActive"
      @rendered="rendered"
      animated
    >
      <van-tab title="标签 1">
        <van-space direction="vertical" fill :size="0">
          <van-swipe :width="swipeWidth" :loop="false">
            <!--              @resize="callNextTick"-->
            <!--              :autoplay="3000"-->
            <!--              lazy-render-->
            <van-swipe-item
              :style="{ height: swipeWidth + 'px' }"
              v-for="image in images"
              :key="image"
            >
              <img :style="{ width: swipeWidth + 'px', height: swipeWidth + 'px' }" :src="image" />
            </van-swipe-item>
          </van-swipe>
          <van-grid square class="van-hairline--bottom">
            <van-grid-item
              v-for="(item, idx) in gridItems"
              :key="idx"
              :icon="item.url"
              :text="item.title"
              v-wave
              @click="clickGrid(item)"
            />
          </van-grid>
          <van-card
            v-for="(item, idx) in listItems"
            :key="idx"
            class="van-hairline--bottom"
            num="2"
            price="2.00"
            :desc="''"
            :title="idx + ' ' + item.title"
            thumb="https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg"
          >
            <template #desc>
              <div style="margin: 5px 0px 10px 0px; color: #707070" class="three-row">
                <!--                  van-multi-ellipsis&#45;&#45;l3-->
                {{ item.message }}'
              </div>
            </template>
            <template #tags>
              <van-tag plain type="primary">标签</van-tag>
              <van-tag plain type="primary">标签</van-tag>
            </template>
            <template #footer>
              <van-button size="mini">按钮</van-button>
              <van-button size="mini">按钮</van-button>
            </template>
          </van-card>
        </van-space>
      </van-tab>
      <van-tab title="标签 2">
        <div style="width: 100vw" :style="pageHeight"></div>
      </van-tab>
      <van-tab title="标签 3">
        <div style="width: 100vw" :style="pageHeight"></div>
      </van-tab>
      <van-tab title="标签 4"> <van-empty :style="pageHeight" :description="'内容 4'" /></van-tab>
    </van-tabs>
  </div>
</template>

<script>
import { nextTick } from 'vue'
import { useParent } from '@vant/use'
import Api from '@/utils/axios/api'
import Is from '@/utils/is'
import { themeStore } from '@/stores/theme'
export default {
  name: 'FTab',
  computed: {
    pageHeight: function () {
      if (this.$refs.root) {
        return 'height:' + this.$refs.root.$el.clientHeight + 'px;'
      }
      return ''
    }
  },
  inject: ['navParams'],
  props: ['relationKey'],
  setup(props, context) {
    const { parent } = useParent(props.relationKey)
    return {
      parent
    }
  },
  data() {
    return {
      tabsActive: 0,
      swipeWidth: 0,
      images: [
        'https://fastly.jsdelivr.net/npm/@vant/assets/apple-1.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/apple-2.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg',
        'https://fastly.jsdelivr.net/npm/@vant/assets/apple-3.jpeg'
      ],
      gridItems: [],
      listItems: []
    }
  },
  created() {},
  mounted() {
    this.init(true)
  },
  activated() {
    // 恢复scolltop
    this.init()
  },
  deactivated() {
    this.setScrollCache()
  },
  beforeUnmount() {
    this.setScrollCache()
  },
  methods: {
    init(firstLoad) {
      nextTick(() => {
        if (firstLoad) {
          this.gridTest()
          this.load(true)
        }
        //注：因为没有 只是存在main中，页面刷新会丢失
        let top = this.parent.getScrollTop(this.$options.name, this.$el.scrollTop)
        if (top != undefined) {
          this.$el.scrollTop = top
          // console.log('mounted', this.$el.scrollTop)
        }
      })

      this.callNextTick()
    },
    gridTest() {
      this.gridItems = []
      this.gridItems.push({
        title: 'van-li',
        url: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg'
      })
      this.gridItems.push({
        title: 'scroller-li',
        url: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg'
      })
      this.gridItems.push({
        title: 'theme',
        url: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg'
      })
      this.gridItems.push({
        title: 'echarts',
        url: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg'
      })
      this.gridItems.push({
        title: 'navBar',
        url: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg'
      })
      this.gridItems.push({
        title: '语言',
        url: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg'
      })
      this.gridItems.push({
        title: '页面切换数据交互',
        url: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg'
      })
        this.gridItems.push({
            title: 'webrtc',
            url: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg'
        })
      this.gridItems.push({
        title: 'threejs',
        url: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg'
      })
        this.gridItems.push({
            title: 'aframe',
            url: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg'
        })

      // for (var i = 0; i < 3; i++) {
      //   this.gridItems.push({
      //     title: '文本' + i,
      //     url: 'https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg'
      //   })
      // }
    },
    async load(refresh, callback) {
      let isFinished = false

      let page = 0
      let pageSize = 20
      if (!refresh) {
        if (this.listItems.length % pageSize == 0) {
          page = this.listItems.length / pageSize
        } else {
          isFinished = true
        }
      }
      let res = await Api.Get(
        {
          page: page,
          pageSize: 20
        },
        '/api-dev/list/get'
      ).catch((err) => {})
      if (refresh) {
        this.listItems = []
      }
      if (res && res.code == 200) {
        this.listItems.push(...res.data.datas)
        if (res.data.datas.length < 20) {
          isFinished = true
        }
      }
      if (Is.isFunction(callback)) callback({ isFinished: isFinished })
    },
    setScrollCache() {
      this.parent.setScrollTop(this.$options.name, this.$el.scrollTop)
      // console.log('beforeUnmount', this.$el.scrollTop)
    },
    rendered() {
      setTimeout(() => {
        let top = this.parent.getScrollTop(this.$options.name, this.$el.scrollTop)
        if (top != undefined) {
          this.$el.scrollTop = top
          // console.log('mounted', this.$el.scrollTop)
        }
      }, 20)
    },
    callNextTick() {
      nextTick(() => {
        this.swipeWidth = this.$refs.root.$el.clientWidth / 3
      })
    },
    clickGrid(val) {
      let name = null
        let data=null
      if (val.title == 'van-li') {
        name = 'list_van'
      } else if (val.title == 'scroller-li') {
        name = 'list_scroller'
      } else if (val.title == 'theme') {
        themeStore().setData(themeStore().data == 'dark' ? 'light' : 'dark')
      } else if (val.title == 'echarts') {
        name = 'echarts'
      } else if (val.title == 'navBar') {
        this.navParams.nav.show = !this.navParams.nav.show
      } else if (val.title == '语言') {
        this.parent.changeLan()
      } else if (val.title == '页面切换数据交互') {
        name = 'data_trans'
          data={
              data: { userId: '123' }
          }
      }else if(val.title=='webrtc'){
          name='test_video'
      }else if (val.title == 'threejs') {
         name='test_threejs_load'
          // name='testthree'
      }else if (val.title == 'aframe') {
          name='test_aframe'
      }

      if (name) {
        this.$router.push({
          name: name,
          state:data
        })
      }
    }
  }
}
</script>

<style scoped></style>
<style lang="scss" scoped>
.one-row {
  @include ellipsis(1);
}
.two-row {
  @include ellipsis(2);
}
.three-row {
  @include ellipsis(3);
}
</style>
