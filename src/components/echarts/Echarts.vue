<template>
  <div ref="rootRef" class="size" style="--aspect-ratio: 1.4">
    <div ref="echartRef"></div>
  </div>
</template>

<script>
//echarts build文件比较大，可以考虑cdn引入
// import * as echarts from 'echarts'
import { nextTick, watch, ref } from 'vue'
import { useWindowSize } from '@vant/use'
//https://echarts.apache.org/zh/theme-builder.html
//1、点击 下载主题（重点：一定不能用导出配置） 在json页签中 点击复制，在theme目录下保存为.json文件
//2、import json
//3、registerTheme
//4、在echarts.init中引用 （动态修改，如果已经初始化，再修改需要先echarts.dispose）

export default {
  name: 'Echarts',
  setup(props, context) {
    const { width, height } = useWindowSize()
    // const echartStyle={
    //         width:'',
    //         height:''
    //     }
    /////////////////////////////////////////////
    let curTheme = props.theme
    let usedCharts = []
    let echarts = null
    let echart = null
    const rootRef = ref()
    const echartRef = ref()
    //echart不能定义成ref，否则resize 抛错
    const loadOnDemand = async function () {
      if (!echarts) {
        let load = 'load'
        let componentName = 'component'
        //import  core
        let lib = await import(`./load/${load}.js`).catch((err) => {
          console.log('--echarts-load--', err)
        })
        if (lib.default != undefined) {
          echarts = lib.default
          //import  component
          let com = await import(`./load/component/${componentName}.js`).catch((err) => {
            console.log('--echarts-load--', err)
          })
          if (com.default != undefined) {
            com.default(echarts)
          }
        }
      }
    }
    const loadChart = async function (chartType) {
      if (usedCharts.indexOf(chartType) < 0) {
        //import  chart
        let chart = await import(`./load/chart/${chartType}.js`).catch((err) => {
          console.log('--echarts-load--', err)
        })
        if (chart.default != undefined) {
          usedCharts.push(chartType)
          chart.default(echarts)
        }
      }
    }
    const init = async function (theme) {
      //// 重要  释放之前的图表实例，否则改变的主题无效果
      if (echart) {
        echart.dispose()
        echart = null
      }
      await loadOnDemand()
      if (theme) {
        //theme='roma'
        // 注：import()参数 假如带有 @ 这种别名路径的，如果加载不成功，
        // 请尝试用../../这种路径。（遇到过这种情况） 见：svg加载说明.txt
        let data = await import(`@/components/echarts/theme/${theme}.project.json`).catch((err) => {
          console.log('--echarts-theme--', err)
        })
        if (data) {
          //data类型是module需要转换
          let themeData = {}
          for (let key in data) {
            themeData[key] = data[key]
          }
          echarts.registerTheme(theme, themeData)
        }
      }
      let series = props ? props.option['series'] : null
      let flag = false
      if (series) {
        for (let i = 0; i < series.length; i++) {
          if (usedCharts.indexOf(series[i].type) < 0) {
            await loadChart(series[i].type)
            flag = true
          }
        }
      }
      echart = echarts.init(echartRef.value, theme, { width: 'auto', height: 'auto' })
      if (flag) {
        await refreshChart()
      }
    }
    const refreshChart = async function (type) {
      if (echart) {
        if (type != 1) {
          // 属性变化， 绘制图表
          echart.setOption(props.option, true)
        } else {
          //尺寸变化
          //使用auto就能够 随浏览器缩放，如果不行，再使用echartStyle 设置精确尺寸
          //echart.resize({width:echartStyle.width,height:echartStyle.height})
          echart.resize({ width: 'auto', height: 'auto' })
        }
      }

      // console.log(echart)
    }
    watch([width, height], () => {
      //尺寸变化
      nextTick(() => {
        // echartStyle.width=rootRef.value.clientWidth
        // echartStyle.height=rootRef.value.clientHeight
        if (echarts != null) refreshChart(1)
      })
    })

    //同时改变option 和 theme。init会执行两次
    watch(props.option, (value, oldValue, onCleanup) => {
      if (echarts != null) {
        //属性变化
        nextTick(async () => {
          let flag = false
          let series = value['series']
          if (series) {
            for (let i = 0; i < series.length; i++) {
              if (usedCharts.indexOf(series[i].type) < 0) {
                flag = true
                  break
              }
            }
          }
          if (flag) {
            await init()
          } else {
            await refreshChart()
          }
        })
      }
    })
    //这里的theme只能这样监听
    watch(
      () => props.theme,
      () => {
        //主题变化
        nextTick(async () => {
          if (echarts != null) {
            if (props.theme != curTheme) {
              curTheme = props.theme
              await init(props.theme)
              await refreshChart()
            }
          }
        })
      }
    )
    return {
      echarts,
      usedCharts,
      loadChart,
      rootRef,
      echartRef,
      // echartStyle,
      curTheme,
      init,
      refreshChart,
      echart
    }
  },
  computed: {},
  props: {
    option: {},
    theme: null
  },
  data() {
    return {
      chartTypes: ['bar', 'line', 'pie'],
      chartTheme: ['chalk', 'dark', 'purple-passion', 'roma']
    }
  },
  mounted() {
    nextTick(async () => {
      if (!this.echart) {
        await this.init(this.curTheme)
      }
      await this.refreshChart()
    })
  },
  methods: {}
}
</script>

<style scoped>
.size {
  width: 100vw;
}
</style>