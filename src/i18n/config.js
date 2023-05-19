import { createI18n, useI18n } from 'vue-i18n'
//useCurrentLang获取vant当前语言；Locale修改语言
import { useCurrentLang, Locale } from 'vant'
import {translate} from "@/request/translate";
import Is from '@/utils/is'
//缓存
const loadedLanguages = []
let i18n = createI18n({
  legacy: false,
  globalInjection: false,
  allowComposition: true
  // locale: defLang // 设置默认语言
  // messages: messages // 设置资源文件对象
})
function setLanguage(lang) {
  if (i18n.mode === 'legacy') {
    i18n.global.locale = lang
  } else {
    i18n.global.locale.value = lang
  }
  // axios.defaults.headers.common['Accept-Language'] = lang
  document.querySelector('html').setAttribute('lang', lang)
}

let lanCache={}
async function useLocale(locale) {
  if (locale != null) {
    // 注：import()参数 假如带有 @ 这种别名路径的，如果加载不成功，
    // 请尝试用../../这种路径。（遇到过这种情况） 见：svg加载说明.txt
    if (loadedLanguages.indexOf(locale) < 0) {
      console.log('--i18n-', '异步加载自定义的语言包完成')

      let vmessage = []
      if (useCurrentLang().value != locale) {
        //vant 语言包要么以上全局引入，动态 引入只能抽出来自己另存文件
        console.log('--i18n-', '异步加载vant语言包完成')
        let data = await import(`@/i18n/messages/vantlang/${locale}.mjs`).catch((err) => {
          if (err) {
            console.log('--iq8n-import--vant-', err)
          }
        })
        if (!data) {
          data = { default: {} }
        }
        vmessage = data.default
      } else {
        //获取当前的message
        vmessage = Locale.messages()
      }
      let message = await import(`@/i18n/messages/${locale}.js`).catch((err) => {})
      if (vmessage&&!message){
        let ds=await getMessageFromBaidu(vmessage.telInvalid)
        if (ds){
          message = { default: ds }
        }
      }

      if (!message) {
        message = { default: {} }
      }else{
        Object.assign(lanCache,message.default)
      }
      //合并语言包
      //此处assign后，重复的语言配置 以vant的为准；若要以自定义为准，替换一下前后位置
      Object.assign(message.default, vmessage)
      loadedLanguages.push(locale)
      //设置vant语言包为合并后的语言包
      Locale.use(locale, message.default)
      //设置i18n语言包为合并后的语言包
      i18n.global.setLocaleMessage(locale, message.default)

      setLanguage(locale)
    } else {
      // let msg=i18n.global.getLocaleMessage(locale)
      Locale.use(locale)
      setLanguage(locale)
    }
  }
}
let values = []
const enumMsg=async function (obj) {
  for (const key in obj) {
    if (Is.isObject(obj[key])) {
      await enumMsg(obj[key])
    } else if (Is.isString(obj[key])){
      if (values.indexOf(obj[key])<0)
        values.push(obj[key])
    }
  }
}
const replaceMSg=function (dst,src){
  if (dst&&src){
    for (let i=0;i<src.length;i++){
      dst=dst.replaceAll("\""+src[i].src+"\"","\""+src[i].dst+"\"")
    }
  }
  return JSON.parse(dst)
}
const getMessageFromBaidu=async function (text){
  if (text){
    let translateType='youdao'
    let res=await translate({q:text,to:'zh'},translateType)
    let from=res.from
    if (res.l){
      from=res.l.split('2')[0]
      //有道翻译
    }
    if (res&&from){
      let nmsg={...lanCache}
      console.log('--translate-nmsg--',nmsg)
      values=[]
      await enumMsg(nmsg)
      if (values.length>0){
        let q= values.join('\n')
        res=await translate({q:q,to:from},translateType)
        if (res){
          let toChange=JSON.stringify(nmsg)
          console.log('--translate-back--',res)
          let trans_result=res.trans_result
          if (res.l){
            let query=res.query.split('\n')
            let ds=res.translation[0].split('\n')
            trans_result=[]
            for (let i=0;i<query.length;i++){
              trans_result.push({
                src:query[i],
                dst:ds[i]
              })
            }
          }
          return replaceMSg(toChange,trans_result)
        }
      }
    }
  }
  return null
}
async function init() {
  // 此处逻辑移动到router中，因为异步为加载完成，会导致 首页第一次读空
  // 不能直接在main.js调用，await 兼容性问题会抛错如下：
  // Top-level await is not available in the configured target environment ("chrome87", "edge88", "es2020", "firefox78", "safari14" + 2 overrides)
  if (useCurrentLang().value && loadedLanguages.length <= 0) {
    await useLocale(useCurrentLang().value)
  }
}
// async function loadsvg(name,path){
//   // 几个奇怪的问题
//   // 1、let url=`@/svg/${dddd}.js`，不能把 import url
//   // 2、不能把svg放在asset目录
//   // 3、把loadsvg 放到某些目录下单独写，也无法import
//   let svgFile =null
//   if (path&&path.indexOf('main')>=0){
//     svgFile = await import(`@/svg/main/${name}.js`).catch(err=>{
//       console.log('--i18n-loadsvg-err--',err)
//     })
//   }else{
//     svgFile = await import(`@/svg/${name}.js`).catch(err=>{
//       console.log('--i18n-loadsvg-err--',err)
//     })
//   }
//   return svgFile&&svgFile.default!=undefined?svgFile.default():null
// }
//注：useI18n 方法只能在setup中调用
export default { i18n, init, useLocale, useI18n, useCurrentLang, loadedLanguages }
