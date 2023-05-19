function loadCssCode(code, type, reset) {
  var head = document.getElementsByTagName('head')[0]
  var links = document.getElementsByTagName('link')
  for (var i = links.length - 1; i >= 0; i--) {
    if (links[i].name == 'custom-theme') {
      if (links[i].theme == type) {
        //也可以直接remove，再重新添加
        console.log('--theme--', type + ':already exsit')
        if (reset) {
          head.removeChild(links[i])
          break
        }
        return
      } else {
        head.removeChild(links[i])
        console.log('--theme--', type + ':timeout and removed')
      }
    }
  }
  var style = document.createElement('style')
  // style.type = 'text/css'
  style.rel = 'stylesheet'
  style.setAttribute('name', 'custom-theme')
  style.setAttribute('theme', type)
  try {
    //for Chrome Firefox Opera Safari
    style.appendChild(document.createTextNode(code))
  } catch (ex) {
    //for IE
    style.styleSheet.cssText = code
  }

  head.appendChild(style)
}
function loadPublicCSS(url) {
  //1、需要处理重复添加的问题
  var links = document.getElementsByTagName('link')
  for (var i = 0; i < links.length; i++) {
    if (links[i].href.substr(-url.length) == url) return
  }
  const element = document.createElement('link')
  element.setAttribute('rel', 'stylesheet')
  element.setAttribute('href', url)
  document.head.appendChild(element)
}
function setThemeVar(themeVar, value) {
  document.getElementsByTagName('html')[0].style.setProperty(themeVar, value)
}
//注：
//setThemeVar 直接设置 html的style 优先级最高
export default { loadCssCode, loadPublicCSS, setThemeVar }
