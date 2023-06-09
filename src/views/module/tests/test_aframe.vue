<script setup name="test_aframe">
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
  onBeforeUnmount,
  markRaw
} from 'vue'
//页面根节点
import PageRoot, { PageNavDef } from '@/components/page/index'
import { useChildren, useParent } from '@vant/use'
import AframeLoad from '@/components/aframe/aframe-load.vue'
import { SkyMgr } from '@/components/aframe/com/sky-msr'
const props = defineProps(['relationKey'])
import { OctreeMgr } from '@/components/threejs/load/controls/phycis/octree-mgr'
import { PersonCameraControl } from '@/components/aframe/tools/personCameraControl'
import LoadHelper from '@/components/threejs/tools/load-helper'
import PlayerMake from '@/components/threejs/tests/player-make'
// const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
// const router = useRouter()
let controls = null
////////////////////////////////////
const { parent } = useParent(props.relationKey)
//通过parent调用父组件通过linkChildren提供数据和方法

//将relationKey 通过 props 传递给子组件
const relationKey = Symbol('test_aframe-relation-Symbol')
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
//透传nav
provide('navParams', navDef)

onActivated(() => {})
onDeactivated(() => {})
onBeforeUnmount(() => {
  let sceneEl = document.querySelector('a-scene')
  sceneEl.removeBehavior(fakeCom)
})
let skyMgr = new SkyMgr()
let octreeMgr = null
nextTick(() => {
  let sceneEl = document.querySelector('a-scene')
  let scene = sceneEl?.object3D
  let skyEl = document.querySelector('a-sky')
  let sky = skyEl?.object3D
  if (sky) {
    // skyEl.setAttribute('color','#ff0000')
    // skyMgr.changeSky(sky)
  }
  cameraEl = document.querySelector('a-camera')
  controls = new PersonCameraControl(
    { THREE: window.AFRAME.THREE, camera: cameraEl?.object3D },
    sceneEl?.renderer.domElement
  )
  controls.type = 'first'

  //注：  addBehavior应该是aframe的组件，这里只是偷懒
  sceneEl.addBehavior(fakeCom)
  // let fileLoader = document.querySelector('a-assets').fileLoader
  // fileLoader.manager.addHandler('load', (data) => {
  //   console.log('-------', '00000099999')
  // })
  setControls(sceneEl, cameraEl)
  aplayerEl = document.querySelector('#a-player')
  aplayerEl.addEventListener('model-loaded', () => {
    let obj = aplayerEl.object3DMap.mesh
    if (obj) {
      let tt = obj //.children[0]
      PlayerMake.getAFPlayer(
        {
          THREE: AFRAME.THREE,
          getCollisionModel: getCollisionModel,
          getSize: getSize,
          track: track
        },
        CapSule,
        tt,
        { height: 1.7, width: 1.3, position: new AFRAME.THREE.Vector3(0, -1.78, 0) },
        (val) => {
          if (val) {
            aplayerEl.collider = val
            controls.phycisMgr?.setPlayer(aplayerEl)
            controls.setPlayer(aplayerEl)
            controls.setEnable(aplayerEl != null)
          }
        }
      )
    }
  })
  throttledFunction = AFRAME.utils.throttle(animate, 0.005, null)
})
let aplayerEl = null
let CapSule = null
let throttledFunction
const getVec3 = function () {
  return new AFRAME.THREE.Vector3()
}
const getBox3 = function () {
  return new AFRAME.THREE.Box3()
}
let box3ForSize
let v3_ForSize
const getSize = function (target) {
  if (!box3ForSize) {
    box3ForSize = getBox3()
  }
  if (!v3_ForSize) {
    v3_ForSize = getVec3()
  }
  v3_ForSize.set(0, 0, 0)
  box3ForSize.setFromObject(target)
  box3ForSize.getSize(v3_ForSize)
  return v3_ForSize.clone()
}
let playerOnFloor = null
let cameraEl
const animate = function () {
  if (controls?.phycisMgr) {
    let dtime = 0.005
    controls.update(dtime)
  }
}
const tick = async function (t, dt) {
  // console.log('----', t + '|' + dt)
  if (controls) throttledFunction()
}
let fakeCom = {
  tick: tick,
  el: {
    isPlaying: true
  }
}

const aframeLoadRef = ref('aframeLoadRef')
const track = function (val) {
  if (aframeLoadRef.value) {
    let dd = aframeLoadRef.value.tracker.track(val)
    return markRaw(dd)
  }
  return null
}
let collision = {}
let collisionModel = {}
const getCollisionMgr = async function (name) {
  if (!collision[name]) {
    let res = await LoadHelper.getCollisionMgr(name)
    if (res) collision[name] = res
  }
  return collision[name]
}
const getCollisionModel = async function (name) {
  if (!collisionModel[name]) {
    let res = await LoadHelper.getCollisionModel(name)
    if (res) collisionModel[name] = res
  }
  return collisionModel[name]
}
const setControls = async function (sceneEl, cameraEl) {
  let com = { THREE: window.AFRAME.THREE, scene: sceneEl?.object3D, camera: cameraEl?.object3D }
  com.track = track
  com.getCollisionMgr = getCollisionMgr
  if (octreeMgr != null) {
    octreeMgr.clear()
    octreeMgr.setCom(com)
  } else {
    octreeMgr = new OctreeMgr(com)
  }
  await octreeMgr.useMgr()
  controls.setPhycisMgr(octreeMgr)
  controls.phycisMgr.setIsAframe(sceneEl)
  let world = document.querySelector('#a-world')
  world.addEventListener('model-loaded', () => {
    if (world.object3DMap) {
      for (let vv in world.object3DMap) {
        let mesh = world.object3DMap[vv]
        controls.phycisMgr.setWorld(mesh)
      }
    }
  })
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
      <div>我是test_aframe</div>
      <aframe-load ref="aframeLoadRef">
        <template v-slot:body>
          <!--            stats-->
          <a-scene>
            <a-assets>
              <!--这里预加载，下面的src可能不显示  可以用 src="url(/modules/gltf/collision-world.glb)"    -->
              <a-asset-item id="world" src="/modules/gltf/collision-world.glb"></a-asset-item>
              <a-asset-item id="BoomBox" src="/modules/gltf/BoomBox.glb"></a-asset-item>
              <a-asset-item id="world-nav" src="/modules/gltf/nav.obj"></a-asset-item>
              <a-asset-item id="player" src="/modules/gltf/RobotExpressive.glb"></a-asset-item>
              <img
                id="groundTexture"
                src="https://img.gs/bbdkhfbzkk/stretch/https://i.imgur.com/25P1geh.png"
              />
            </a-assets>

            <a-entity light="type: ambient; color: #444"></a-entity>
            <a-entity light="type: directional; color: #AAA" position="-1 2 0"></a-entity>
            <a-camera>
              <a-cursor></a-cursor>
            </a-camera>
            <a-gltf-model id="a-player" src="#player"></a-gltf-model>
            <a-gltf-model src="#BoomBox" scale="15 15 15">
              <!--              <a-sound-->
              <!--                src="src: url(/audio/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3)"-->
              <!--                autoplay="true"-->
              <!--                position="0 0 0"-->
              <!--              ></a-sound>-->
            </a-gltf-model>
            <a-gltf-model id="a-world" src="#world"></a-gltf-model>
          </a-scene>
        </template>
      </aframe-load>
    </template>
  </page-root>
</template>

<style scoped></style>
<style lang="scss" scoped></style>
