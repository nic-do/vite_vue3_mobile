<script setup name="echarts">
////////////////****all import****//////////
import {
  provide,
  ref,
  reactive,
  computed,
  watch,
  nextTick,
  onActivated,
  onDeactivated,
  inject,
  onMounted
} from 'vue'
import { useRouter } from 'vue-router'
import PageRoot, { PageNavDef } from '@/components/page'
import Echart from '@/components/echarts'
import { showNotify } from 'vant'
const i18n_t = inject('i18n_t')
const router = useRouter()
////////////////////////////////////////////
////////////////////////////////////////////
onMounted(() => {
  if (history.state.data) {
    showNotify({ type: 'danger', message: JSON.stringify(history.state.data) })
  }
})
onActivated(() => {})
onDeactivated(() => {})
nextTick(function () {})
// 响应式透出
// nav：既要响应show的动态修改（reactive）又要响应语言的切换（computed+reactive）
// computed导致无法watch
const navDef = reactive({
  nav: PageNavDef.config({
    title: computed(() => {
      // 直接赋值 无响应式，是否有其他方式？？？
      return i18n_t('main.nav.title')
    }),
    leftText: computed(() => {
      return i18n_t('main.nav.leftText')
    }),
    rightText: '关闭data',
    clickRight: function () {
      router.goBack(-1, { data: 'backfrom echarts 111' })
      return false
    }
  })
})
//透传nav
provide('navParams', navDef)

const showPopover = ref(false)
// const chartTypes=ref(['pie'])
let chartCur = 'bar'
const echartOption = reactive({
  title: { text: '在Vue中使用echarts' },
  tooltip: {},
  xAxis: {
    data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
  },
  yAxis: {},
  series: [
    {
      name: '销量',
      type: chartCur,
      data: [5, 20, 36, 10, 10, 20]
    }
  ]
})
const echartTheme = ref('roma')
const actions = ref([])
const actionsThemes = ref([])
const chartRef = ref('chartRef')

const onSelectTheme = (action) => {
  echartTheme.value = action.text
}
const onSelect = (action) => {
  click(1, action.text)
}
const click = async function (val, chart) {
  if (val == 1) {
    if (chart) chartCur = chart
    // let flag = echartTheme.value == 'roma'
    // echartTheme.value = flag ? 'chalk' : 'roma'
    Object.assign(
      echartOption,
      chart == 'bar' || chart == 'line'
        ? {
            title: { text: '2113' },
            tooltip: {},
            xAxis: {
              data: ['衬衫', '0羊毛衫', '0雪纺衫', '0裤子', '高跟鞋', '袜子']
            },
            yAxis: {},
            series: [
              {
                name: '销量',
                type: chartCur,
                data: [36, 20, 10, 10, 36, 20]
              }
            ]
          }
        : {
            title: { text: '在Vue中使用echarts' },
            tooltip: {},
            xAxis: {
              data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
            },
            yAxis: {},
            series: [
              {
                name: '销量',
                type: chartCur,
                data: [5, 20, 36, 10, 10, 20]
              }
            ]
          }
    )
  } else {
    if (actions.value.length == 0) {
      chartRef.value.chartTypes.forEach((it) => {
        actions.value.push({
          text: it
        })
      })
    }
    if (actionsThemes.value.length == 0) {
      chartRef.value.chartTheme.forEach((it) => {
        actionsThemes.value.push({
          text: it
        })
      })
    }
  }
}
</script>
<template>
  <page-root class="list-page">
    <template v-slot:body>
      <echart ref="chartRef" :option="echartOption" :theme="echartTheme"></echart>
      <!--        :chart-types="chartTypes"-->
      <!--      <van-button v-wave round block type="primary" @click="click(1)">-->
      <!--        theme-data-change-->
      <!--      </van-button>-->
      <!--      <van-button v-wave round block type="primary" @click="click(2)"> chart-change </van-button>-->
      <van-space :direction="'vertical'" :size="16">
        <van-popover theme="dark" :actions="actions" @select="onSelect">
          <template #reference>
            <van-button type="primary" @click="click(2)">change-chart</van-button>
          </template>
        </van-popover>

        <van-popover theme="dark" :actions="actionsThemes" @select="onSelectTheme">
          <template #reference>
            <van-button type="primary" @click="click(2)">change-theme</van-button>
          </template>
        </van-popover>
      </van-space>
    </template>
  </page-root>
</template>

<style scoped></style>
<style scoped lang="scss"></style>