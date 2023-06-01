import { Mgr } from '@/components/threejs/load/controls/phycis/mgr'
export class CannonMgr extends Mgr {
  dispose() {
    this.clear()
    this.Cannon = null
    super.dispose()
  }
  clear() {
    super.clear()
    this.worldCannon = null
    this.cannonDebugger = null
    try {
      //这里可能还有listen
      this.bodys.forEach((item)=>{
        if (item.shapes){
          if (item.removeShape!=undefined){
            for (let i=item.shapes.length-1;i>=0;i--){
              let shape=item.shapes[i]
              item.removeShape(shape)
              console.info('-CannonMgr-clear-',shape.myname)
              shape=null
            }
          }
        }
      })
    }catch (e) {
      console.error(e)
    }

    this.bodys = []
    this.colliderBodys = []
    this.playerBody = null
    this.playerBodyH = 0
  }

  constructor(com) {
    super(com)
    this.Cannon = null
    this.worldCannon = null
    this.cannonDebugger = null
    this.bodys = []
    this.colliderBodys = []
    this.mgrType = 'cannon'
    this.playerBody = null
    this.playerBodyH = 0
  }
  setCom(com) {
    super.setCom(com)
  }
  async useMgr() {
    super.useMgr()
    if (!this.worldCannon) {
      let res = await this.com.getCollisionMgr('cannon-es')
      if (res != undefined && res != null) {
        this.Cannon = res
      }
      let world = new this.Cannon.World({
        gravity: new this.Cannon.Vec3(0, -9.82, 0) // m/s²
      })
      world.tolerance = 0.1
      this.worldCannon = world
      // Tweak contact properties.
      // Contact stiffness - use to make softer/harder contacts
      world.defaultContactMaterial.contactEquationStiffness = 1e9
      // Stabilization time in number of timesteps
      world.defaultContactMaterial.contactEquationRelaxation = 4
      const solver = new this.Cannon.GSSolver()
      solver.iterations = 7
      solver.tolerance = 0.1
      world.solver = new this.Cannon.SplitSolver(solver)
      // use this to test non-split solver
      // world.solver = solver
      // world.gravity.set(0, -20, 0)
      world.broadphase.useBoundingBoxes = true

      // Create a slippery material (friction coefficient = 0.0)
      const physicsMaterial = new this.Cannon.Material('physics')
      const physics_physics = new this.Cannon.ContactMaterial(physicsMaterial, physicsMaterial, {
        friction: 0.0,
        restitution: 0.3
      })
      // We must add the contact materials to the world
      world.addContactMaterial(physics_physics)
    }
  }

  bodyFromMesh(mesh, name, mass) {
    if (
      mesh.geometry &&
      mesh.geometry.attributes &&
      mesh.geometry.attributes.position &&
      mesh.geometry.attributes.position.count > 0 &&
      mesh.geometry.index &&
      mesh.geometry.index.array
    ) {
      let indices = mesh.geometry.index.array
      const position = mesh.geometry.attributes.position

      var trackMat = new this.Cannon.Material(name)
      //mass:0表示固定不动 障碍物， 1表示模拟运动
      const wTrack = new this.Cannon.Body({
        mass: mass != undefined ? mass : 0,
        material: trackMat
      })

      const vertices = new Float32Array(position.count * 3)
      for (let i = 0; i < position.count; i++) {
        vertices[i * 3] = position.getX(i) * mesh.scale.x
        vertices[i * 3 + 1] = position.getY(i) * mesh.scale.y
        vertices[i * 3 + 2] = position.getZ(i) * mesh.scale.z
      }
      let wShape = this.track(new this.Cannon.Trimesh(vertices, indices))
      wShape.myname='bodyFromMesh-Trimesh-'+name
      wTrack.addShape(wShape)
      wTrack.position.copy(mesh.position)
      wTrack.quaternion.copy(mesh.quaternion)
      return wTrack
    }
    return null
  }
  __addBody(body) {
    if (body) {
      this.worldCannon.addBody(body)
      this.bodys.push(body)
    }
  }
  __addColliderBodys(body) {
    if (body) {
      this.worldCannon.addBody(body)
      this.colliderBodys.push(body)
    }
  }
  addColliders(obj, extra) {
    super.addColliders(obj, extra)
  }
  //////////////////////////////////////
  setWorld(world) {
    super.setWorld(world)
    if (this.worldCannon) {
      // plane-body
      // this.testGroundBody()
      // mesh-world-body
      world.traverse((obj) => {
        if (obj.isMesh === true) {
          let res = this.bodyFromMesh(obj, 'ground')
          if (res) this.__addBody(res)
        }
      })
    }
  }
  setPlayer(player) {
    super.setPlayer(player)
    if (player && this.worldCannon) {
      //通过mesh 生mesh-player-body，无法与mesh-world-body 碰撞
      // player.traverse((obj) => {
      //   if (obj.isMesh === true) {
      //     let res = this.bodyFromMesh(obj, 'player', 1)
      //     if (res) {
      //       this.playerBody = res
      //       this.__addBody(res)
      //     }
      //   }
      // })
      //
      this.testPlayerBody(player)
    }
  }
  addNpc(npc){
    super.addNpc(npc)
  }
  showHelper = async function (flag) {
    if (this.Cannon && this.worldCannon) {
      if (!this.cannonDebugger) {
        let res = await this.com.getCollisionMgr('cannon-debuger')
        this.cannonDebugger = new res.CannonDebugger(this.com.scene, this.worldCannon, {
          // options...
        })
      }
      if (this.cannonDebugger) this.cannonDebugger.show = flag
    }
  }
  ///////////////////////////////////////////////

  update(delatime, extra) {
    if (this.worldCannon) {
      this.worldCannon.fixedStep()
      if (this.cannonDebugger&&this.cannonDebugger.show){
        this.cannonDebugger.update()
      }
    }

    super.update(delatime, extra)
    if (this.worldCannon) {
      try {
        //切换模型 可能出错
        for (let i = 0; i < this.colliderBodys.length; i++) {
          if (!this.worldCannon){
            break
          }
          let item = this.colliders[i].item
          let body = this.colliderBodys[i]
          let position = body.interpolatedPosition
          let quaternion = body.interpolatedQuaternion
          item.mesh.position.copy(body.position)
          item.mesh.quaternion.copy(body.quaternion)
        }
      }catch (e){
        console.error(e)
      }
    }
  }

  testGroundBody() {
    // Plane-body
    const groundShape = new this.Cannon.Plane()
    const groundBody = new this.Cannon.Body({ mass: 0 })
    groundBody.addShape(groundShape)
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
    this.__addBody(groundBody)
  }
  testPlayerBody(player) {
    // 都可以与 plane-body碰撞
    // Box-body 不能与mesh-world-body 碰撞
    //const ballShape = new this.Cannon.Box(new this.Cannon.Vec3(0.6, 1, 0.3))
    // Sphere-body可以与mesh-world-body 碰撞
    const ballShape = new this.Cannon.Sphere(0.5)
    const ballBody = new this.Cannon.Body({ mass: 1 })
    ballShape.myname='player-test-body'
    ballBody.addShape(ballShape)
    this.playerBody = ballBody
    this.playerBodyH = 0.5
    this.__addBody(ballBody)
    ballBody.position.copy(player.position)
  }
  testBodyFromCube(cube) {
    //mesh-cube-body
    cube.traverse((obj) => {
      if (obj.isMesh === true) {
        let res = this.bodyFromMesh(obj, 'obstacle')
        if (res) this.__addBody(res)
      }
    })
  }
  testShoot(playerVelocity, personControlType) {
    let res = super.testShoot(playerVelocity, personControlType)
    if (this.worldCannon) {
      let sphere = res.sphere
      const ballShape = new this.Cannon.Sphere(0.2)
      // const ballShape = new this.Cannon.Box(new this.Cannon.Vec3(0.2, 0.2, 0.2))
      const ballBody = new this.Cannon.Body({ mass: 1 })
      ballBody.addShape(ballShape)
      let center = this.player.position
      ballBody.velocity.set(sphere.velocity.x, sphere.velocity.y, sphere.velocity.z)
      ballBody.position.set(center.x, center.y + 2, center.z)
      this.addColliders(res.sphere) //之后 碰撞 遍历用·
      this.__addColliderBodys(ballBody)
    }
  }
}
