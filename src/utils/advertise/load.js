function loadScript(url, name, onload) {
  //url: //qzs.qq.com/qzone/biz/res/i.js
  let hadExist = null
  let head = document.getElementsByTagName('head')[0]
  let links = document.getElementsByTagName('script')
  for (var i = links.length - 1; i >= 0; i--) {
    if (links[i].name == name) {
      if (links[i].src == url) {
        hadExist = links[i]
        return
      }
    }
  }
  if (!hadExist) {
    let script = document.createElement('script')
    // style.type = 'text/css'
    script.src = url
    head.appendChild(script)
    //监听script加载完成事件
    if (onload) script.onload = onload
  }
}
export default { loadScript }
