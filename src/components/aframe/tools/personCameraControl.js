import Is from '@/utils/is'
import { markRaw } from 'vue'
export class PersonCameraControl {
  dispose() {
    this.pathFind.dispose()
    this.pathFind = null
    this.removeEvents()
    this.com = null
    this.THREE = null
    this.camera = null

    this.player = null

    this.domElement = null

    this.tempCaPos = null
    this.tempCaRot = null
    this.keyDown = null
    this.keyUp = null
    if (this.phycisMgr) {
      this.phycisMgr.dispose()
    }
    this.phycisMgr = null
  }
  constructor(com, domElement) {
    let doc = domElement !== undefined ? domElement : document
    let THREE= com.THREE
    this.phycisMgr = null
    this.com = com
    this.THREE = THREE
    this.camera = markRaw(com.camera)
    this.domElement = markRaw(doc)
    this.type = 'third'
    // API
    this.enabled = false

    this.jumpSpeed = 15

    this.player = null

    this.keyState = {}
    this.STATE = markRaw({ NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 })
    this.state = this.STATE.NONE

    this.STEPS_PER_FRAME = 5
    this.GRAVITY = 30
    this.playerVelocity = markRaw(new THREE.Vector3())
    this.playerOnFloor = true

    this.keyDown = this.onKeyDown.bind(this)
    this.keyUp = this.onKeyUp.bind(this)
    this.addEvents()
  }
  setPhycisMgr(phycisMgr) {
    this.phycisMgr = phycisMgr
  }

  setPlayer(player) {
    this.player = markRaw(player)
    if (player && this.THREE) {
      let vec = player.collider.start.clone()
      vec.y -= player.collider.radius
      player.object3D.position.copy(vec)
      let position = player.object3D.position
      this.camera.position.y = position.y + player.collider.my_centerY * 2 + 0.2
      player.object3D.rotation.y = this.camera.rotation.y + Math.PI
    }
  }
  changeType() {
    if (this.type == 'third') {
      this.tempCaPos = this.camera.position.clone()
      this.tempCaRot = this.camera.rotation.clone()
      this.type = 'first'
      if (this.player.axisy_z) {
        //有个模型轴有问题
        this.camera.rotation.y = this.player.object3D.rotation.z + Math.PI
        this.camera.rotation.x = 0
        this.camera.rotation.z = 0
      } else {
        this.camera.rotation.y = this.player.object3D.rotation.y + Math.PI
        this.camera.rotation.x = 0
        this.camera.rotation.z = 0
      }
    } else {
      this.type = 'third'
      if (this.tempCaPos) {
        this.camera.position.copy(this.tempCaPos)
      }
      if (this.tempCaRot) {
        this.camera.rotation.copy(this.tempCaRot)
      }
    }
  }
  update(delta) {
    if (!this.player || !this.camera) {
      return
    }
    const deltaTime = Math.min(0.05, delta) / this.STEPS_PER_FRAME
    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.
    for (let i = 0; i < this.STEPS_PER_FRAME; i++) {
      let dt=this.camera.position.clone().sub(this.player.collider.start)
      dt.y=0
      this.player.collider.translate(dt)
      let space = this.keyState[32]
      const velocity = this.playerVelocity
      if (space) {
        this.keyState[32] = false
        if (this.playerOnFloor) {
          velocity.y = this.jumpSpeed
        }
      }
      if (deltaTime != undefined) {
        let damping = Math.exp(-4 * deltaTime) - 1
        if (!this.playerOnFloor) {
          velocity.y -= this.GRAVITY*1.5 * deltaTime
          // small air resistance
          damping *= 0.1
        }
        velocity.addScaledVector(velocity, damping)
        let deltaPosition = velocity.clone().multiplyScalar(deltaTime)
        if (deltaPosition != undefined && this.player) {
          if (this.phycisMgr) {
            if (this.phycisMgr.mgrType == 'octree') {
              this.player.collider.translate(deltaPosition)
            }
          }
        }
      }
      this.checkPlayer()
      {
        this.phycisMgr.update(deltaTime, { playerVelocity: velocity })
        // let end = this.player.collider.end
        let start = this.player.collider.start.clone()
        let vec=start.clone()
        vec.y-=this.player.collider.radius
        this.player.object3D.position.copy(vec)
        // //
        vec=this.player.object3D.position
        let h=vec.y+this.player.collider.my_centerY*2+0.2
        this.camera.position.set( start.x,h,start.z)
        this.player.object3D.rotation.y=this.camera.rotation.y+Math.PI+0.15

      }
    }
  }

  checkPlayer(pathFinding) {
    if (this.phycisMgr) {
      if (this.phycisMgr.mgrType == 'octree' && this.phycisMgr.worldOctree) {
        const result = this.phycisMgr.worldOctree.capsuleIntersect(this.player.collider)
        this.playerOnFloor = false
        // 地面检测
        if (result) {
          const velocity = this.playerVelocity
          this.playerOnFloor = result.normal.y > 0
          if (!this.playerOnFloor) {
            velocity.addScaledVector(result.normal, -result.normal.dot(velocity))
          }
          const deltaPosition = result.normal.multiplyScalar(result.depth)
          if (this.playerOnFloor && pathFinding) {
            deltaPosition.x = deltaPosition.z = 0
          }
          this.player.collider.translate(deltaPosition)
        }
      }
    }
  }
  onKeyDown(event) {
    event = event || window.event
    if (event.preventDefault != undefined) event.preventDefault()
    let key_state = this.keyState
    if (!key_state[event.keyCode || event.which]) {
      key_state[event.keyCode || event.which] = true
    }
  }
  onKeyUp(event) {
    event = event || window.event
    if (event.preventDefault != undefined) event.preventDefault()

    let key_state = this.keyState
    key_state[event.keyCode || event.which] = false
    if (event.keyCode == 74 || event.which == 74) {
      this.shoot()
    }
  }

  setEnable(flag) {
    this.enabled = flag
    if (flag) {
      this.addEvents()
    } else {
      this.removeEvents()
    }
  }
  addEvents() {
    this.removeEvents()
    let flag = Is.isMobileDevice()
    let options = flag ? { passive: false } : false
    document.body.addEventListener('keydown', this.keyDown, options)
    document.body.addEventListener('keyup', this.keyUp, options)
  }
  removeEvents() {

    document.body.removeEventListener('keydown', this.keyDown)
    document.body.removeEventListener('keyup', this.keyUp)
  }
  //////////////////////////////////////
  setObstacles(obj) {
    if (this.phycisMgr) {
      this.phycisMgr.addObstacles(obj)
    }
  }
  shoot() {
    if (this.phycisMgr) {
      this.phycisMgr.testShoot(this.playerVelocity, this.type)
      return
    }
  }
}
