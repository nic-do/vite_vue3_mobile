/*** 画 Box 虚线工具*/
export class DashLinesBoxTool {
  constructor(com) {
    this.lineDatas = []
    this.com = com
    this.THREE = com.THREE
  }
  dispose(){
      this.lineDatas.forEach((item)=>{
          if (item.parent&&item.parent.remove!=undefined){
              item.parent.remove(item)
          }
      })
      this.lineDatas=[]
      this.com = null
      this.THREE = null
  }
  /*** 根据长宽高 创建虚线框* @param {Object} width* @param {Object} height* @param {Object} depth* @param {Object} color* @param {Object} dashSize* @param {Object} gapSize*/
  createDashLinesBox(width, height, depth, color = 0x0000ff, dashSize = 1, gapSize = 1) {
    const geometryBox = this.getBoxGeometry(width, height, depth)
    const lineSegments = this.com.track(
      new this.THREE.LineSegments(
        geometryBox,
        this.com.track(new this.THREE.LineDashedMaterial({ color, dashSize, gapSize }))
      )
    )
    lineSegments.computeLineDistances()
    this.lineDatas.push(lineSegments)
    return lineSegments
  }
  /*** 根据几何体 object 创建虚线框* @param {Object} object* @param {Object} color* @param {Object} dashSize* @param {Object} gapSize*/
  createDashLinesBoxWithObject(object, color = 0x0000ff, dashSize = 1, gapSize = 1) {
    var v3Size = this.getObjectBoxSize(object)
    return this.createDashLinesBox(v3Size.x, v3Size.y, v3Size.z, color, dashSize, gapSize)
  }
  /*** 根据 Object 计算几何长宽高, 并 Vector3 形式返回* @param {Object} object*/
  getObjectBoxSize(object) {
    const box3 = new this.THREE.Box3()
    box3.expandByObject(object)
    const v3 = new this.THREE.Vector3()
    box3.getSize(v3)
    console.log('v3 ', v3)
    return v3
  }
  /*** 根据长宽高生产对应线框点集* @param {Object} width* @param {Object} height* @param {Object} depth*/
  getBoxGeometry(ww, hh, dd) {
    let width = ww * 0.5,
      height = hh * 0.5,
      depth = dd * 0.5
    const geometry = this.com.track(new this.THREE.BufferGeometry())
    const position = []
    // 创建虚线点
    position.push(
      -width,
      -height,
      -depth,
      -width,
      height,
      -depth,
      -width,
      height,
      -depth,
      width,
      height,
      -depth,
      width,
      height,
      -depth,
      width,
      -height,
      -depth,
      width,
      -height,
      -depth,
      -width,
      -height,
      -depth,
      -width,
      -height,
      depth,
      -width,
      height,
      depth,
      -width,
      height,
      depth,
      width,
      height,
      depth,
      width,
      height,
      depth,
      width,
      -height,
      depth,
      width,
      -height,
      depth,
      -width,
      -height,
      depth,
      -width,
      -height,
      -depth,
      -width,
      -height,
      depth,
      -width,
      height,
      -depth,
      -width,
      height,
      depth,
      width,
      height,
      -depth,
      width,
      height,
      depth,
      width,
      -height,
      -depth,
      width,
      -height,
      depth
    )
    geometry.setAttribute('position', new this.THREE.Float32BufferAttribute(position, 3))
    return geometry
  }
}
