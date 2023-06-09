import { markRaw } from 'vue'

export class Mgr {
  dispose() {
    this.THREE = null
    this.com = null
    this.colliders = markRaw([])
    this.world = null
    this.player = null
    this.aframeSceneEl = null
  }
  clear() {
    this.colliders = markRaw([])
    this.world = null
    this.player = null
    this.npcs = markRaw([])
  }
  constructor(com) {
    this.com = markRaw(com)
    this.npcVelocity = null
    if (com) {
      this.THREE = com.THREE
    }
    this.colliders = markRaw([])
    this.mgrType = null
    this.world = null
    this.player = null
    this.SPHERE_RADIUS = 0.2
    this.GRAVITY = 30
    this.npcs = markRaw([])
    this.aframeSceneEl = null
  }
  __getVec3() {
    return this.THREE ? new this.THREE.Vector3(0, 0, 0) : null
  }
  setCom(com) {
    // threejs-load 对象
    this.com = markRaw(com)
    if (com) {
      this.THREE = com.THREE
    }
  }
  setIsAframe(sceneEl) {
    this.aframeSceneEl = sceneEl
  }
  addColliders(obj, extra) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        this.colliders.push({
          item: item,
          extra: extra
        })
      })
    } else {
      this.colliders.push({
        item: obj,
        extra: extra
      })
    }
  }
  useMgr() {}
  track(obj) {
    if (this.com) {
      return this.com.track(obj)
    }
    return obj
  }
  setWorld(world) {
    this.world = markRaw(world)
  }
  setPlayer(player) {
    this.player = markRaw(player)
  }
  addNpc(npc) {
    npc.npcVelocity = new this.THREE.Vector3(0, 0, 0)
    npc.inOnFloor = true
    this.npcs.push(markRaw(npc))
  }
  showHelper = async function (flag) {}
  addObstacles(obj) {}
  rayCast(from, to, extra) {
    return null
  }
  update(delatime, extra) {}

  getForwardVector(personControlType) {
    if (this.THREE) {
      let playerDirection = this.__getVec3()
      if (personControlType == 'first') {
        //camera 前方
        this.com.camera.getWorldDirection(playerDirection)
        // playerDirection.y = 0
        playerDirection.normalize()
      } else {
        //player 前方
        this.player.player.getWorldDirection(playerDirection)
        playerDirection.normalize()
      }
      if (this.player.axisy_z) {
        //有个模型 轴不对
        let y = playerDirection.y
        playerDirection.y = playerDirection.z
        playerDirection.z = y
      }
      return playerDirection
    }
    return null
  }
  makeBoll() {
    if (this.com) {
      const sphereGeometry = this.track(new this.THREE.IcosahedronGeometry(this.SPHERE_RADIUS, 5))
      const sphereMaterial = this.track(new this.THREE.MeshLambertMaterial({ color: 0xdede8d }))
      const mesh = this.track(new this.THREE.Mesh(sphereGeometry, sphereMaterial))
      mesh.castShadow = true
      mesh.receiveShadow = true
      return mesh
    }
    return null
  }
  testShoot(playerVelocity, personControlType) {
    let direction = this.getForwardVector(personControlType)
    if (direction) {
      let mesh = this.makeBoll()
      let entity
      if (this.aframeSceneEl) {
         entity = new window.AFRAME.AEntity()
        entity.object3D.add(mesh)
        this.aframeSceneEl.add(entity)
        direction.multiplyScalar(-1)
      } else {
        this.com.scene.add(mesh)
      }
      let sphere = {
        mesh: mesh,
        velocity: this.__getVec3()
      }
      const impulse = 15 + 30 * (1 - Math.exp(-200 * 0.001))
      sphere.velocity.copy(direction).multiplyScalar(impulse)
      sphere.velocity.addScaledVector(playerVelocity, 2)
      sphere.entity=entity
      return {
        sphere: sphere,
        direction: direction,
      }
    }
    return null
  }
}
