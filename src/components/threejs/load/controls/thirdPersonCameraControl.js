import Is from '@/utils/is'
import { markRaw } from 'vue'
import { PathFind } from '@/components/threejs/load/controls/tools/path-find'
export class ThirdPersonCameraControl {
  dispose() {
    this.pathFind.dispose()
    this.pathFind = null
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
    let doc=domElement !== undefined ? domElement : document
    this.logTag = new Date().getTime()
    this.phycisMgr = null
    this.com = com
    this.THREE = com.THREE
    this.camera = markRaw(com.camera)
    this.domElement = markRaw(doc)
    this.type = 'third'
    this.pathFind = markRaw(new PathFind())
    // API
    this.enabled = false

    this.moveSpeed = 2.5
    this.jumpHeight = 15

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

    this.rotateStart = markRaw(new com.THREE.Vector2())
    this.rotateEnd = markRaw(new com.THREE.Vector2())
    this.rotateDelta = markRaw(new com.THREE.Vector2())

    this.zoomStart = markRaw(new com.THREE.Vector2())
    this.zoomEnd = markRaw(new com.THREE.Vector2())
    this.zoomDelta = markRaw(new com.THREE.Vector2())

    this.phiDelta = 0
    this.thetaDelta = 0
    this.scale = 1
    this.player = null

    this.playerIsMoving = false
    this.joyStickRad = -1000
    this.keyState = {}
    this.STATE = markRaw({ NONE: -1, ROTATE: 0, ZOOM: 1, PAN: 2 })
    this.state = this.STATE.NONE

    this.STEPS_PER_FRAME = 5
    this.GRAVITY = 30
    this.playerVelocity = markRaw(new com.THREE.Vector3())
    this.playerOnFloor = true

    this.callback_joyStickJump = null
    this.rotateQuat = markRaw(new com.THREE.Quaternion())
    this.rotateAxis = markRaw(new com.THREE.Vector3(0, 0, 0))
    this.moveQuat = markRaw({
      useSmooth:true,
      rotateQuat2: new com.THREE.Quaternion(),
      rotateAxis2: new com.THREE.Vector3(0, 0, 0),
      pathFind: {
        dest: null,
        flag: false
      }
    })

    this.tagScale = markRaw(new com.THREE.Vector3(0.01, 0.02, 0.01))

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
    this.player = markRaw(player)
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

      this.thetaDelta = 0
      this.phiDelta = 0
      this.scale = 1
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
  smoothRotateParam(destRotation, destPosition) {
    let moveQuat = this.moveQuat
    if (destRotation) {
      if (this.player.axisy_z) {
        //有个模型轴有问题，不能用quaternion去平滑
        this.player.player.rotation.z = destRotation
        moveQuat.destRotation = destRotation
        return
      } else {
        if (!moveQuat.useSmooth){
          //直接旋转，不用平滑
          this.player.player.rotation.y = destRotation
          moveQuat.destRotation = destRotation
          return;
        }
        moveQuat.rotateAxis2.set(0, 1, 0)
      }
      let flag = true
      if (destPosition) {
        // 只有寻路会走此处
        flag = !moveQuat.pathFind.dest || !destPosition.equals(moveQuat.pathFind.dest)
      }
      if (flag) {
        moveQuat.destRotation = destRotation
        moveQuat.pathFind.dest = destPosition
        moveQuat.pathFind.flag = false
        moveQuat.rotateQuat2.setFromAxisAngle(moveQuat.rotateAxis2, destRotation)
        moveQuat.rotateToQuat = moveQuat.rotateQuat2.clone()
      } else if (destPosition && moveQuat.pathFind.flag) {
        moveQuat.destRotation = destRotation
        //需要不断校验前进方向
      }
    }
  }
  checkKeyStates(deltaTime) {
    if (this.stopPathFind) {
      if (this.pathFind) this.pathFind.clearPath()
      this.stopPathFind = false
    }
    let space = this.keyState[32]
    const velocity = this.playerVelocity
    if (space) {
      this.keyState[32] = false
      if (this.playerOnFloor) {
        velocity.y = this.jumpHeight
      }
    }
    let dest_pathFind = null
    if (this.playerOnFloor) {
      let dest = this.pathFind?.getDest()
      let rotation = null
      if (dest) {
        // dest_pathFind = dest
        rotation = this.pathFind.rotations(this, this.player.position, dest.position)
        //注：主要是为了 旋转平滑用
        this.smoothRotateParam(rotation, dest.position)
      }
      let moveQuat = this.moveQuat
      if (moveQuat.rotateToQuat != undefined) {
        if (!this.player.player.quaternion.equals(moveQuat.rotateToQuat)) {
          this.player.player.quaternion.rotateTowards(moveQuat.rotateToQuat, 15 * deltaTime)
        } else if (dest) {
          moveQuat.pathFind.flag = true
          dest_pathFind = dest
        }
      } else if (dest) {
        dest_pathFind = dest
      }

      if (this.playerIsMoving || dest_pathFind) {
        let rotate = moveQuat ? moveQuat.destRotation : null
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
            velocity.x = xx
            velocity.z = yy
          } else {
            velocity.x = xx
            velocity.z = yy
          }
        }
      }
    }
    if (deltaTime != undefined) {
      let damping = Math.exp(-4 * deltaTime) - 1
      if (!this.playerOnFloor) {
        velocity.y -= this.GRAVITY * deltaTime
        // small air resistance
        damping *= 0.1
      }
      velocity.addScaledVector(velocity, damping)
      let deltaPosition = velocity.clone().multiplyScalar(deltaTime)
      if (dest_pathFind) {
        //注：checkDelta有待优化，碰撞反弹 可能会影响判断
        let res = this.pathFind?.checkDelta(dest_pathFind.position, this)
        if (res && res.finished) {
          deltaPosition.x = res.delta.x
          deltaPosition.z = res.delta.z
          velocity.set(0, velocity.y, 0)
        }
      }
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
          if (this.player.tag) {
            let pos = this.player.position.clone()
            let tag = this.player.tag
            if (this.player.tag.mytype == '3d') {
              let scale = this.tagScale
              if (!tag.scale.equals(scale)) {
                tag.scale.set(0.01, 0.01, 0.01)
              }
            }
            tag.visible = this.player.visible
            tag.position.copy(pos.setY(pos.y + 0.4)) //偏移跟 模型原点有关
          }
        }
      }
      if (deltaPosition != undefined && this.player) {
        if (this.phycisMgr) {
          if (this.phycisMgr.mgrType == 'octree') {
            this.player.collider.translate(deltaPosition)
          } else if (this.phycisMgr.mgrType == 'cannon') {
            if (this.phycisMgr.playerBody) {
              this.phycisMgr.playerBody.velocity.x = velocity.x
              this.phycisMgr.playerBody.velocity.z = velocity.z
              this.phycisMgr.playerBody.velocity.y = velocity.y
            }
          }
        }
      }
      this.checkPlayer(dest_pathFind)
      if (this.callback_joyStickJump) {
      }
      this.phycisMgr.update(deltaTime, { playerVelocity: velocity })
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
    let touchesAvailable = event.targetTouches
    if (event.type == 'touchend') {
      touchesAvailable = event.changedTouches
    }
    for (let i = 0; i < touchesAvailable.length; i++) {
      if (touchesAvailable[i].target == this.domElement) {
        touches.push(touchesAvailable[i])
      }
    }
    return touches
  }
  onMouseDown(event) {
    if (this.enabled === false) return
    if (this.userRotate === false) return
    event.preventDefault()
    if (Is.isMobileDevice()) {
      let allTouch = this.allTouches(event)
      if (allTouch.length > 0) {
        let touch = allTouch[0]
        if (allTouch.length > 1) {
          this.state = this.STATE.ZOOM
          let touch1 = allTouch[1]
          this.zoomStart.set(touch.clientX, touch.clientY)
          this.zoomEnd.set(touch1.clientX, touch1.clientY)
          this.zoomDelta.subVectors(this.zoomEnd, this.zoomStart)
        } else {
          this.state = this.STATE.ROTATE
          this.rotateStart.set(touch.clientX, touch.clientY)
        }
        this.isMouseDown = true
      }
    } else {
      this.isMouseDown = true
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
    if (document.pointerLockElement === document.body) {
      this.camera.rotation.y -= event.movementX / 500
      this.camera.rotation.x -= event.movementY / 500

    }
    if (this.enabled === false) return
    event.preventDefault()
    let touch = null
    let isMobile = Is.isMobileDevice()
    let allTouch = null
    if (isMobile) {
      allTouch = this.allTouches(event)
      if (allTouch.length > 0) {
        touch = allTouch[0]
      }
    } else {
      touch = event
    }
    if (!touch) {
      return
    }
    this.isMouseMoving = true
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
      if (isMobile) {
        if (allTouch && allTouch.length > 1) {
          let touch1 = allTouch[1]
          this.zoomStart.set(touch.clientX, touch.clientY)
          this.zoomEnd.set(touch1.clientX, touch1.clientY)
          let prev = this.zoomDelta.clone()
          this.zoomDelta.subVectors(this.zoomEnd, this.zoomStart)
          if (this.zoomDelta.length() > prev.length() + 0.5) {
            this.zoomOut()
          } else if (this.zoomDelta.length() + 0.5 < prev.length()) {
            this.zoomIn()
          }
        }
      } else {
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

    if (this.isMouseDown && !this.isMouseMoving) {
      this.selectObject(event)
    }
    this.isMouseDown = false
    this.isMouseMoving = false
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

  makeSelectMouse(event) {
    let touch = event
    if (Is.isMobileDevice()) {
      let allTouch = this.allTouches(event)
      if (allTouch.length > 0) {
        touch = allTouch[0]
      }
    }
    const mouse = new this.THREE.Vector2()
    // 屏幕坐标转标准设备坐标
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1
    //Raycaster.setFromCamera 里有相关的代码
    // //标准设备坐标(z=0.5这个值比较靠经验)
    // const stdVector = new this.THREE.Vector3(pt.x, pt.y, 0.5)
    // //世界坐标
    // const worldVector = stdVector.unproject(this.camera)
    return mouse
  }
  selectObject(event) {
    let pt = this.makeSelectMouse(event)
    if (!this.raycaster) this.raycaster = markRaw(new this.THREE.Raycaster())
    if (this.raycaster) {
      this.camera.updateMatrixWorld()
      this.raycaster.setFromCamera(pt, this.camera)
      let scene = this.com.scene
      let navmesh = scene.getObjectByName('navmesh')
      if (navmesh) {
        //获取寻路的 目标坐标
        const nav_res = this.raycaster.intersectObject(navmesh)
        if (nav_res && nav_res.length > 0) {
          let dest = nav_res[0].point
          this.pathFind.test('demo', this.player.position.clone(), dest, this)
        }
      }
      //获取点击的 物品
      //遍历 scene.children对象  第二个参数：false不遍历对象子
      const intersects = this.raycaster.intersectObjects(this.com.scene.children, false)
      if (intersects && intersects.length) {
        if (intersects.length > 0) {
          for (let i = 0; i < intersects.length; i++) {
            let it = intersects[i]
            if (it.object.myname != 'Sky' && it.object.myname != 'my-axesHelper') {
              break
            }
          }
        }
      }
    }
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
    if (event.keyCode == 70 || event.which == 70) {
      this.shoot()
    }
    if (this.isKeyDownMoving()) {
      // this.directChanged()
    } else {
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
            // this.player.player.rotation.z = dir
          } else {
            // this.player.player.rotation.y = dir
          }
          this.smoothRotateParam(dir, null)
          if (isDown) {
            this.stopPathFind = true
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
        let dir = rad + theta - Math.PI / 2
        if (this.player.axisy_z) {
          //有个模型轴有问题
          // this.player.player.rotation.z = dir
        } else {
          // this.player.player.rotation.y = dir
        }
        this.smoothRotateParam(dir, null)
        this.stopPathFind = true
        this.playerIsMoving = true
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
