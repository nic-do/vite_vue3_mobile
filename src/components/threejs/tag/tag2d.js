import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer'
// 创建一个HTML标签
function tag(name) {
  // 创建div元素(作为标签)
  var div = document.createElement('div')
  div.innerHTML = name
  div.classList.add('tag')
  //div元素包装为CSS2模型对象CSS2DObject
  var label = new CSS2DObject(div)
  div.style.pointerEvents = 'none' //避免HTML标签遮挡三维场景的鼠标事件
  // 设置HTML元素标签在three.js世界坐标中位置
  // label.position.set(x, y, z);
  return label //返回CSS2模型标签
}

// 创建一个CSS2渲染器CSS2DRenderer
function labelRenderer(container) {
  var labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(container.offsetWidth, container.offsetHeight)
  labelRenderer.domElement.style.position = 'absolute'
  // 相对标签原位置位置偏移大小
  labelRenderer.domElement.style.top = '0px'
  labelRenderer.domElement.style.left = '0px'
  // //设置.pointerEvents=none，以免模型标签HTML元素遮挡鼠标选择场景模型
  labelRenderer.domElement.style.pointerEvents = 'none'
  container.appendChild(labelRenderer.domElement)
  return labelRenderer
}

export { tag, labelRenderer }
