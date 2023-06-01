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

import { toRaw } from '@vue/reactivity'
import JoyStick from '@/components/threejs/joy-stick/joy-stick.vue'
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js'
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
const releaseAll = function () {
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
    let dd = {
      file: action.path || action.paths,
      mode: loaderMap[action.name],
      name: action.name
    }
    module.data = dd
  }
}
const module = reactive({
  data: {
    file: '/modules/gltf/RobotExpressive.glb',
    mode: 'gltf',
    name: 'glb'
  }
})
const threejsLoadRef = ref('threejsLoadRef')
const showActionSheet = ref(false)
const setScene = function (scene, THREE) {
  scene.background = new THREE.Color(0x72645b)
  // if (module.data.mode == 'fbx') {
  //   scene.fog = new THREE.Fog(0xe0e0e0, 200, 1000)
  // } else {
  //   scene.fog = new THREE.Fog(0xe0e0e0, 10, 50)
  // }
}
// let cameraTarget = null
let cameraAudio = null
const playAudio = function () {
  if (threejsLoadRef.value && !cameraAudio) {
    let com = threejsLoadRef.value
    if (!cameraAudio) {
      cameraAudio = com.createAudio(positionMmdMusicMode)
      // cameraAudio.setVolume(0.1)
      //   cameraAudio.setVolume(0.1)
    }
    if (cameraAudio) {
      com.camera.add(cameraAudio.listener)
      testmmdAudio()
    }
  }
}
let mmdAniHelper = null
//测试将mmd 转成postion模式
let positionMmdMusicMode=true
const testmmdAudio = async function () {
  let com = threejsLoadRef.value
  if (com) {
    let url = '/audio/mmd/miku/miku_v2.pmd'
    let mLoader = await getLoader(url, null)
    if (mLoader) {
      let helper = await com.getLoader('mmd-ani-helper')
      let mesh = await doLoad(mLoader, url).catch((e) => {})
      com.track(mesh)
      if (mesh) {
        //下面部分需要ammo
        let resAmmo = await com.getCollisionMgr('ammo')
        let Ammo = null
        if (resAmmo) {
          Ammo = new resAmmo.default()
        }
        if (Ammo != null) {
          Ammo().then(function (AmmoLib) {
            if (AmmoLib) {
              window.Ammo = AmmoLib
              mLoader.loadAnimation(
                ['/audio/mmd/vmds/wavefile_v2.vmd'],
                mesh,
                function (animation) {
                  com.track(animation)
                  helper.add(mesh, {
                    animation: animation,
                    physics: true
                  })
                  const addToControl = () => {
                    //缩放
                    mesh.scale.set(0.15, 0.15, 0.15)
                    //调整初始位置
                    let pos = com.getVec3()
                    pos.x = 1.5
                    makePlayer(com, mesh, { noPlayer: true, position: pos }, (player) => {
                      com.scene.add(player)
                      mmdAniHelper = helper
                      controls.phycisMgr.addNpc(player)
                      controls.phycisMgr.addObstacles(player)
                    })
                  }
                  if (positionMmdMusicMode) {
                    if (cameraAudio) {
                      com.loadAudioFile('/audio/mmd/audios/wavefile_short.mp3', (buffer) => {
                        cameraAudio.setBuffer(buffer)
                        cameraAudio.setRefDistance(1)
                        cameraAudio.setDirectionalCone(180, 230, 0.1)
                        const helper2 = com.track(new PositionalAudioHelper(cameraAudio, 0.1))
                        cameraAudio.add(helper2)
                        helper.add(cameraAudio, { delayTime: (160 * 1) / 30 })
                        addToControl()
                      })
                    }
                  } else {
                    com.loadAudioFile('/audio/mmd/audios/wavefile_short.mp3', (buffer) => {
                      cameraAudio.setBuffer(buffer)

                      helper.add(cameraAudio, { delayTime: (160 * 1) / 30 })
                      addToControl()
                    })
                  }
                },
                onProgress
              )
            }
          })
        }
      }
    }
  }
}
let positionAudio = null
const positionMusicRef = ref('positionMusicRef')
const playPositinAudio = function () {
  if (threejsLoadRef.value && !positionAudio) {
    let com = threejsLoadRef.value
    if (!positionAudio) {
      positionAudio = com.createAudio(true)
    }
    if (positionAudio && positionMusicRef.value) {
      positionAudio.setMediaElementSource(positionMusicRef.value)
      positionAudio.setRefDistance(1)
      positionAudio.setDirectionalCone(180, 230, 0.1)
      let com = threejsLoadRef.value
      const helper = com.track(new PositionalAudioHelper(positionAudio, 0.1))
      positionAudio.add(helper)
      loadModule('modules/gltf/BoomBox.glb', null, (obj, item) => {
        com.track(obj.scene)
        const boomBox = obj.scene
        boomBox.position.set(0, -1.5, 0)
        boomBox.scale.set(20, 20, 20)
        boomBox.traverse(function (object) {
          if (object.isMesh) {
            // const reflectionCube = new com.THREE.CubeTextureLoader()
            //   .setPath('/textures/cube/SwedishRoyalCastle/')
            //   .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
            // com.track(reflectionCube)
            // object.material.envMap = reflectionCube
            object.geometry.rotateY(-Math.PI)
            object.castShadow = true
          }
        })
        com.scene.add(boomBox)
      })
      if (positionAudio) {
        controls.player.add(positionAudio)
      }
      //必须调用
      positionMusicRef.value.play()
    }
  }
}
const setCamera = function (camera, THREE) {
  //跟模型关系很大
  let mode = module.data.mode
  if (mode == 'fbx') {
    camera.position.set(100, 200, 300)
  }
  //需要设置lookAt
  // 1、受模型有影响 2、受OrbitControls影响
  if (mode == 'fbx') {
    camera.lookAt(new THREE.Vector3(0, 100, 0))
  }
}
const setLight = function (light, THREE) {
  let com = threejsLoadRef.value
  let mode = module.data.mode
  if (mode == 'stl' || mode == 'ply') {
    //   light.hemLight = com.addHemisphereLight(0x8d7c7c, 0x494966)
    light.hemLight = com.addHemisphereLight(0xcccccc, 0.4)
    let dirLight = []
    dirLight.push(com.addDirectionalLight(0xffffff, 1.35, true))
    dirLight.push(
      com.addDirectionalLight(0xffd500, 1, true, (light) => {
        light.position.set(0.5, 1, -1)
      })
    )
  } else if (mode == 'collada' || mode == 'obj') {
    light.hemLight = com.addHemisphereLight(0xcccccc, 0.4)
    light.dirLight = com.addDirectionalLight(0xffffff, 0.8, false, (light) => {
      if (mode == 'collada') light.position.set(1, 5, 0) //.normalize()
    })
  }
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
const setRender = function (render, THREE) {
  let controlsType = 'third' //first third or null
  let ctrls = threejsLoadRef.value.createOrbitControls(render.domElement, controlsType)
  controls = ctrls
  if (ctrls) {
    if (!ctrls.type) {
      if (module.data.mode == 'fbx') {
        ctrls.target.set(0, 50, 0)
      } else if (module.data.mode == 'stl') {
        ctrls.target.set(0, 0, 0)
      } else {
        ctrls.target.set(0, 0.5, 0)
      }
    }
  }
}

const setAnimate = function (delta, camera, scene, THREE) {
  if (mmdAniHelper && mmdAudioFlag) mmdAniHelper.update(delta)
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
  if (Capsule !== undefined) {
    let objSize = com.getSize(obj)
    //刚好能包围模型 x/z 宽度的 球半径
    let radius = 0.66
    //gltf模型显示高度是 2.22
    let playerH = 2.22 //
    let flag = false
    if (objSize.y < 4 && objSize.y > radius * 2) {
      //假设这个范围的size是正确的
      let mx = Math.max(objSize.x, objSize.z)
      flag = true
      radius = mx / 2
      playerH = objSize.y
    } else if (objSize.y < radius * 2) {
      let mx = Math.max(objSize.x, objSize.z)
      radius = mx / 2
      flag = true
      playerH = objSize.y
    }
    //Capsule高度 0.66*2+0.9
    let yy = playerH - 2 * radius
    //Capsul是上下两个半球+中间一个圆柱
    //这里半球球心的y轴 分别为0.66 和 0.66+yy
    //圆柱的底部y轴是 0.66 顶部是 0.66+yy
    //因此实际需要按模型调整，
    let start = new com.THREE.Vector3(0, 0, 0)
    let end = new com.THREE.Vector3(0, yy, 0)
    if (params && params.position) {
      start.copy(params.position)
      end.copy(params.position)
      end.y = params.position.y + yy
    }
    let collider = com.track(new Capsule(start, end, radius))
    collider.myname = 'player-collider'
    let player = null
    ///////////////////////////////////////////////////////////////////////////////
    // 带网格 有的模型获取不准确 调整位置 观察用
    //cannon不需要额外的 线框
    //octree,如果需要设置成 碰撞体collider or obstacle，需要用这个
    const geometry = com.track(new com.THREE.CapsuleGeometry(radius, yy, 4, 8))
    geometry.myname = 'player-geometry'
    const material = com.track(
      new com.THREE.MeshBasicMaterial({
        color: 0xff0000,
        opacity: 0, //隐藏网格线
        alphaTest: 1, //隐藏网格线
        wireframe: true
      })
    )
    material.myname = 'player-material'
    player = com.track(new com.THREE.Mesh(geometry, material))
    // 不带网格 无法生成octree的 collider or obstacle
    // player = com.track(new com.THREE.Mesh())
    ///////////////////////////////////////////////////////////////////////
    player.myname = 'player'
    // player.position.copy(end.clone().setY(end.y / 2 + radius))
    player.add(obj)
    player.player = obj
    player.collider = collider
    //这里模型 为什么带个 相对的偏移，可能是相对的中心的问题
    //-1.07比 1/2的Capsule（-1.11）高看着更合适，？？？这里具体不太理解
    //大概的可能是因为模型2.22这个值是 估算的 不准确导致的
    if (flag) {
      player.player.position.y = -playerH / 2
    } else {
      player.player.position.y = -1.07 //2.14
    }
    player.centerY = playerH / 2
    if (params && params.position) {
      player.position.copy(params.position)
    }
    callback(player)

    if (params && params.noPlayer) {
      return
    }
    if (octreeMgr != null) {
      octreeMgr.setPlayer(player)
    }
    if (cannonMgr != null) {
      cannonMgr.setPlayer(player)
    }
  }
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

const getLoader = async (file, materials) => {
  let mLoader = null
  let com = threejsLoadRef.value
  if (com) {
    let suffix = file.split('.')[1]
    let loaderMode = loaderMap[suffix]
    if (!loaderMode) {
      loaderMode = suffix
    }
    mLoader = await com.getLoader(loaderMode)
    if (!mLoader) {
      return null
    }
    if (materials) {
      if (mLoader.setMaterials != undefined) {
        mLoader.setMaterials(materials)
      }
    }
  }
  return mLoader
}
const doLoad = async function (mLoader, file) {
  return new Promise(function (resolve) {
    mLoader.load(
      file,
      (obj) => {
        resolve(obj)
      },
      onProgress
    )
  })
}
const loadModule = async (file, materials, resolve, resolveall) => {
  let allItems = []
  if (Array.isArray(file)) {
    for (let i = 0; i < file.length; i++) {
      let item = file[i]
      let mLoader = await getLoader(item, materials)
      if (!mLoader) {
        if (resolve) resolve(null, file)
      } else {
        let obj = await doLoad(mLoader, item).catch((e) => {})
        if (resolveall) {
          allItems.push({ file: item, obj: obj })
        }
        if (resolve) resolve(obj, item)
      }
    }
    if (resolveall) {
      resolveall(allItems)
    }
  } else {
    let mLoader = await getLoader(file, materials)
    if (!mLoader) {
      if (resolve) resolve(null, file)
      return
    }
    let obj = await doLoad(mLoader, file).catch((e) => {})
    if (resolve) resolve(obj, obj)
    if (resolveall) {
      allItems.push({ file: file, obj: obj })
      resolveall(allItems)
    }
  }
}
const setLoadModule = async function (scene, THREE) {
  let com = threejsLoadRef.value
  if (com) {
    let mode = module.data.mode
    let file = module.data.file
    await initPhycisMgr(com, 1)

    loadModule('/modules/gltf/collision-world.glb', null, (obj, item) => {
      if (!obj) {
        console.log('loadModule', item + '--get failed')
        return
      }
      let wrap = com.track(obj.scene)
      wrap.myname = 'world-scene'
      scene.add(wrap)
      // let world = groundPlane
      if (cannonMgr != null) {
        cannonMgr.setWorld(wrap)
        cannonMgr.showHelper(true)
      }
      if (octreeMgr != null) {
        octreeMgr.setWorld(wrap)
        octreeMgr.showHelper(true)
      }
      wrap.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          if (child.material.map) {
            child.material.map.anisotropy = 4
          }
        }
      })
    })
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
          obj.scale.multiplyScalar(0.015)
          obj.myname = 'mtl-obj'
          let wrap = com.track(obj)
          // scene.add(wrap)
          makePlayer(com, wrap, null, (player) => {
            scene.add(player)
            setPlayer(player)
            com.setMiniMap(player)
          })
        })
      })
      return true
    } else {
      loadModule(
        file,
        null,
        (obj, item) => {
          if (!obj) {
            console.log('loadModule', item + '--get failed')
            return
          }
          if (mode == 'gltf') {
            let wrap = com.track(obj.scene)
            wrap.myname = 'gltf-scene'
            wrap.scale.multiplyScalar(0.5)
            makePlayer(com, wrap, null, (player) => {
              scene.add(player)
              setPlayer(player)
              com.setMiniMap(player)
            })
            wrap.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
                if (child.material.map) {
                  child.material.map.anisotropy = 4
                }
              }
            })
            if (controls && controls.type == 'first') {
              controls.setEnable(true)
            }
            createGUI(com, THREE, wrap, obj.animations)
            obj = null
          } else if (mode == 'fbx') {
            scene.add(com.track(obj))
            obj.myname = 'fbx-obj'
            const action = com.setMixer(obj, obj.animations[0])
            obj.traverse(function (child) {
              if (child.isMesh) {
                child.castShadow = true
                child.receiveShadow = true
              }
            })
            if (action) {
              action.play()
            }
          } else if (mode == 'collada') {
            obj.scene.scale.multiplyScalar(0.5)
            modelAnimate = obj.scene
            obj.scene.myname = 'collada-scene'
            let wrap = com.track(obj.scene)
            // scene.add(wrap)
            makePlayer(com, wrap, null, (player) => {
              scene.add(player)
              player.axisy_z = true
              setPlayer(player)
              com.setMiniMap(player)
            })
          } else if (mode == 'stl') {
            // let mesh = makeStl(com,THREE,item, obj)
            // scene.add(mesh)
          } else if (mode == 'ply') {
            // let mesh = makePly(com, THREE, item, obj)
            // scene.add(mesh)
          }
        },
        (all) => {
          if (all && all.length > 0) {
            if (mode == 'stl' || mode == 'ply') {
              let flag = false
              let group = com.track(new com.THREE.Mesh())
              all.forEach((it) => {
                let mesh = null
                if (mode == 'stl') {
                  mesh = makeStl(com, THREE, it.file, it.obj)
                } else if (mode == 'ply') {
                  mesh = makePly(com, THREE, it.file, it.obj)
                }
                if (mesh) {
                  flag = true
                  group.add(mesh)
                }
              })
              if (flag) {
                makePlayer(com, group, null, (player) => {
                  scene.add(player)
                  setPlayer(player)
                  com.setMiniMap(player)
                })
              }
            }
          }
          all.splice(0, all.length)
        }
      )
      return true
    }
  }
  return false
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
let isPositinAudioPaused = false
const createGUI = async function (com, THREE, model, animations) {
  const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing']
  const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp']
  await com.getGui()
  com.gui = com.track(new com.GUI())
  com.gui.domElement.style.top = '88px' //可以调整位置
  com.gui.domElement.style.left = '0px' //可以调整位置
  com.gui.add({ debug: false }, 'debug').onChange(function (value) {
    if (octreeMgr && octreeMgr.octreeHelper) octreeMgr.octreeHelper.visible = value
  })

  com.gui.add({ positionAudio: false }, 'positionAudio').onChange(function (value) {
    if (positionMusicRef.value) {
      if (value) {
        playPositinAudio()
        if (isPositinAudioPaused) {
          positionMusicRef.value.play()
        }
      } else {
        isPositinAudioPaused = true
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
  com.gui.close() //主面板关闭

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

  const expressions = Object.keys(face.morphTargetDictionary)
  const expressionFolder = com.gui.addFolder('Expressions')

  for (let i = 0; i < expressions.length; i++) {
    expressionFolder.add(face.morphTargetInfluences, i, 0, 1, 0.01).name(expressions[i])
  }

  activeAction = actions['Walking']
  activeAction.play()

  expressionFolder.open() //子面板打开
  //   expressionFolder.close()
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
        :show-stats="true"
        :showControls="false"
      />

      <van-action-sheet
        v-model:show="showActionSheet"
        :actions="modules"
        :cancel-text="'取消'"
        description="模型切换"
        @select="onSelected"
      />
      <audio ref="positionMusicRef" loop id="music" preload="auto"
             style="display: none;">
<!--          ogg ios浏览器不能播，两个自动 兼容-->
        <source src="/audio/sounds/376737_Skullbeatz___Bad_Cat_Maste.ogg" type="audio/ogg" />
        <source src="/audio/sounds/376737_Skullbeatz___Bad_Cat_Maste.mp3" type="audio/mpeg" />
      </audio>
      <joy-stick :get-rad="getRad" :jump="jump" :shoot="shoot"></joy-stick>
    </template>
  </page-root>
</template>

<style scoped></style>
<style lang="scss" scoped></style>
