import Is from '@/utils/is'
import { toRaw } from '@vue/reactivity'
export class ThirdPersonCameraControl {
  dispose() {
    this.callback_joyStickJump = null
    this.removeEvents()
    this.com = null
    this.THREE = null
    this.camera = null

    this.player = null

    this.rotateStart = null
    this.rotateEnd = null
    this.rotateDelta = null

    this.zoomStart = null
    this.zoomEnd = null
    this.zoomDelta = null
    this.rotateStart = null
    this.rotateEnd = null
    this.rotateDelta = null

    this.zoomStart = null
    this.zoomEnd = null
    this.zoomDelta = null
    this.domElement = null
    this.center = null

    this.rotateQuat = null
    this.rotateAxis = null
    this.tempCaPos = null
    this.tempCaRot = null
    this.keyDown = null
    this.keyUp = null
    this.mouseWheel = null
    this.contextmenu = null
    this.mouseDown = null
    this.mouseMove = null
    this.mouseUp = null
    if (this.phycisMgr) {
      this.phycisMgr.dispose()
    }
    this.phycisMgr = null
  }
  constructor(com, domElement) {
    this.logTag = new Date().getTime()
    this.phycisMgr = null
    this.com = com
    this.THREE = com.THREE
    this.camera = com.camera
    this.domElement = domElement !== undefined ? domElement : document
    this.type = 'third'
    // API
    this.enabled = false

    this.moveSpeed = 2.5

    this.userZoomSpeed = 1.0

    this.userRotate = true
    this.userRotateSpeed = 1.5

    this.autoRotate = false
    this.autoRotateSpeed = 0.1

    this.minPolarAngle = 0
    this.maxPolarAngle = Math.PI

    this.minDistance = 0
    this.maxDistance = Infinity

    // internals

    this.EPS = 0.000001
    this.PIXELS_PER_ROUND = 1800

    this.rotateStart = new com.THREE.Vector2()
    this.rotateEnd = new com.THREE.Vector2()
    this.rotateDelta = new com.THREE.Vector2()

    this.zoomStart = new com.THREE.Vector2()
    this.zoomEnd = new com.THREE.Vector2()
    this.zoomDelta = new com.THREE.Vector2()

    this.phiDelta = 0
    this.thetaDelta = 0
    this.scale = 1
    this.player = null

    this.playerIsMoving = false
    this.joyStickRad = -1000
    this.keyState = {}
    this.STATE = { NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 }
    this.state = this.STATE.NONE

    this.STEPS_PER_FRAME = 5
    this.GRAVITY = 30
    this.playerVelocity = new com.THREE.Vector3()
    this.playerOnFloor = true

    this.callback_joyStickJump = null
    this.rotateQuat = new this.THREE.Quaternion()
    this.rotateAxis = new this.THREE.Vector3(0, 0, 0)

    this.keyDown = this.onKeyDown.bind(this)
    this.keyUp = this.onKeyUp.bind(this)
    this.mouseWheel = this.onMouseWheel.bind(this)
    this.contextmenu = this.contextMenu.bind(this)
    this.mouseDown = this.onMouseDown.bind(this)
    this.mouseMove = this.onMouseMove.bind(this)
    this.mouseUp = this.onMouseUp.bind(this)
    this.addEvents()
  }
  setPhycisMgr(phycisMgr) {
    this.phycisMgr = phycisMgr
  }

  setPlayer(player) {
    this.player = player
    if (player && this.THREE) {
      this.center = new this.THREE.Vector3(player.position.x, player.position.y, player.position.z)
    } else {
      this.center = null
    }
  }
  rotateLeft(angle) {
    if (angle === undefined) {
      angle = this.getAutoRotationAngle()
    }

    this.thetaDelta -= angle
  }

  rotateUp(angle) {
    if (angle === undefined) {
      angle = this.getAutoRotationAngle()
    }

    this.phiDelta -= angle
  }

  zoomIn(zoomScale) {
    if (zoomScale === undefined) {
      zoomScale = this.getZoomScale()
    }

    this.scale /= zoomScale
  }

  zoomOut(zoomScale) {
    if (zoomScale === undefined) {
      zoomScale = this.getZoomScale()
    }

    this.scale *= zoomScale
  }

  changeType() {
    if (this.type == 'third') {
      this.tempCaPos = this.camera.position.clone()
      this.tempCaRot = this.camera.rotation.clone()
      this.type = 'first'
      if (this.player.axisy_z) {
        //有个模型轴有问题
        this.camera.rotation.y = this.player.player.rotation.z + Math.PI
        this.camera.rotation.x = 0
        this.camera.rotation.z = 0
      } else {
        this.camera.rotation.y = this.player.player.rotation.y + Math.PI
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
      this.checkKeyStates(deltaTime)
      let theta = 0
      let radius = 0
      if (this.type == 'third') {
        //
        this.center = this.player.position
        //
        let position = this.camera.position
        let offset = position.clone().sub(this.center)
        //
        // // angle from z-axis around y-axis
        //
        theta = Math.atan2(offset.x, offset.z)
        // angle from y-axis
        let phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y)

        theta += this.thetaDelta
        phi += this.phiDelta

        // restrict phi to be between desired limits
        phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi))

        // restrict phi to be between EPS and PI-EPS
        phi = Math.max(this.EPS, Math.min(Math.PI - this.EPS, phi))

        radius = offset.length() * this.scale

        radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius))

        offset.x = radius * Math.sin(phi) * Math.sin(theta)
        offset.y = radius * Math.cos(phi)
        offset.z = radius * Math.sin(phi) * Math.cos(theta)
        //
        if (this.autoRotate) {
        } else {
          position.copy(this.center).add(offset)
        }

        this.camera.lookAt(this.center)
      } else {
        this.camera.position.copy(this.player.position.clone())
      }

      if (this.com.axesHelper) {
        this.com.axesHelper.position.copy(this.player.position.clone())
      }
      //
      this.thetaDelta = 0
      this.phiDelta = 0
      this.scale = 1
    }
  }

  checkPlayer() {
    if (this.phycisMgr) {
      if (this.phycisMgr.mgrType == 'octree' && this.phycisMgr.worldOctree) {
        const result = this.phycisMgr.worldOctree.capsuleIntersect(this.player.collider)
        this.playerOnFloor = false
        // 地面检测
        if (result) {
          this.playerOnFloor = result.normal.y > 0
          if (!this.playerOnFloor) {
            this.playerVelocity.addScaledVector(
              result.normal,
              -result.normal.dot(this.playerVelocity)
            )
          }
          const deltaPosition = result.normal.multiplyScalar(result.depth)
          this.player.collider.translate(deltaPosition)
        }
      }
    }
  }
  checkKeyStates(deltaTime) {
    let space = this.keyState[32]
    if (space) {
      this.keyState[32] = false
      if (this.playerOnFloor) {
        this.playerVelocity.y = 15
      }
    }
    if (this.playerOnFloor) {
      if (this.playerIsMoving) {
        let rotate = this.player.player.rotation.y
        if (this.player.axisy_z) {
          //有个模型轴有问题
          rotate = this.player.player.rotation.z
        }
        if (this.type == 'first') {
          let key_state = this.keyState
          let w = key_state[38] || key_state[87]
          let s = key_state[40] || key_state[83]
          let a = key_state[37] || key_state[65]
          let d = key_state[39] || key_state[68]
          if (w || s || a || d) {
            if (s) {
              rotate += Math.PI
            } else if (a) {
              rotate += Math.PI / 2
            } else if (d) {
              rotate -= Math.PI / 2
            }
          } else {
            rotate = null
          }
        }
        if (rotate != null) {
          let xx = this.moveSpeed * Math.sin(rotate)
          let yy = this.moveSpeed * Math.cos(rotate)
          if (this.player.axisy_z) {
            //有个模型轴有问题
            this.playerVelocity.x = xx
            this.playerVelocity.z = yy
          } else {
            this.playerVelocity.x = xx
            this.playerVelocity.z = yy
          }
        }
      }
    }
    if (deltaTime != undefined) {
      let damping = Math.exp(-4 * deltaTime) - 1
      if (!this.playerOnFloor) {
        this.playerVelocity.y -= this.GRAVITY * deltaTime
        // small air resistance
        damping *= 0.1
      }
      this.playerVelocity.addScaledVector(this.playerVelocity, damping)
      const deltaPosition = this.playerVelocity.clone().multiplyScalar(deltaTime)
      let updatePos = () => {
        if (this.phycisMgr) {
          if (this.phycisMgr.mgrType == 'octree') {
            //假设start.y创建初始是0
            let end = this.player.collider.end
            let start = this.player.collider.start
            let dy = (end.y - start.y) / 2
            let pp = start.clone().setY(start.y + dy)
            this.player.position.copy(pp)
          } else if (this.phycisMgr.mgrType == 'cannon') {
            if (this.phycisMgr.playerBody != null) {
              // let position = this.phycisMgr.playerBody.interpolatedPosition
              // let quaternion = this.phycisMgr.playerBody.interpolatedQuaternion
              // this.player.position.copy(this.phycisMgr.playerBody.position)
              let old = this.player.position.clone()
              old.copy(this.phycisMgr.playerBody.position)
              let bodyH = this.phycisMgr.playerBodyH
              let pp = old.setY(old.y - bodyH + this.player.centerY)
              this.player.position.copy(pp)
            }
          }
        }
      }
      if (deltaPosition != undefined && this.player) {
        if (this.phycisMgr) {
          if (this.phycisMgr.mgrType == 'octree') {
            this.player.collider.translate(deltaPosition)
          } else if (this.phycisMgr.mgrType == 'cannon') {
            if (this.phycisMgr.playerBody) {
              this.phycisMgr.playerBody.velocity.x = this.playerVelocity.x
              this.phycisMgr.playerBody.velocity.z = this.playerVelocity.z
              this.phycisMgr.playerBody.velocity.y = this.playerVelocity.y
            }
          }
        }
      }
      ////////////////////////////////////////////////////////////////////
      if (this.phycisMgr && this.phycisMgr.update != undefined) {
        this.phycisMgr.update(deltaTime, { playerVelocity: this.playerVelocity })
      }
      this.checkPlayer()
      if (this.callback_joyStickJump) {
      }

      updatePos()
    }
  }

  getAutoRotationAngle() {
    return ((2 * Math.PI) / 60 / 60) * this.autoRotateSpeed
  }

  getZoomScale() {
    return Math.pow(0.95, this.userZoomSpeed)
  }

  rotateByAxis(obj, rad, axis, worldOrSelf) {
    //worldOrSelf : true or false
    // let xUnit = new this.THREE.Vector3(1, 0, 0);
    // let yUnit = new this.THREE.Vector3(0, 1, 0);
    // let zUnit = new this.THREE.Vector3(0, 0, 1);
    //如果 有并发 this.rotateAxis.clone()即可
    let rotateAxis = this.rotateAxis
    let rotateQuat = this.rotateQuat
    //重置
    rotateAxis.set(0, 0, 0)
    if (axis == 'y') {
      rotateAxis.y = 1
    } else if (axis == 'x') {
      rotateAxis.x = 1
    } else if (axis == 'z') {
      rotateAxis.z = 1
    }
    /////////////////////////////////////
    //camera横向旋转，绕世界y轴
    rotateQuat.setFromAxisAngle(rotateAxis, rad)
    if (worldOrSelf) {
      // world axes 世界轴
      obj.quaternion.multiplyQuaternions(rotateQuat, obj.quaternion)
    } else {
      // body axes  自身轴
      obj.quaternion.multiply(rotateQuat)
    }
  }
  allTouches(event) {
    let touches = []
    for (let i = 0; i < event.targetTouches.length; i++) {
      if (event.targetTouches[i].target == this.domElement) {
        touches.push(event.targetTouches[i])
      }
    }
    return touches
  }
  onMouseDown(event) {
    console.log('----', 'onMouseDown')
    if (this.enabled === false) return
    if (this.userRotate === false) return
    event.preventDefault()

    if (Is.isMobileDevice()) {
      let allTouch = this.allTouches(event)
      if (allTouch.length > 0) {
        let touch = allTouch[0]
        if (allTouch.length > 1) {
          this.state = this.STATE.ZOOM
          this.zoomStart.set(touch, touch)
        } else {
          this.state = this.STATE.ROTATE
          this.rotateStart.set(touch.clientX, touch.clientY)
        }
      }
    } else {
      this.__addDocEvents()
      let touch = event
      if (event.button === 0) {
        this.state = this.STATE.ROTATE
        this.rotateStart.set(touch.clientX, touch.clientY)
      } else if (event.button === 1) {
        this.state = this.STATE.ZOOM
        this.zoomStart.set(touch.clientX, touch.clientY)
      }
    }
  }

  onMouseMove(event) {
    if (this.enabled === false) return
    event.preventDefault()
    let touch = null
    if (Is.isMobileDevice()) {
      let allTouch = this.allTouches(event)
      if (allTouch.length > 0) {
        touch = allTouch[0]
      }
    } else {
      touch = event
    }
    if (!touch) {
      return
    }
    if (this.state === this.STATE.ROTATE) {
      this.rotateEnd.set(touch.clientX, touch.clientY)
      this.rotateDelta.subVectors(this.rotateEnd, this.rotateStart)
      if (this.type == 'third') {
        //限制 一次只旋转左右 或 上下，一般不需要一起 旋转，晃眼
        if (Math.abs(this.rotateDelta.x) > Math.abs(this.rotateDelta.y)) {
          this.rotateLeft(
            ((2 * Math.PI * this.rotateDelta.x) / this.PIXELS_PER_ROUND) * this.userRotateSpeed
          )
        } else {
          this.rotateUp(
            ((2 * Math.PI * this.rotateDelta.y) / this.PIXELS_PER_ROUND) * this.userRotateSpeed
          )
        }
      } else {
        if (Math.abs(this.rotateDelta.x) > Math.abs(this.rotateDelta.y)) {
          let rad =
            ((2 * Math.PI * this.rotateDelta.x) / this.PIXELS_PER_ROUND) * this.userRotateSpeed
          this.rotateByAxis(this.camera, rad, 'y', true)
          if (this.player.axisy_z) {
            //有个模型轴有问题
            this.player.player.rotation.z += rad
          } else {
            this.player.player.rotation.y += rad
          }
        } else {
          let rad =
            ((2 * Math.PI * this.rotateDelta.y) / this.PIXELS_PER_ROUND) * this.userRotateSpeed
          this.rotateByAxis(this.camera, rad, 'x', false)
        }
      }
      this.rotateStart.copy(this.rotateEnd)
    } else if (this.state === this.STATE.ZOOM) {
      this.zoomEnd.set(touch.clientX, touch.clientY)
      this.zoomDelta.subVectors(this.zoomEnd, this.zoomStart)

      if (this.zoomDelta.y > 0) {
        this.zoomIn()
      } else {
        this.zoomOut()
      }
      this.zoomStart.copy(this.zoomEnd)
    }
  }

  onMouseUp(event) {
    if (!this.isKeyDownMoving() && this.joyStickRad == -1000) {
      this.playerIsMoving = false
    }
    if (!this.playerIsMoving) {
      this.joyStickRad = -1000
    }
    if (this.enabled === false) return
    if (this.userRotate === false) return

    this.__removeDocEvents(1)
    if (this.playerIsMoving) {
      if (this.state == this.STATE.ROTATE) {
        if (this.joyStickRad != -1000) {
          this.joyStickChange(this.joyStickRad)
        } else {
          this.directChanged(false)
        }
      }
    }
    this.state = this.STATE.NONE
  }

  onMouseWheel(event) {
    if (this.enabled === false) return
    if (this.userRotate === false) return

    let delta = 0
    if (event.wheelDelta) {
      //WebKit / Opera / Explorer 9
      delta = event.wheelDelta
    } else if (event.detail) {
      // Firefox
      delta = -event.detail
    }

    if (delta > 0) {
      this.zoomOut()
    } else {
      this.zoomIn()
    }
  }

  onKeyDown(event) {
    event = event || window.event
    if (event.preventDefault != undefined) event.preventDefault()
    let key_state = this.keyState
    if (!key_state[event.keyCode || event.which]) {
      key_state[event.keyCode || event.which] = true
      this.directChanged(true)
    }
  }
  onKeyUp(event) {
    event = event || window.event
    if (event.preventDefault != undefined) event.preventDefault()

    let key_state = this.keyState
    key_state[event.keyCode || event.which] = false
    if (this.isKeyDownMoving()) {
      // this.directChanged()
    } else {
      console.log('---', key_state)
      this.playerIsMoving = false
    }
  }
  isKeyDownMoving() {
    let moveKeys = [37, 38, 39, 40, 65, 68, 83, 87] //wasd 上下左右
    let flag = false
    let key_state = this.keyState
    for (let i = 0; i < moveKeys.length; i++) {
      if (key_state[moveKeys[i]]) {
        flag = true
        break
      }
    }
    return flag
  }
  getCameragetWorldDirection() {
    let vector = new this.THREE.Vector3()
    this.camera.getWorldDirection(vector)
    return Math.atan2(vector.x, vector.z)
  }
  directChanged(isDown) {
    try {
      let theta = this.getCameragetWorldDirection()
      let key_state = this.keyState
      let w = key_state[38] || key_state[87]
      let s = key_state[40] || key_state[83]
      let a = key_state[37] || key_state[65]
      let d = key_state[39] || key_state[68]
      if (w || s || a || d) {
        let dir
        if (this.type == 'first') {
          this.playerIsMoving = true
        } else {
          if (s) {
            dir = theta + Math.PI
            if (d) {
              dir = theta + (Math.PI * 5) / 4
            } else if (a) {
              dir = theta + (Math.PI * 3) / 4
            }
          } else if (w) {
            dir = theta
            if (d) {
              dir = theta - Math.PI / 4
            } else if (a) {
              dir = theta + Math.PI / 4
            }
          } else if (a) {
            dir = theta + Math.PI / 2
            if (w) {
              dir = theta + Math.PI / 4
            } else if (s) {
              dir = theta - Math.PI / 4
            }
          } else if (d) {
            dir = theta + (Math.PI * 3) / 2
            if (w) {
              dir = theta + Math.PI / 4
            } else if (s) {
              dir = theta - Math.PI / 4
            }
          }
        }
        if (this.type == 'third' && this.player) {
          if (this.player.axisy_z) {
            //有个模型轴有问题
            this.player.player.rotation.z = dir
          } else {
            this.player.player.rotation.y = dir
          }
          if (isDown) {
            this.playerIsMoving = true
          }
        }
      }
    } catch (e) {
      console.error('directChanged', e)
      console.log('directChanged', this.logTag + '------')
    }
  }

  joyStickJump(callback) {
    this.callback_joyStickJump = callback
    this.onKeyDown({ code: 'Space', keyCode: '32' })
  }
  joyStickChange(rad) {
    this.joyStickRad = rad
    if (rad <= -1000) {
      return
    }
    if (this.player) {
      if (this.type == 'third') {
        let theta = this.getCameragetWorldDirection()
        if (this.player.axisy_z) {
          //有个模型轴有问题
          this.player.player.rotation.z = rad + theta - Math.PI / 2
        } else {
          this.player.player.rotation.y = rad + theta - Math.PI / 2
        }
        this.playerIsMoving = true
      } else {
        // let drad=rad + Math.PI / 2-this.player.player.rotation.y
        //this.player.player.rotation.y = rad + Math.PI / 2
        // this.rotateByAxis(this.camera,drad,'y',true)
      }
    }
  }
  contextMenu(event) {
    event.preventDefault()
  }

  setEnable(flag) {
    this.enabled = flag
    if (flag) {
      this.addEvents()
    } else {
      this.removeEvents()
    }
  }
  __addDocEvents() {
    this.__removeDocEvents()
    if (Is.isMobileDevice()) {
      this.domElement.addEventListener('touchmove', this.mouseMove, { passive: false })
      document.addEventListener('touchend', this.mouseUp, { passive: false })
    } else {
      document.addEventListener('mousemove', this.mouseMove, false)
      document.addEventListener('mouseup', this.mouseUp, false)
    }
  }
  __removeDocEvents(type) {
    if (Is.isMobileDevice() && type != 1) {
      this.domElement.removeEventListener('touchmove', this.mouseMove)
      document.removeEventListener('touchend', this.mouseUp)
    } else {
      document.removeEventListener('mousemove', this.mouseMove, false)
      if (type != 1) document.removeEventListener('mouseup', this.mouseUp, false)
    }
  }
  addEvents() {
    this.removeEvents()
    let flag = Is.isMobileDevice()
    if (flag) {
      this.domElement.addEventListener('touchstart', this.mouseDown, {
        passive: false
      })
    } else {
      this.domElement.addEventListener('mousedown', this.mouseDown, false)
    }
    let options = flag ? { passive: false } : false
    this.domElement.addEventListener('contextmenu', this.contextmenu, options)
    this.domElement.addEventListener('mousewheel', this.mouseWheel, options)
    this.domElement.addEventListener('DOMMouseScroll', this.mouseWheel, options) // firefox
    document.body.addEventListener('keydown', this.keyDown, options)
    document.body.addEventListener('keyup', this.keyUp, options)
    console.log('--keydown--', 'addEventListener')
    this.__addDocEvents()
  }
  removeEvents() {
    this.__removeDocEvents()
    if (Is.isMobileDevice()) {
      this.domElement.removeEventListener('touchstart', this.mouseDown)
    } else {
      this.domElement.removeEventListener('mousedown', this.mouseDown)
    }
    this.domElement.removeEventListener('contextmenu', this.contextmenu)
    this.domElement.removeEventListener('mousewheel', this.mouseWheel)
    this.domElement.removeEventListener('DOMMouseScroll', this.mouseWheel)

    document.body.removeEventListener('keydown', this.keyDown)
    document.body.removeEventListener('keyup', this.keyUp)
    console.log('--keydown--', 'removeEventListener')
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
