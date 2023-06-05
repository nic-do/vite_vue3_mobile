import { Pathfinding, PathfindingHelper } from 'three-pathfinding'
import { markRaw } from 'vue'
export class PathFind {
  dispose() {
    this.pathfinding = null
    this.path = null
    this.directions = null
  }
  constructor() {
    this.beginPosition = null
    this.path = markRaw([])
    this.directions = markRaw([])
    this.pathfinding = markRaw(new Pathfinding())
    this.dy = 0.4 //跟模型有关
    this.v2_help0 = null
    this.v2_help1 = null
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
    // Find path from A to B.
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
    return { position: this.path[0], rotation: this.directions[0] }
  }
  checkDelta(target, delta, ctrl) {
    ctrl.com.setAxesHelper(ctrl.com.scene, this.dy)
    if (ctrl.com.axesHelper) {
      ctrl.com.axesHelper.position.copy(ctrl.player.position.clone())
    }
    let player = ctrl.player
    let pos = player.position.clone()
    if (!this.v2_help0) {
      this.v2_help0 = new ctrl.THREE.Vector2(0, 0)
    }
    if (!this.v2_help1) {
      this.v2_help1 = this.v2_help0.clone()
    }
    ///////////////////////待优化
    const now = target.clone().sub(pos)
    const dir_v2 = target.clone().sub(this.beginPosition) //起点到终点的向量
    this.v2_help0.set(dir_v2.x, dir_v2.z)
    const next = target.clone().sub(pos.add(delta)) //next新位置到终点的向量
    this.v2_help1.set(next.x, next.z)
    // let temp = this.v2_help0.cross(this.v2_help1)
    let rad = this.v2_help0.angleTo(this.v2_help1) //夹角
    //向量夹角方向一致，如果 越过目标点，方向必然相反或<0
    if (rad <= Math.PI / 5 && next.lengthSq() < dir_v2.lengthSq()) {
      //夹角小于5度
      return {
        delta:delta
      }
    } else {
      let len=now.lengthSq()
      if (now.lengthSq() < 0.05) {
        let temp = this.path[0]
        this.path.shift()
        this.directions.shift()
        if (this.path.length > 0) {
          this.beginPosition = temp
        } else {
          this.beginPosition = null
        }
      }
      return {
        delta:now,
        finished:true
      }
    }
  }
  // update(deltatime, ctrl) {
  //   if (!ctrl) return false
  //   let player = ctrl.player
  //   if (!(this.path || []).length || !player) return false
  //   let playerPosition = player.position.clone()
  //   let targetPosition = this.path[0]
  //   let rotateTo = this.directions[0]
  //   if (player.axisy_z) {
  //     //有个模型轴有问题
  //     player.player.rotation.z = rotateTo
  //   } else {
  //     player.player.rotation.y = rotateTo
  //   }
  //   ctrl.com.setAxesHelper(ctrl.com.scene, this.dy)
  //   if (ctrl.com.axesHelper) {
  //     ctrl.com.axesHelper.position.copy(ctrl.player.position.clone())
  //   }
  //   //
  //   const velocity = targetPosition.clone().sub(playerPosition)
  //
  //   if (velocity.lengthSq() > 0.05 * 0.05) {
  //     velocity.normalize()
  //     const SPEED = 5 / 5
  //     // Move player to target
  //     let delta = velocity.multiplyScalar(deltatime * SPEED)
  //     playerPosition.add(delta)
  //     player.collider.translate(delta)
  //     if (this.helper) this.helper.setPlayerPosition(playerPosition)
  //   } else {
  //     // Remove node from the path we calculated
  //     this.path.shift()
  //     this.directions.shift()
  //   }
  //   return true
  // }
  clearPath() {
    this.beginPosition = null
    if (this.path) {
      this.path.splice(0, this.path.length)
    }
  }
  rotations(ctrl, start, end) {
    {
      //z轴 作为x轴，x轴作为y轴
      let sv2 = new ctrl.THREE.Vector2(start.z, start.x)
      let ev2 = new ctrl.THREE.Vector2(end.z, end.x)
      let vetTo = ev2.clone().sub(sv2.clone()).normalize()
      let fxl = new ctrl.THREE.Vector2(1, 0)
      let rad = fxl.angleTo(vetTo)
      let temp = fxl.cross(vetTo)
      if (temp < 0) {
        rad = -rad
      }
      console.log(rad)
      return rad
    }
  }
  makeDirection(ctrl, start, path) {
    if (path && path.length > 0) {
      if (!this.directions) this.directions = markRaw([])
      let startPos = start.clone()
      path.forEach((item) => {
        item.y += this.dy
        this.directions.push(this.rotations(ctrl, startPos, item))
        startPos = item
      })
    }
  }
  test(zone, start, end, ctrl, autoFix = 1) {
    if (this.path) {
      this.path.splice(0, this.path.length)
      this.directions.splice(0, this.directions.length)
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
