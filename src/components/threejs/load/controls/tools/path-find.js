import { Pathfinding, PathfindingHelper } from 'three-pathfinding'
import { markRaw } from 'vue'
export class PathFind {
  dispose() {
    this.pathfinding = null
    this.path = null
    this.directions = null
    this.v2_help0 = null
    this.v2_help1 = null
    this.v2_fxl = null
  }
  constructor() {
    this.path = markRaw([])
    this.directions = markRaw([])
    this.pathfinding = markRaw(new Pathfinding())
    this.dy = 0.4 //跟模型有关
    this.v2_help0 = null
    this.v2_help1 = null
    this.v2_fxl = null
  }
  getHelper() {
    if (!this.helper) {
      this.helper = markRaw(new PathfindingHelper())
    }

    return this.helper
  }
  createZone(zone, gltfGeometry) {
    this.pathfinding.setZoneData(zone, Pathfinding.createZone(gltfGeometry))
    console.info('PathFind-createZone', zone)
  }

  findPath(zone, start, end) {
    if (this.helper) {
      this.helper.reset().setPlayerPosition(start)
      this.helper.setTargetPosition(end)
    }

    const groupID = this.pathfinding.getGroup(zone, start)
    console.info('PathFind-findPath', zone + '|' + groupID)
    const path = this.pathfinding.findPath(start, end, zone, groupID)
    if (path && path.length) {
      this.helper.setPath(path)
    }
    if (path) {
      console.info('findPath', path)
    }
    return path
  }
  getDest() {
    if (!(this.path || []).length) return null
    return { position:this.path[0]}
  }
  checkDelta(target,ctrl) {
    let player = ctrl.player
    ctrl.com.setAxesHelper(ctrl.com.scene, this.dy)
    if (ctrl.com.axesHelper) {
      ctrl.com.axesHelper.position.copy(player.position.clone())
    }
    let pos = player.position.clone()
    const now = target.clone().sub(pos)
    let len = now.lengthSq() //三维的距离，受y轴影响交大
    let ev2 = this.v2_help1.set(now.z, now.x)
    let len1=ev2.lengthSq() //水平面的距离，忽略y轴
    if (len < 0.18||len1<0.0005) {//0.05
      this.path.shift()
      // helper.
      return {
        delta: now,
        finished: true
      }
    }
    return null
  }
  clearPath() {
    this.beginPosition = null
    if (this.path) {
      this.path.splice(0, this.path.length)
      this.helper.reset()
    }
  }
  rotations(ctrl, start, end) {
    {
      if (!this.v2_help0) {
        this.v2_help0 = new ctrl.THREE.Vector2(0, 0)
      }
      if (!this.v2_help1) {
        this.v2_help1 = this.v2_help0.clone()
      }
      if (!this.v2_fxl){
        this.v2_fxl = this.v2_help0.clone()
      }
      let sv2 = this.v2_help0.set(start.z, start.x)
      let ev2 = this.v2_help1.set(end.z, end.x)
      let vetTo = ev2.sub(sv2).normalize()
      let fxl = this.v2_fxl.set(1, 0)
      let rad = fxl.angleTo(vetTo)
      let temp = fxl.cross(vetTo)
      if (temp < 0) {
        rad = -rad
      }
      return rad
    }
  }
  makeDirection(ctrl, start, path) {
    if (path && path.length > 0) {
      path.forEach((item) => {
        item.y += this.dy
      })
    }
  }
  test(zone, start, end, ctrl, autoFix = 1) {
    if (this.path) {
      this.path.splice(0, this.path.length)
    }

    let finder = this.pathfinding
    let groupID = finder.getGroup(zone, start)
    const endGroupID = finder.getGroup(zone, end, true)
    const cnEnd = finder.getClosestNode(end, zone, endGroupID, true)
    if (this.helper) {
      this.helper.reset().setPlayerPosition(start)
      this.helper.setTargetPosition(end)
      if (cnEnd) this.helper.setNodePosition(cnEnd.centroid)
    }
    let path = this.pathfinding.findPath(start, end, zone, groupID)

    this.path = path ? markRaw(path) : null
    this.makeDirection(ctrl, start, this.path)
    if (path && path.length) {
      this.beginPosition = start
      this.helper.setPath(path)
    } else {
      if (autoFix == 1) {
        start = start.clone().setY(start.y - this.dy)
        this.test(zone, start, end, ctrl, 2)
      } else if (autoFix == 2) {
        this.testClamped(zone, start, end, ctrl)
      }
    }
  }
  testClamped(zone, start, end, ctrl) {
    let finder = this.pathfinding
    let groupID = finder.getGroup(zone, start)
    const closestPlayerNode = finder.getClosestNode(start, zone, groupID)
    const clamped = new ctrl.THREE.Vector3()
    // Don't clone targetPosition, fix the bug.
    let node = this.pathfinding.clampStep(start, end, closestPlayerNode, zone, groupID, clamped)
    if (node) {
      if (!this.path) {
        this.beginPosition = start
        this.path = markRaw([clamped])
        this.makeDirection(ctrl, start, this.path)
        this.helper.setPath(this.path)
      }
    }
  }
}
