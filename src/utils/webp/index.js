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
const getAssetsFile = (url) => {
  //注：不能修改url （非常重要） 另外：url可以是 'login/test1.png'
  let path = new URL(`../../assets/img/${url}`, import.meta.url).href
  if (import.meta.env.PROD && isSupportWebp() && webpTest.test(url)) {
    let idx = path.lastIndexOf('.')
    if (idx > 0) {
      path = path.substring(0, idx) + '.webp'
    }
  }
  return path
}
const getPbulicFile = (url) => {
  let path = url
  if (import.meta.env.PROD && isSupportWebp() && webpTest.test(url)) {
    let idx = path.lastIndexOf('.')
    if (idx > 0) {
      path = path.substring(0, idx) + '.webp'
    }
  }
  return path
}
export { getAssetsFile,getPbulicFile }
