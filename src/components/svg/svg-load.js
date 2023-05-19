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

//直接将svg以以字符串形式导入资源
async function loadsvg(name, path) {
  let svgFile = null
  if (path && path.indexOf('main') >= 0) {
    svgFile = await import(`../../svg/main/${name}.svg?raw`).catch((err) => {
      console.log('--svg-load-err--', err)
    })
  } else {
    svgFile = await import(`../../svg/${name}.svg?raw`).catch((err) => {
      console.log('--svg-load-err--', err)
    })
  }
  if (svgFile&&svgFile.default!=undefined){
    let text = svgFile.default
    loadSvgCode(text, name)
  }
}

//////////////这两个方法不再需要////////////
//txt
async function loadsvgTxt(name, path) {
  let svgFile = null
  if (path && path.indexOf('main') >= 0) {
    svgFile = await import(`../../svg/main/${name}.txt?raw`).catch((err) => {
      console.log('--svg-load-err--', err)
    })
  } else {
    svgFile = await import(`../../svg/${name}.txt?raw`).catch((err) => {
      console.log('--svg-load-err--', err)
    })
  }
  if (svgFile&&svgFile.default!=undefined){
      let text = svgFile.default
      loadSvgCode(text, name)
  }
}
//js
async function loadsvgJs(name, path) {
  let svgFile = null
  if (path && path.indexOf('main') >= 0) {
    svgFile = await import(`../../svg/main/${name}.js`).catch((err) => {
      console.log('--svg-load-err--', err)
    })
  } else {
    svgFile = await import(`../../svg/${name}.js`).catch((err) => {
      console.log('--svg-load-err--', err)
    })
  }
  if (svgFile) {
    let text = svgFile.default()
    loadSvgCode(text, name)
  }
}
////////////////////////////////////////
export default { loadsvg, loadSvgCode }
