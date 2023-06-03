import { Mgr } from '@/components/threejs/load/controls/phycis/mgr'
import {markRaw} from "vue";
export class OctreeMgr extends Mgr {
  dispose() {
    this.clear()
    super.dispose()
  }
  clear() {
    super.clear();
    if (this.octreeHelper){
      this.octreeHelper.dispose()
      this.octreeHelper=null
    }
    this.worldOctree = null
    this.octreeHelper = null
    this.vector1 = null
    this.vector2 = null
    this.vector3 = null
    this.OctreeHelperCls=null
    this.OctreeCls=null
  }

  constructor(com) {
    super(com)
    this.mgrType = 'octree'
    this.worldOctree = null
    this.octreeHelper = null
    this.vector1 = this.__getVec3()
    this.vector2 = this.__getVec3()
    this.vector3 = this.__getVec3()
    this.OctreeHelperCls=null
    this.OctreeCls=null
  }
  setCom(com) {
    super.setCom(com);
    if (this.vector1==null){
      this.vector1 = this.__getVec3()
      this.vector2 = this.__getVec3()
      this.vector3 = this.__getVec3()
    }
  }

  async useMgr() {
    super.useMgr()
    if (!this.worldOctree) {
      let res = await this.com.getCollisionMgr('octree')
      if (res != undefined) {
        this.OctreeCls=res.Octree
        this.OctreeHelperCls=res.OctreeHelper
      }
    }
  }
  setWorld(world) {
    super.setWorld(world)
    if (!this.worldOctree){
      this.worldOctree = markRaw(this.track(new this.OctreeCls()))
    }
    if (this.worldOctree) {
      this.worldOctree.fromGraphNode(world)
    }
  }
  setPlayer(player) {
    super.setPlayer(player)
  }
  addNpc(npc){
    super.addNpc(npc)
  }
  showHelper=async function (flag){
    if (!this.octreeHelper&&this.worldOctree){
      this.octreeHelper =markRaw(this.track(new this.OctreeHelperCls(this.worldOctree)))
    }
    if ( this.octreeHelper){
      this.octreeHelper.visible = flag
    }
  }
  addObstacles(obj) {
    super.addObstacles(obj)
    if (this.worldOctree && this.THREE) {
      this.octreeRenode(this.worldOctree, obj, this.THREE)
    }
  }
  octreeRenode(octree, obstacles, THREE) {
    if (octree && obstacles && THREE) {
      if (Array.isArray(obstacles)) {
        for (let i = 0; i < obstacles.length; i++) {
          this.__renode(octree, obstacles[i], THREE)
        }
      } else {
        this.__renode(octree, obstacles, THREE)
      }
      octree.build()
    }
  }

  __renode(octree, collider, THREE) {
    if (collider) {
      if (collider.isGroup) {
        collider.updateWorldMatrix(false, true)
        collider.traverse((obj) => {
          this.renode(octree, obj, THREE)
        })
      } else if (collider.isMesh === true) {
        collider.updateWorldMatrix(false, true)
        let geometry,
          isTemp = false

        if (collider.geometry.index !== null) {
          isTemp = true
          geometry = collider.geometry.toNonIndexed()
        } else {
          geometry = collider.geometry
        }

        const positionAttribute = geometry.getAttribute('position')
        let vec3 = this.__getVec3()
        for (let i = 0; i < positionAttribute.count; i += 3) {
          const v1 = vec3.clone().fromBufferAttribute(positionAttribute, i)
          const v2 = vec3.clone().fromBufferAttribute(positionAttribute, i + 1)
          const v3 = vec3.clone().fromBufferAttribute(positionAttribute, i + 2)

          v1.applyMatrix4(collider.matrixWorld)
          v2.applyMatrix4(collider.matrixWorld)
          v3.applyMatrix4(collider.matrixWorld)

          octree.addTriangle(new THREE.Triangle(v1, v2, v3))
        }
        if (isTemp) {
          geometry.dispose()
        }
      }
    }
  }
  update(deltaTime,extra) {
    super.update(deltaTime,extra)
    this.updateSpheres(deltaTime,extra)
    this.updateNpc(deltaTime)
  }
  updateNpc(deltaTime){
    for (let i=0;i<this.npcs.length;i++){
      if (!this.worldOctree){
        return
      }
      let npc=this.npcs[i]
      let damping = Math.exp(-4 * deltaTime) - 1
      if (!npc.inOnFloor ) {
        npc.npcVelocity.y -= this.GRAVITY * deltaTime
        // small air resistance
        damping *= 0.1
      }
      npc.npcVelocity.addScaledVector(npc.npcVelocity, damping)
      const deltaPosition = npc.npcVelocity.clone().multiplyScalar(deltaTime)
      if (deltaPosition != undefined) {
        npc.collider.translate(deltaPosition)
      }
      this.checkCollid(npc)
      let end = npc.collider.end
      let start = npc.collider.start
      let dy = (end.y - start.y) / 2
      let pp = start.clone().setY(start.y + dy)
      npc.position.copy(pp)

      if (npc.tag) {
        let tag = npc.tag
        if (npc.tag.mytype == '3d') {
          // let scale = this.tagScale
          // if (!tag.scale.equals(scale)) {
          //   tag.scale.set(0.01, 0.01, 0.01)
          // }
        }
        tag.visible = npc.visible
        tag.position.copy(pp.setY(pp.y + 1))//偏移跟 模型原点有关
      }
    }
  }
  checkCollid(npc){
    const result = this.worldOctree.capsuleIntersect(npc.collider)
    npc.inOnFloor = false
    // 地面检测
    if (result) {
      npc.inOnFloor = result.normal.y > 0
      if (!npc.inOnFloor) {
        npc.npcVelocity.addScaledVector(
            result.normal,
            -result.normal.dot(npc.npcVelocity)
        )
      }
      const deltaPosition = result.normal.multiplyScalar(result.depth)
      npc.collider.translate(deltaPosition)
    }
  }
  ////////////////////////////////////////
  updateSpheres(deltaTime,extra) {
    let datas = this.colliders
    datas.forEach((data) => {
      if (!this.worldOctree){
        return
      }
      let sphere = data.item
      sphere.collider.center.addScaledVector(sphere.velocity, deltaTime)

      const result = this.worldOctree.sphereIntersect(sphere.collider)

      if (result) {
        sphere.velocity.addScaledVector(result.normal, -result.normal.dot(sphere.velocity) * 1.5)
        sphere.collider.center.add(result.normal.multiplyScalar(result.depth))
      } else {
        sphere.velocity.y -= this.GRAVITY * deltaTime
      }

      const damping = Math.exp(-1.5 * deltaTime) - 1
      sphere.velocity.addScaledVector(sphere.velocity, damping)

      this.playerSphereCollision(sphere,extra)
    })
    this.spheresCollisions()

    for (const data of datas) {
      if (!this.worldOctree){
        return
      }
      let sphere = data.item
      sphere.mesh.position.copy(sphere.collider.center)
    }
  }
  //要求player有一个octree的capsule 对象collider
  playerSphereCollision(sphere,extra) {
    let playerCollider = this.player.collider
    const center = this.vector1
      .addVectors(playerCollider.start, playerCollider.end)
      .multiplyScalar(0.5)

    const sphere_center = sphere.collider.center

    const r = playerCollider.radius + sphere.collider.radius
    const r2 = r * r

    // approximation: player = 3 spheres

    for (const point of [playerCollider.start, playerCollider.end, center]) {
      if (!this.worldOctree){
        return
      }
      const d2 = point.distanceToSquared(sphere_center)

      if (d2 < r2) {
        const normal = this.vector1.subVectors(point, sphere_center).normalize()
        if (extra.playerVelocity!=undefined){
          const v1 = this.vector2.copy(normal).multiplyScalar(normal.dot(extra.playerVelocity))
          const v2 = this.vector3.copy(normal).multiplyScalar(normal.dot(sphere.velocity))

          extra.playerVelocity.add(v2).sub(v1)
          sphere.velocity.add(v1).sub(v2)

          const d = (r - Math.sqrt(d2)) / 2
          sphere_center.addScaledVector(normal, -d)
        }else{
          console.error('--playerVelocity-','playerSphereCollision-undefined')
        }
      }
    }
  }

  spheresCollisions() {
    let datas = this.colliders
    for (let i = 0, length = datas.length; i < length; i++) {
      const s1 = datas[i].item
      if (!this.worldOctree){
        return
      }
      if (!s1.collider||!s1.collider.center){
        continue
      }
      for (let j = i + 1; j < length; j++) {
        const s2 = datas[j].item
        if (!this.worldOctree){
          return
        }
        if (!s2.collider||!s2.collider.center){
          continue
        }
        const d2 = s1.collider.center.distanceToSquared(s2.collider.center)
        const r = s1.collider.radius + s2.collider.radius
        const r2 = r * r

        if (d2 < r2) {
          const normal = this.vector1.subVectors(s1.collider.center, s2.collider.center).normalize()
          const v1 = this.vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity))
          const v2 = this.vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity))

          s1.velocity.add(v2).sub(v1)
          s2.velocity.add(v1).sub(v2)

          const d = (r - Math.sqrt(d2)) / 2

          s1.collider.center.addScaledVector(normal, d)
          s2.collider.center.addScaledVector(normal, -d)
        }
      }
    }
  }
  //////////////////////////////////////////
  testShoot(playerVelocity, personControlType) {
    if (this.worldOctree) {
      let res = super.testShoot(playerVelocity, personControlType)
      let vec3 = this.__getVec3().setY(-100)
      res.sphere.collider = this.track(new this.THREE.Sphere(vec3, this.SPHERE_RADIUS))
      let playerCollider=this.player.collider
      let top=playerCollider.end.clone()
      top.y+=0.66
      res.sphere.collider.center
        .copy(top)
        .addScaledVector(res.direction, playerCollider.radius * 1.5)

      this.addColliders(res.sphere) //之后 碰撞 遍历用·
    }
  }
}
