<script setup name="test_threejs_load">
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
  onBeforeUnmount
} from 'vue'
//页面根节点
import PageRoot, { PageNavDef } from '@/components/page/index'
import { useChildren, useParent } from '@vant/use'
import loaderMap from '@/components/threejs/load/loader-map'
import threejsLoad from '@/components/threejs/threejs-load.vue'
import { CannonMgr } from '@/components/threejs/load/controls/phycis/cannon-mgr'
import { OctreeMgr } from '@/components/threejs/load/controls/phycis/octree-mgr'

import JoyStick from '@/components/threejs/joy-stick/joy-stick.vue'
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js'
import PlayerMake from '@/components/threejs/tests/player-make'
import ModuleLoad from '@/components/threejs/tests/module-load'
import AudioMake from '@/components/threejs/tests/audio-make'
import WorldLoad from '@/components/threejs/tests/world-load'
import SpotLight from '@/components/threejs/tests/spot-light'
const props = defineProps(['relationKey'])

////////////////////////////////////
const { parent } = useParent(props.relationKey)
//通过parent调用父组件通过linkChildren提供数据和方法

//将relationKey 通过 props 传递给子组件
const relationKey = Symbol('test_threejs_load-relation-Symbol')
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
    rightText: computed(() => {
      return '切换模型'
    }),
    clickLeft: function () {
      return true
    },
    clickRight: function () {
      showActionSheet.value = !showActionSheet.value
      return false
    }
  })
})
//透传nav
provide('navParams', navDef)

onActivated(() => {})
onDeactivated(() => {
  releaseAll()
})
onBeforeUnmount(() => {
  releaseAll()
})
let releaseAllFlag = null
const releaseAll = function () {
    releaseAllFlag=true
  if (modelAnimate) {
    if (modelAnimate.dispose != undefined) {
      modelAnimate.dispose()
    }
    if (modelAnimate.clear != undefined) {
      modelAnimate.clear()
    }
  }
  mmdAniHelper = null
  if (cameraAudio) {
    cameraAudio.stop()
    // cameraAudio.disconnect()
  }
  cameraAudio = null

  modelAnimate = null
  actionsTotal = null
  face = null
  previousAction = null
  activeAction = null
  api = null
  if (lightAnimateId) {
    clearTimeout(lightAnimateId)
  }
  lightAnimateId = null
  // groundPlane = null
  // cameraTarget = null
}
const modules = ref([])
nextTick(() => {
  modules.value.push({ name: 'glb', path: '/modules/gltf/RobotExpressive.glb' })
  modules.value.push({ name: 'fbx', path: '/modules/fbx/Samba Dancing.fbx' })
  modules.value.push({
    name: 'stl',
    paths: ['/modules/stl/ascii/slotted_disk.stl', '/modules/stl/binary/pr2_head_pan.stl']
  })
  modules.value.push({
    name: 'ply',
    paths: ['/modules/ply/ascii/dolphins.ply', '/modules/ply/binary/Lucy100k.ply']
  })
  modules.value.push({ name: 'dae', path: '/modules/collada/elf/elf.dae' })
  modules.value.push({ name: 'obj', path: '/modules/obj/male02/male02.obj' })
})
const onSelected = (action) => {
  showActionSheet.value = false
  if (action.path != module.data.file) {
    let mode=  loaderMap[action.name]
    let dd = {
      file: action.path || action.paths,
      mode: mode||action.name,
      name: action.name
    }
    module.data = dd
  }
}
const module = reactive({
  data: {
    file: '/modules/gltf/RobotExpressive.glb',
    mode: 'gltf',
    name: 'glb',
    clear: false
  }
})
const threejsLoadRef = ref('threejsLoadRef')
const showActionSheet = ref(false)

const setScene = function (scene, THREE) {
  scene.background = new THREE.Color(0x72645b)
}

let cameraAudio = null
let mmdAniHelper = null
//测试将mmd 转成postion模式
let positionMmdMusicMode = true
const playAudio = function () {
  if (threejsLoadRef.value && !cameraAudio) {
    let com = threejsLoadRef.value
    if (!cameraAudio) {
      cameraAudio = AudioMake.mmdAudio(com, positionMmdMusicMode, (data) => {
        makePlayer(com, data.mesh, data.params, (player) => {
          com.lodLevel(player, 2)
          player.name = 'mmd-player'
          com.scene.add(player)

          mmdAniHelper = data.helper
          controls.phycisMgr.addNpc(player)
          controls.phycisMgr.addObstacles(player)
        })
      })
    }
    if (cameraAudio) {
      com.camera.add(cameraAudio.listener)
    }
  }
}
let positionAudio = null
const positionMusicRef = ref('positionMusicRef')
const playPositionAudio = function () {
  if (threejsLoadRef.value && !positionAudio) {
    let audioEl = positionMusicRef.value
    let com = threejsLoadRef.value
    positionAudio = AudioMake.positionAudio(com, audioEl, (boomBox) => {
      com.lodLevel(boomBox, 5)
      com.scene.add(boomBox)
      audioEl.play()
    })
  }
}
const setCamera = function (camera, THREE) {}
const setLight = function (light, THREE) {
  let com = threejsLoadRef.value
  // let mode = module.data.mode
  // if (mode == 'stl' || mode == 'ply') {
  //   //   light.hemLight = com.addHemisphereLight(0x8d7c7c, 0x494966)
  //   light.hemLight = com.addHemisphereLight(0xcccccc, 0.4)
  //   let dirLight = []
  //   dirLight.push(com.addDirectionalLight(0xffffff, 1.35, true))
  //   dirLight.push(
  //     com.addDirectionalLight(0xffd500, 1, true, (light) => {
  //       light.position.set(0.5, 1, -1)
  //     })
  //   )
  // } else if (mode == 'collada' || mode == 'obj') {
  //   light.hemLight = com.addHemisphereLight(0xcccccc, 0.4)
  //   light.dirLight = com.addDirectionalLight(0xffffff, 0.8, false, (light) => {
  //     if (mode == 'collada') light.position.set(1, 5, 0) //.normalize()
  //   })
  // }
  //   light.dirLight=null
  //   light.hemLight = com.addHemisphereLight(0xffffff, 0x8d8d8d, 0.05)
}
// let groundPlane = null
const setGround = function (ground, THREE) {
  ground.grid = null
  ground.ground = null
  // groundPlane = ground.ground
}
let controls = null
const setPlayer = function (player) {
  if (controls && (controls.type == 'first' || controls.type == 'third')) {
    controls.setPlayer(player)
    controls.setEnable(player != null)
  }
}
const setRender = async function (render, THREE) {
  let controlsType = 'third' //first third or null
  let com = threejsLoadRef.value
  let ctrls = com.createOrbitControls(render.domElement, controlsType)
  try {
    // await com.skyBox.createSky(com.scene)
    // com.skyBox.changeSky()
    com.skyBox.test()
  } catch (e) {
    console.error(e)
  }
  controls = ctrls
  return render
}
let spotLight = null
const setAnimate = async function (delta, camera, scene, THREE) {
  //阻塞
  if (mmdAniHelper && mmdAudioFlag) {
    mmdAniHelper.update(delta)
    if (!spotLight) {
      let com = threejsLoadRef.value
      let obj = scene.getObjectByName('mmd-player')
      spotLight = SpotLight.addSpotLight(com, obj.position)
      spotLight.light.target = obj
      scene.add(spotLight.light)
      scene.add(spotLight.helper)
      lightAnimate()
    }
    if (lightAnimateId){
        SpotLight.tweenUpdate()
    }
  }
}
let lightAnimateId = null
const lightAnimate = function () {
  if (spotLight&&!releaseAllFlag) {
    SpotLight.tweenLight(spotLight.light, spotLight.helper)
    if (lightAnimateId) {
      clearTimeout(lightAnimateId)
    }
    lightAnimateId = setTimeout(lightAnimate, 5000)
  }
}
let modelAnimate = null
const setLoadModule2 = function (scene, THREE) {
  return setLoadModule(scene, THREE)
  // return false
}
let Capsule = null

const makePlayer = async function (com, obj, params, callback) {
  if (!Capsule) {
    let res = await com.getCollisionModel('capsule')
    Capsule = res.Capsule
  }
  PlayerMake.getPlayer(com, Capsule, obj, params, (player) => {
    callback(player)
    if (params && params.noPlayer) {
      return
    }
    controls.phycisMgr?.setPlayer(player)
  })
}
let octreeMgr = null
let cannonMgr = null
const initPhycisMgr = async function (com, type) {
  if (type == 0) {
    if (cannonMgr != null) {
      cannonMgr.clear()
      cannonMgr.setCom(com)
    } else {
      cannonMgr = new CannonMgr(com)
    }
    await cannonMgr.useMgr()
    controls.setPhycisMgr(cannonMgr)
  } else {
    if (octreeMgr != null) {
      octreeMgr.clear()
      octreeMgr.setCom(com)
    } else {
      octreeMgr = new OctreeMgr(com)
    }
    await octreeMgr.useMgr()
    controls.setPhycisMgr(octreeMgr)
  }
}

const onProgress = function (xhr) {
  if (xhr.lengthComputable) {
    const percentComplete = (xhr.loaded / xhr.total) * 100
    console.log(Math.round(percentComplete, 2) + '% downloaded')
  }
}
const loadModule = async (file, materials, resolve, resolveall) => {
  let com = threejsLoadRef.value
  return await ModuleLoad.loadModule(com, file, materials, resolve, resolveall)
}
const setLoadModule = async function (scene, THREE) {
  let com = threejsLoadRef.value
  if (com) {
    let mode = module.data.mode
    let file = module.data.file
    if (!controls.phycisMgr) await initPhycisMgr(com, 1)
    let world_file = '/modules/gltf/collision-world.glb',
      nav_file = '/modules/gltf/nav.obj'
    // let world_file = '/modules/gltf/level.glb',
    //   nav_file = '/modules/gltf/level-nav.glb'
    if (!scene.getObjectByName('world')) {
      await WorldLoad.loadWorld(com, world_file, nav_file, controls.phycisMgr, controls.pathFind)
    }
    if (mode == 'obj') {
      loadModule('/modules/obj/male02/male02.mtl', null, (materials, item) => {
        if (!materials) {
          console.log('loadModule', item + '--get failed')
          return
        }
        materials.preload()
        loadModule(file, materials, (obj, item) => {
          if (!obj) {
            console.log('loadModule', item + '--get failed')
            return
          }
          let params = { height: 1, position: com.getVec3().set(1, 0.49, 0) }
          if (nav_file == '/modules/gltf/nav.obj') {
            params.position.y = -1.523
            //
            params.height = 1.7
            params.position.y = -1.366
          }
          obj.myname = 'mtl-obj'
          let wrap = com.track(obj)
          makePlayer(com, wrap, params, (player) => {
            scene.add(player)
            setPlayer(player)
            //mini-map 跟随
            setMiniMap(com, player)
          })
        })
      })
      return true
    } else {
      loadModule(file, null, null, (all) => {
        if (all && all.length > 0) {
          let flag = false
          let params = {
            height: 1, //模型 展示的世界高度
            width: 0, //模型宽度，用来计算 capsule的半径，因为有的模型是展开手臂的，自动获取的宽度就会有问题
            position: com.getVec3().set(1, 0, 0), //坐标 偏移量 跟模型高和原点位置有关
            tag: { type: '3d', useSprite: true, name: '我是player' } //
          }
          //模型差异，偏移量不同
          if (nav_file == '/modules/gltf/nav.obj') {
            if (mode == 'gltf') {
              params.position.y = -1.378
              params.height = 1.7
              params.position.y += 0.25
            } else if (mode == 'fbx') {
              params.position.y = -1.484
              params.height = 1.7
            } else if (mode == 'stl') {
              params.position.y = -1.094
              params.height = 1.7
              params.position.y += 0.44
            } else if (mode == 'ply') {
              params.position.y = -1.454
              params.height = 1.7
              params.position.y += 0.21
            } else if (mode == 'collada') {
              params.position.y = -1.4
              params.height = 1.7
              params.position.y += 0.245
            }
          } else {
            if (mode == 'gltf') {
              params.position.y = 0.65
            } else if (mode == 'fbx') {
              params.position.y = 0.52
            } else if (mode == 'stl') {
              params.position.y = 0.92
            } else if (mode == 'ply') {
              params.position.y = 0.55
            } else if (mode == 'collada') {
              params.position.y = 0.6
            }
          }
          let animations = null
          let animations_target = null
          let wrap = null
          if (mode == 'gltf' || mode == 'collada' || mode == 'fbx') {
            let obj = all[0].obj
            animations = obj.animations
            animations_target = obj
            wrap = com.track(obj.scene ? obj.scene : obj)
            wrap.myname = mode + '-scene'
            wrap.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                if (child.material.map && child.material.map.anisotropy != undefined) {
                  child.material.map.anisotropy = 4
                }
              }
            })
            if (mode == 'gltf') {
              //模型比较特殊，肢体部位放大了100倍，外部包围盒scale是1导致，获取尺寸不正确
              wrap.scale.set(0.01, 0.01, 0.01)
              params.unNormal = true
            }
            flag = true
          } else if (mode == 'stl' || mode == 'ply') {
            wrap = com.track(new com.THREE.Mesh())
            params.width = 0.5
            all.forEach((it) => {
              let mesh = null
              if (mode == 'stl') {
                mesh = makeStl(com, THREE, it.file, it.obj)
              } else if (mode == 'ply') {
                mesh = makePly(com, THREE, it.file, it.obj)
              }
              if (mesh) {
                flag = true
                wrap.add(mesh)
              }
            })
          }
          if (animations) {
            if (mode == 'fbx') {
              params.width = 0.5 //模型手臂是展开的
              const action = com.setMixer(animations_target, animations[0])
              if (action) {
                action.play()
              }
            } else {
              createGUI(com, THREE, wrap, animations)
            }
          }
          if (flag) {
            makePlayer(com, wrap, params, (player) => {
              if (mode == 'collada') {
                //模型特殊，轴不标准
                player.axisy_z = true
              }
              scene.add(player)
              setPlayer(player)
              setMiniMap(com, player)
            })
          }
        }
        all.splice(0, all.length)
      })
      return true
    }
  }
  return false
}
const setMiniMap = function (com, player) {
  com?.setMiniMap(player)
  let world = com?.scene?.getObjectByName('world')
  if (world) {
    let size = com.getSize(world)
    let max = Math.max(size.x, size.z)
    com.miniMap?.change(max, 0)
  }
}
const makePly = function (com, THREE, item, obj) {
  obj.computeVertexNormals()
  const material = com.track(new THREE.MeshStandardMaterial({ color: 0x009cff, flatShading: true }))
  material.myname = 'ply-material'
  const mesh = new THREE.Mesh(obj, material)
  mesh.myname = 'ply-mesh'
  let size = com.getSize(mesh)
  let factor = 0
  if (item.indexOf('dolphins.ply') > 0) {
    factor = 0.001 * 3
    mesh.position.z = 0.3
    mesh.scale.multiplyScalar(factor)
    mesh.position.y = (size.y * factor) / 2 + 0.28
    mesh.position.z = -0.5
    mesh.position.x = -0.1
    mesh.rotation.x = Math.PI / 2
    mesh.rotation.y = Math.PI
  } else if (item.indexOf('Lucy100k.ply') > 0) {
    factor = 0.0006 * 3
    mesh.scale.multiplyScalar(factor)
    mesh.position.y = (size.y * factor) / 2
    mesh.rotation.y = Math.PI

    mesh.position.z += 0.4
  }
  mesh.castShadow = true
  mesh.receiveShadow = true

  return com.track(mesh)
}
const makeStl = function (com, THREE, item, obj) {
  let mesh = null
  if (item.indexOf('slotted_disk.stl') > 0) {
    let material = com.track(
      new THREE.MeshPhongMaterial({
        color: 0xff9c7c,
        specular: 0x494949,
        shininess: 200
      })
    )
    material.myname = 'stl-material'
    let fact = 1
    mesh = new THREE.Mesh(obj, material)
    mesh.myname = 'stl-mesh'
    mesh.position.set(0, 0.5 * fact, 0)
    mesh.rotation.set(0, -Math.PI / 2, 0)
    mesh.scale.set(fact, fact, fact)

    mesh.castShadow = true
    mesh.receiveShadow = true
  } else if (item.indexOf('pr2_head_pan.stl') > 0) {
    let fact = 1
    let material = com.track(
      new THREE.MeshPhongMaterial({
        color: 0xd5d5d5,
        specular: 0x494949,
        shininess: 200
      })
    )
    material.myname = 'stl-material'
    mesh = new THREE.Mesh(obj, material)
    mesh.myname = 'stl-mesh'
    mesh.position.set(0, 0.065 * fact, -0.6)
    mesh.rotation.set(-Math.PI / 2, 0, 0)
    mesh.scale.set(fact, fact, fact)

    mesh.castShadow = true
    mesh.receiveShadow = true
  }
  if (mesh) {
    mesh.scale.multiplyScalar(0.5)
    com.track(mesh)
  }
  return mesh
}
let actionsTotal = null
let api = { state: 'Walking' }
let face = null
let previousAction = null
let activeAction = null

let mmdAudioFlag = true
let isMMdAudioPaused = false
let isPositionAudioPaused = false
const createGUI = async function (com, THREE, model, animations) {
  const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing']
  const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp']
  await com.getGui()
  if (com.gui) {
    return
  }
  com.gui = com.track(new com.GUI())
  let title = com.gui.domElement.getElementsByClassName('title')
  title[0].removeAttribute('tabindex') //影响space按键
  com.gui.domElement.style.top = '88px' //可以调整位置
  com.gui.domElement.style.left = '0px' //可以调整位置
  com.gui.add({ showStats: true }, 'showStats').onChange(function (value) {
    showStats.value = value
  })
  com.gui.add({ showMinMap: true }, 'showMinMap').onChange(function (value) {
    com.miniMap._miniMapDomEl.style.display = value ? '' : 'none'
  })
  com.gui.add({ showJoyStick: false }, 'showJoyStick').onChange(function (value) {
    showJoyStick.value = value
  })
  com.gui.add({ debug: false }, 'debug').onChange(function (value) {
    if (octreeMgr && octreeMgr.octreeHelper) octreeMgr.octreeHelper.visible = value
  })

  com.gui.add({ positionAudio: false }, 'positionAudio').onChange(function (value) {
    if (positionMusicRef.value) {
      if (value) {
        playPositionAudio()
        if (isPositionAudioPaused) {
          positionMusicRef.value.play()
        }
      } else {
        isPositionAudioPaused = true
        positionMusicRef.value.pause()
      }
    }
  })
  com.gui.add({ mmdAudio: false }, 'mmdAudio').onChange(function (value) {
    mmdAudioFlag = value
    if (value) {
      playAudio()
      if (isMMdAudioPaused) cameraAudio.play()
    } else {
      isMMdAudioPaused = true
      cameraAudio.pause()
    }
  })
  let mixer = com.track(new THREE.AnimationMixer(model))
  com.mixer = mixer
  let actions = {}
  actionsTotal = actions
  if (animations.length > 0) {
    for (let i = 0; i < animations.length; i++) {
      const clip = animations[i]
      const action = mixer.clipAction(clip)
      actions[clip.name] = action

      if (emotes.indexOf(clip.name) >= 0 || states.indexOf(clip.name) >= 4) {
        action.clampWhenFinished = true
        action.loop = THREE.LoopOnce
      }
    }

    // states
    const statesFolder = com.gui.addFolder('States')

    const clipCtrl = statesFolder.add(api, 'state').options(states)

    clipCtrl.onChange(function () {
      fadeToAction(api.state, 0.5)
    })
    //默认打开 折叠面板
    statesFolder.open() //子面板打开
    //   statesFolder.close()
    // emotes
    const emoteFolder = com.gui.addFolder('Emotes')
    function createEmoteCallback(name) {
      api[name] = function () {
        fadeToAction(name, 0.2)

        mixer.addEventListener('finished', restoreState)
      }

      emoteFolder.add(api, name)
    }

    for (let i = 0; i < emotes.length; i++) {
      createEmoteCallback(emotes[i])
    }

    emoteFolder.open() //子面板打开
    //   emoteFolder.close()

    // expressions
    face = model.getObjectByName('Head_4')
    const expressionFolder = com.gui.addFolder('Expressions')
    if (face) {
      const expressions = Object.keys(face.morphTargetDictionary)
      for (let i = 0; i < expressions.length; i++) {
        expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[i])
      }
    }
    activeAction = actions['Walking']
    if (activeAction) activeAction.play()
    expressionFolder.open() //子面板打开

    com.gui.close() //主面板关闭
  }
}
function restoreState() {
  threejsLoadRef.value.mixer.removeEventListener('finished', restoreState)

  fadeToAction(api.state, 0.2)
}
const fadeToAction = function (name, duration) {
  previousAction = activeAction
  activeAction = actionsTotal[name]
  if (previousAction !== activeAction) {
    previousAction.fadeOut(duration)
  }

  activeAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play()
}
const jump = function () {
  if (controls) {
    controls.joyStickJump(() => {
      //jump 动画本身 有高度变化，跟碰撞不一致，以后再试
      // fadeToAction('Jump', 0.2)
      // threejsLoadRef.value.mixer.addEventListener('finished', restoreState)
    })
  }
}
const shoot = function (val) {
  let mixer = threejsLoadRef.value.mixer
  if (val == '0') {
    // fadeToAction('Punch', 0.2)
    controls.shoot()
  } else if (val == '1') {
    fadeToAction('Running', 0.2)
  } else if (val == '2') {
    fadeToAction('Walking', 0.2)
  } else if (val == '3') {
    fadeToAction('WalkJump', 0.2)
  } else if (val == '5') {
    controls.changeType()
  }
  //   fadeToAction('Idle',0.2)
  if (mixer) mixer.addEventListener('finished', restoreState)
}

let lastKey = null
const getRad = function (val) {
  let rad = val.rad
  let nKey = null
  let keyCode = null
  if (rad < Math.PI / 4 && rad >= -Math.PI / 4) {
    //right
    nKey = 'KeyD'
    keyCode = 68
  } else if (rad >= Math.PI / 4 && rad <= (Math.PI * 3) / 4) {
    //top
    nKey = 'KeyW'
    keyCode = 87
  } else if (rad > (Math.PI * 3) / 4 || rad <= -(Math.PI * 3) / 4) {
    //left
    nKey = 'KeyA'
    keyCode = 65
  } else if (rad > -(Math.PI * 3) / 4 && rad < -Math.PI / 4) {
    //bottom
    nKey = 'KeyS'
    keyCode = 83
  }
  if (controls) {
    if (controls.type == 'third') {
      if (rad != undefined) {
        if (Math.abs(rad) > 0.01) {
          controls.joyStickChange(rad)
        }
      }
      if (val.finished) {
        controls.joyStickChange(-1000)
      }
    } else {
      if (!lastKey || lastKey.nKey != nKey) {
        if (lastKey) {
          controls.onKeyUp({ code: lastKey.nKey, keyCode: lastKey.keyCode })
        }
      }
      if (val.finished) {
        lastKey = null
        controls.onKeyUp({ code: nKey, keyCode: keyCode })
      } else {
        controls.onKeyDown({ code: nKey, keyCode: keyCode })
        lastKey = { nKey: nKey, keyCode: keyCode }
      }
    }
  }
}
const showJoyStick = ref(false)
const showStats = ref(true)
</script>
<template>
  <page-root>
    <template v-slot:left>
      <van-icon name="manager" />
    </template>
    <!--    <template v-slot:title><div>我的title</div></template>-->
    <!--    <template v-slot:right><div>我的right</div></template>-->
    <template v-slot:body>
      <threejs-load
        ref="threejsLoadRef"
        :module="module.data"
        :setScene="setScene"
        :setCamera="setCamera"
        :setLight="setLight"
        :setGround="setGround"
        :setRender="setRender"
        :setAnimate="setAnimate"
        :setLoadModule="setLoadModule2"
        :show-stats="showStats"
        :showControls="false"
        :show-tag="true"
        :use-lod="true"
      />

      <van-action-sheet
        v-model:show="showActionSheet"
        :actions="modules"
        :cancel-text="'取消'"
        description="模型切换"
        @select="onSelected"
      />
      <audio ref="positionMusicRef" loop id="music" preload="auto" style="display: none">
        <!--          ogg ios浏览器不能播，两个自动 兼容-->
        <source src="/audio/sounds/376737_Skullbeatz___Bad_Cat_Maste.ogg" type="audio/ogg" />
        <source src="/audio/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3" type="audio/mpeg" />
      </audio>
      <joy-stick v-if="showJoyStick" :get-rad="getRad" :jump="jump" :shoot="shoot"></joy-stick>
    </template>
  </page-root>
</template>

<style scoped></style>
<style lang="scss" scoped></style>