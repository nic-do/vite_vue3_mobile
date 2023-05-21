import { sv } from '@faker-js/faker'

function loadSvgCode(code, name) {
  let symbolId = `icon-${name}`
  let svcCode = analyse(code, symbolId)
  if (svcCode) {
    let head = document.getElementsByTagName('head')[0]
    let links = head.getElementsByTagName('svg')
    let node = links && links.length > 0 ? links[0] : null
    let symbol = null
    if (node == null) {
      let xmlns = 'http://www.w3.org/2000/svg'
      node = document.createElementNS(xmlns, 'svg')
      node.setAttribute('id', '__svgIconDom__')
      node.setAttribute('xmlns', xmlns)
      node.setAttribute('xmlns:link', 'http://www.w3.org/1999/xlink')
      node.setAttribute('style', 'position: absolute; width: 0px; height: 0px;')
      head.appendChild(node)
    } else {
      symbol = node.getElementById(symbolId)
    }
    if (!symbol) {
      try {
        node.innerHTML += svcCode
        // node.appendChild(document.createTextNode(svcCode))
      } catch (ex) {}
    }
  }
}
function analyse(code, symbolId) {
  let data = null
  if (code) {
    if (code.indexOf('<svg') >= 0) {
      let idx = code.indexOf('<svg')
      data = code.substring(idx, code.length)
      data = data.replace('<svg', `<symbol id="${symbolId}" `)
      data = data.replace('</svg>', '</symbol>')
    }
  }
  return data
}

//1、使用import() or import.meta.glob()
//直接将svg以以字符串形式导入资源
async function loadsvg(name) {
  // let svgFile = null
  // 旧模式
  // if (name && name.indexOf('main/') >= 0) {
  //   svgFile = await import(`../../assets/svg/main/${name}.svg?raw`).catch((err) => {
  //     console.log('--svg-load-err--', err)
  //   })
  // } else {
  //   svgFile = await import(`../../assets/svg/${name}.svg?raw`).catch((err) => {
  //     console.log('--svg-load-err--', err)
  //   })
  // }
  // if (svgFile && svgFile.default != undefined) {
  //   let text = svgFile.default
  //   loadSvgCode(text, name)
  // }
  //新模式，其实差不多
  const svgs = import.meta.glob(['../../assets/svg/*.svg', '../../assets/svg/main/*.svg'], {
    as: 'raw'
  })
  let func = svgs['../../assets/svg/' + name + (name.indexOf('.svg')<=0?'.svg':'')]
  if (func) {
    let text = await func()
    let nameId = name
    let names = name.split('/')
    if (names && names.length > 0) {
      nameId = names[names.length - 1].replace('.svg', '')
    }
    loadSvgCode(text, nameId)
  }
}

//2、使用axios下载svg的方式，缺陷是可能因为 服务器的策略 下载不了
//  这种方式可以将svg放在assets目录下
//  name格式：eg.svg or dir/eg.svg
import service from '@/utils/axios/service'
async function loadsvg_axios(name) {
  //注：不能修改name （非常重要） 外部要补全后缀 .svg
  let path = new URL(`../../assets/svg/${name}`, import.meta.url).href
  let svgFile = await service({ url: path, method: 'GET', responseType: 'blob' }).catch((err) => {})
  let text = null
  if (svgFile) {
    text = await svgFile.text().catch((err) => {})
  }
  if (text) {
    let nameId = name
    let names = name.split('/')
    if (names && names.length > 0) {
      nameId = names[names.length - 1].replace('.svg', '')
    }
    loadSvgCode(text, nameId)
  }
}
export default { loadsvg, loadSvgCode, loadsvg_axios }
