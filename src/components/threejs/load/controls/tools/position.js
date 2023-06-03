//camera 必须是PerspectiveCamera
function worldPosToScreen(object, camera, THREE) {
  var vector = new THREE.Vector3()
  var widthHalf = 0.5 * window.innerWidth
  var heightHalf = 0.5 * window.innerHeight
  object.updateMatrixWorld() /*这段代码是重要的在获取前先更新下对象的世界坐标/世界矩阵*/
  vector.setFromMatrixPosition(object.matrixWorld)
  vector.project(camera)
  vector.x = vector.x * widthHalf + widthHalf
  vector.y = -(vector.y * heightHalf) + heightHalf
  return {
    x: vector.x,
    y: vector.y
  }
}

function screenPointToWorld(x, y, camera, THREE, targetZ = 0) {
  let vec = new THREE.Vector3() // create once and reuse
  let pos = new THREE.Vector3() // create once and reuse

  vec.set((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1, 0.5)
  vec.unproject(camera)
  vec.sub(camera.position).normalize()
  let distance = (targetZ - camera.position.z) / vec.z
  pos.copy(camera.position).add(vec.multiplyScalar(distance))
  return pos
}
export { worldPosToScreen, screenPointToWorld }
