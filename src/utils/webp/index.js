import {fixeUrl} from "@/utils/wujie/wujie-url";

const webpTest = /\.(jpe?g|png)/i
let flag_isSupportWebp = null
const isSupportWebp = function () {
  //是否支持webp
  try {
    if (flag_isSupportWebp === null) {
      flag_isSupportWebp =
        document.createElement('canvas').toDataURL('image/webp', 0.5).indexOf('data:image/webp') ===
        0
    }
    return flag_isSupportWebp
  } catch (err) {
    return false
  }
}
const needWebp=function (url){
  return import.meta.env.PROD && isSupportWebp() && webpTest.test(url)
}
const getAssetsFile = (url) => {
  //注：不能修改${url} （非常重要） 另外：url可以是 'login/test1.png'
  let path = new URL(`../../assets/img/${url}`, import.meta.url).href
  if (needWebp()) {
    let idx = path.lastIndexOf('.')
    if (idx > 0) {
      path = path.substring(0, idx) + '.webp'
    }
  }
  path=fixeUrl(path)
  return path
}
const getPublicFile = (url) => {
  let path = url
  if (needWebp()) {
    let idx = path.lastIndexOf('.')
    if (idx > 0) {
      path = path.substring(0, idx) + '.webp'
    }
  }
  path=fixeUrl(path)
  return path
}
export { getAssetsFile, getPublicFile }
