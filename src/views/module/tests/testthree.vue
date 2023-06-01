<script setup name="testthree">
import {
  ref,
  computed,
  watch,
  defineProps,
  getCurrentInstance,
  provide,
  inject,
  nextTick,
  onActivated,
  onDeactivated,
  reactive,
  onMounted
} from 'vue'
//页面根节点
import PageRoot, { PageNavDef } from '@/components/page/index'
import { useChildren, useParent } from '@vant/use'
import JoyStick from '@/components/threejs/joy-stick/joy-stick.vue'
import Is from '@/utils/is'
const props = defineProps(['relationKey'])
// const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
// const router = useRouter()
////////////////////////////////////
const { parent } = useParent(props.relationKey)
//通过parent调用父组件通过linkChildren提供数据和方法

//将relationKey 通过 props 传递给子组件
const relationKey = Symbol('testthree-relation-Symbol')
const { linkChildren } = useChildren(relationKey)
const calledByChild = function () {}
// 向子组件提供数据和方法
linkChildren({ calledByChild })
/////////////////////////////////////

const i18n_t = inject('i18n_t')

const navDef = reactive({
  nav: PageNavDef.config({
    show: true,
    clickable: true,
    leftArrow: false,
    placeholder: true,
    title: computed(() => {
      // 直接赋值 无响应式，是否有其他方式？？？
      return i18n_t('main.nav.title')
    }),
    leftText: computed(() => {
      return i18n_t('main.nav.leftText')
    }),
    clickLeft: function () {
      return true
    }
  })
})
const containerRef = ref('containerRef')
//透传nav
provide('navParams', navDef)
onMounted(() => {
  // nextTick(function () {
  //   animate()
  // })
})
onActivated(() => {})
onDeactivated(() => {})

import * as THREE from 'three'

import Stats from 'three/addons/libs/stats.module.js'

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

import { Octree } from 'three/addons/math/Octree.js'
import { OctreeHelper } from 'three/addons/helpers/OctreeHelper.js'

import { Capsule } from 'three/addons/math/Capsule.js'

import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import { isMobile } from 'vant/es/utils'

const clock = new THREE.Clock()

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x88ccee)
scene.fog = new THREE.Fog(0x88ccee, 0, 50)

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.rotation.order = 'YXZ'

const fillLight1 = new THREE.HemisphereLight(0x8dc1de, 0x00668d, 0.5)
fillLight1.position.set(2, 1, 1)
scene.add(fillLight1)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(-5, 25, -1)
directionalLight.castShadow = true
directionalLight.shadow.camera.near = 0.01
directionalLight.shadow.camera.far = 500
directionalLight.shadow.camera.right = 30
directionalLight.shadow.camera.left = -30
directionalLight.shadow.camera.top = 30
directionalLight.shadow.camera.bottom = -30
directionalLight.shadow.mapSize.width = 1024
directionalLight.shadow.mapSize.height = 1024
directionalLight.shadow.radius = 4
directionalLight.shadow.bias = -0.00006
scene.add(directionalLight)

// const container = document.getElementById('container')

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.VSMShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping

const stats = new Stats()
stats.domElement.style.position = 'absolute'
stats.domElement.style.top = '0px'
let touchMove = null
let isMove = false
nextTick(() => {
  if (containerRef.value) {
    containerRef.value.appendChild(renderer.domElement)
    containerRef.value.appendChild(stats.domElement)
    if (Is.isMobileDevice()) {
      containerRef.value.addEventListener(
        'touchstart',
        (event) => {
          // document.body.requestPointerLock()
          isMove = false
          touchMove = event.touches[0]
          mouseTime = performance.now()
        },
        { passive: false }
      )

      containerRef.value.addEventListener(
        'touchend',
        () => {
          touchMove = null
          // if (document.pointerLockElement !== null)
          if (!isMove) throwBall()
          isMove = false
        },
        { passive: false }
      )

      containerRef.value.addEventListener(
        'touchmove',
        (event) => {
          event.preventDefault()
          // if (document.pointerLockElement === document.body)
          {
            if (touchMove != null) {
              // if (
              //   event.touches[0].clientX - touchMove.clientX > 3 ||
              //   event.touches[0].clientY - touchMove.clientY > 3
              // )
              {
                camera.rotation.y += (event.touches[0].clientX - touchMove.clientX) / 500
                camera.rotation.x += (event.touches[0].clientY - touchMove.clientY) / 500
                touchMove = event.touches[0]
                isMove = true
              }
            }

            // camera.rotation.y -= event.touches[0].clientX / 500
            // camera.rotation.x -= event.touches[0].clientY / 500
          }
        },
        { passive: false }
      )
    } else {
      containerRef.value.addEventListener('mousedown', () => {
        // document.body.requestPointerLock()

        mouseTime = performance.now()
      })
    }
  }
})
const GRAVITY = 30

const NUM_SPHERES = 100
const SPHERE_RADIUS = 0.2

const STEPS_PER_FRAME = 5

const sphereGeometry = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 5)
const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xdede8d })

const spheres = []
let sphereIdx = 0

for (let i = 0; i < NUM_SPHERES; i++) {
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.castShadow = true
  sphere.receiveShadow = true

  scene.add(sphere)

  spheres.push({
    mesh: sphere,
    collider: new THREE.Sphere(new THREE.Vector3(0, -100, 0), SPHERE_RADIUS),
    velocity: new THREE.Vector3()
  })
}

const worldOctree = new Octree()

const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35)

const playerVelocity = new THREE.Vector3()
const playerDirection = new THREE.Vector3()

let playerOnFloor = false
let mouseTime = 0

const keyStates = {}

const vector1 = new THREE.Vector3()
const vector2 = new THREE.Vector3()
const vector3 = new THREE.Vector3()

if (Is.isMobileDevice()) {
} else {
  document.addEventListener('keydown', (event) => {
    keyStates[event.code] = true
  })

  document.addEventListener('keyup', (event) => {
    keyStates[event.code] = false
  })

  document.addEventListener('mouseup', () => {
    if (document.pointerLockElement !== null) throwBall()
  })

  document.body.addEventListener('mousemove', (event) => {
    if (document.pointerLockElement === document.body) {
      camera.rotation.y -= event.movementX / 500
      camera.rotation.x -= event.movementY / 500
    }
  })
}

window.addEventListener('resize', onWindowResize)

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function throwBall() {
  const sphere = spheres[sphereIdx]

  camera.getWorldDirection(playerDirection)

  sphere.collider.center
    .copy(playerCollider.end)
    .addScaledVector(playerDirection, playerCollider.radius * 1.5)

  // throw the ball with more force if we hold the button longer, and if we move forward

  const impulse = 15 + 30 * (1 - Math.exp((mouseTime - performance.now()) * 0.001))

  sphere.velocity.copy(playerDirection).multiplyScalar(impulse)
  sphere.velocity.addScaledVector(playerVelocity, 2)

  sphereIdx = (sphereIdx + 1) % spheres.length
}

function playerCollisions() {
  const result = worldOctree.capsuleIntersect(playerCollider)

  playerOnFloor = false

  if (result) {
    playerOnFloor = result.normal.y > 0

    if (!playerOnFloor) {
      playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity))
    }

    playerCollider.translate(result.normal.multiplyScalar(result.depth))
  }
}

function updatePlayer(deltaTime) {
  let damping = Math.exp(-4 * deltaTime) - 1

  if (!playerOnFloor) {
    playerVelocity.y -= GRAVITY * deltaTime

    // small air resistance
    damping *= 0.1
  }

  playerVelocity.addScaledVector(playerVelocity, damping)

  const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime)
  playerCollider.translate(deltaPosition)

  playerCollisions()

  camera.position.copy(playerCollider.end)
  //   camera.lookAt(playerCollider.end)
  //   let tt=playerCollider.end.clone()
  //   tt.x=tt.x-3
  //   tt.z=tt.z-3
  //   tt.y=tt.y+3
  //   camera.position.copy(tt)
}

function playerSphereCollision(sphere) {
  const center = vector1.addVectors(playerCollider.start, playerCollider.end).multiplyScalar(0.5)

  const sphere_center = sphere.collider.center

  const r = playerCollider.radius + sphere.collider.radius
  const r2 = r * r

  // approximation: player = 3 spheres

  for (const point of [playerCollider.start, playerCollider.end, center]) {
    const d2 = point.distanceToSquared(sphere_center)

    if (d2 < r2) {
      const normal = vector1.subVectors(point, sphere_center).normalize()
      const v1 = vector2.copy(normal).multiplyScalar(normal.dot(playerVelocity))
      const v2 = vector3.copy(normal).multiplyScalar(normal.dot(sphere.velocity))

      playerVelocity.add(v2).sub(v1)
      sphere.velocity.add(v1).sub(v2)

      const d = (r - Math.sqrt(d2)) / 2
      sphere_center.addScaledVector(normal, -d)
    }
  }
}

function spheresCollisions() {
  for (let i = 0, length = spheres.length; i < length; i++) {
    const s1 = spheres[i]

    for (let j = i + 1; j < length; j++) {
      const s2 = spheres[j]

      const d2 = s1.collider.center.distanceToSquared(s2.collider.center)
      const r = s1.collider.radius + s2.collider.radius
      const r2 = r * r

      if (d2 < r2) {
        const normal = vector1.subVectors(s1.collider.center, s2.collider.center).normalize()
        const v1 = vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity))
        const v2 = vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity))

        s1.velocity.add(v2).sub(v1)
        s2.velocity.add(v1).sub(v2)

        const d = (r - Math.sqrt(d2)) / 2

        s1.collider.center.addScaledVector(normal, d)
        s2.collider.center.addScaledVector(normal, -d)
      }
    }
  }
}

function updateSpheres(deltaTime) {
  spheres.forEach((sphere) => {
    sphere.collider.center.addScaledVector(sphere.velocity, deltaTime)

    const result = worldOctree.sphereIntersect(sphere.collider)

    if (result) {
      sphere.velocity.addScaledVector(result.normal, -result.normal.dot(sphere.velocity) * 1.5)
      sphere.collider.center.add(result.normal.multiplyScalar(result.depth))
    } else {
      sphere.velocity.y -= GRAVITY * deltaTime
    }

    const damping = Math.exp(-1.5 * deltaTime) - 1
    sphere.velocity.addScaledVector(sphere.velocity, damping)

    playerSphereCollision(sphere)
  })

  spheresCollisions()

  for (const sphere of spheres) {
    sphere.mesh.position.copy(sphere.collider.center)
  }
}

function getForwardVector() {
  camera.getWorldDirection(playerDirection)
  playerDirection.y = 0
  playerDirection.normalize()

  return playerDirection
}

function getSideVector() {
  camera.getWorldDirection(playerDirection)
  playerDirection.y = 0
  playerDirection.normalize()
  playerDirection.cross(camera.up)

  return playerDirection
}

function controls(deltaTime, code) {
  // gives a bit of air control
  const speedDelta = deltaTime * (playerOnFloor ? 25 : 8)

  if (keyStates['KeyW'] || code == 'top') {
    playerVelocity.add(getForwardVector().multiplyScalar(speedDelta))
  }

  if (keyStates['KeyS'] || code == 'bottom') {
    playerVelocity.add(getForwardVector().multiplyScalar(-speedDelta))
  }

  if (keyStates['KeyA'] || code == 'left') {
    playerVelocity.add(getSideVector().multiplyScalar(-speedDelta))
  }

  if (keyStates['KeyD'] || code == 'right') {
    playerVelocity.add(getSideVector().multiplyScalar(speedDelta))
  }

  if (playerOnFloor) {
    if (keyStates['Space']||code=='jump') {
      playerVelocity.y = 15
    }
  }
}

const loader = new GLTFLoader().setPath('./modules/gltf/')

loader.load('collision-world.glb', (gltf) => {
  scene.add(gltf.scene)

  worldOctree.fromGraphNode(gltf.scene)

  gltf.scene.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true

      if (child.material.map) {
        child.material.map.anisotropy = 4
      }
    }
  })

  const helper = new OctreeHelper(worldOctree)
  helper.visible = false
  scene.add(helper)

  const gui = new GUI({ width: 200 })
  gui.add({ debug: false }, 'debug').onChange(function (value) {
    helper.visible = value
  })

  animate()
})

function teleportPlayerIfOob() {
  if (camera.position.y <= -25) {
    playerCollider.start.set(0, 0.35, 0)
    playerCollider.end.set(0, 1, 0)
    playerCollider.radius = 0.35
    camera.position.copy(playerCollider.end)
    camera.rotation.set(0, 0, 0)
  }
}

function animate() {
  const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME

  // we look for collisions in substeps to mitigate the risk of
  // an object traversing another too quickly for detection.

  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    controls(deltaTime)

    updatePlayer(deltaTime)

    updateSpheres(deltaTime)

    teleportPlayerIfOob()
  }

  renderer.render(scene, camera)

  stats.update()

  requestAnimationFrame(animate)
}
let holdTimer = null
let holdType = null
const getRad = function (val) {
  if (val.finished) {
    if (holdTimer) {
      clearInterval(holdTimer)
      holdTimer = null
      holdType = null
    }
  } else {
    if (!holdTimer) {
      holdTimer = setInterval(function () {
        if (holdType) {
          controls(0.01, holdType)
        }
      }, 20)
    }

    let rad = val.rad
    if (rad < Math.PI / 4 || rad >= (Math.PI * 7) / 4) {
      if (holdType != 'right') holdType = 'right'
    } else if (rad >= Math.PI / 4 && rad <= (Math.PI * 3) / 4) {
      if (holdType != 'top') holdType = 'top'
    } else if (rad > (Math.PI * 3) / 4 && rad <= (Math.PI * 5) / 4) {
      if (holdType != 'left') holdType = 'left'
    } else if (rad > (Math.PI * 5) / 4 && rad < (Math.PI * 7) / 4) {
      if (holdType != 'bottom') holdType = 'bottom'
    }
  }
}
const jump=function (){
    controls(0.1,'jump')
}
const shoot=function (){
    throwBall()
}
</script>
<template>
  <page-root>
    <template v-slot:left>
      <van-icon name="manager" />
    </template>
    <!--    <template v-slot:title><div>我的title</div></template>-->
    <!--    <template v-slot:right><div>我的right</div></template>-->
    <template v-slot:body>
      <div>我是testthree,测试官网例子用</div>
      <div ref="containerRef"></div>
      <joy-stick :get-rad="getRad" :jump="jump" :shoot="shoot"></joy-stick>
    </template>
  </page-root>
</template>

<style scoped></style>
<style lang="scss" scoped></style>
