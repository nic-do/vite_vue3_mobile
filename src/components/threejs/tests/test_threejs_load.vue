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
const props = defineProps(['relationKey'])
// const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
// const router = useRouter()
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
    clickLeft: function () {
      return true
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
  modelAnimate = null
  loaders = {}
  actionsTotal = null
  face = null
  previousAction = null
  activeAction = null
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
const click = function () {
  showActionSheet.value = !showActionSheet.value
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
  if (module.data.mode == 'fbx') {
    scene.fog = new THREE.Fog(0xe0e0e0, 200, 1000)
  } else {
    scene.fog = new THREE.Fog(0xe0e0e0, 10, 50)
  }
}
let cameraTarget = null
const setCamera = function (camera, THREE) {
  //跟模型关系很大
  let mode = module.data.mode
  if (mode == 'fbx') {
    camera.position.set(100, 200, 300)
  } else if (mode == 'stl' || mode == 'ply') {
    camera.position.set(-5, 4, 7)
    cameraTarget = new THREE.Vector3(0, mode == 'ply' ? -0.1 : -0.25, 0)
  } else {
    camera.position.set(-5, 4, 7)
  }
  //需要设置lookAt
  // 1、受模型有影响 2、受OrbitControls影响
  if (mode == 'fbx') {
    camera.lookAt(new THREE.Vector3(0, 100, 0))
  } else {
    camera.lookAt(new THREE.Vector3(0, 1, 0))
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
const setGround = function (ground, THREE) {
  ground.grid = null
}
const setRender = function (render, THREE) {
  let ctrls = threejsLoadRef.value.createOrbitControls(render.domElement)
  if (module.data.mode == 'fbx') {
    ctrls.target.set(0, 50, 0)
  } else if (module.data.mode == 'stl') {
    ctrls.target.set(0, 0, 0)
  } else {
    ctrls.target.set(0, 0.5, 0)
  }
}
const setAnimate = function (delta, camera, scene, THREE) {
  if (module.data.mode == 'collada') {
    if (delta && modelAnimate) {
      modelAnimate.rotation.z += delta * 0.5
    }
  } else if (cameraTarget && (module.data.mode == 'stl' || module.data.mode == 'ply')) {
    const timer = Date.now() * 0.0005
    camera.position.x = Math.cos(timer) * 6
    camera.position.z = Math.sin(timer) * 6
    camera.lookAt(cameraTarget)
  }
}

let modelAnimate = null
let loaders = {}
const getLoader = async (com, mode) => {
  if (loaders[mode] == null) {
    let Loader = await com.getLoader(mode)
    if (Loader) {
      loaders[mode] = new Loader()
    }
  }
  return loaders[mode]
}
const setLoadModule = async function (scene, THREE) {
  let com = threejsLoadRef.value
  if (com) {
    let mode = module.data.mode
    let file = module.data.file
    let mLoader = await getLoader(com, mode)
    if (!mLoader) {
      return null
    }
      const onProgress = function (xhr) {
          if (xhr.lengthComputable) {
              const percentComplete = (xhr.loaded / xhr.total) * 100
              console.log(Math.round(percentComplete, 2) + '% downloaded')
          }
      }

      const loadModule = (file, materials, resolve) => {
      if (materials) {
        if (mLoader.setMaterials != undefined) {
          mLoader.setMaterials(materials)
        }
      }
      if (Array.isArray(file)) {
        for (let i = 0; i < file.length; i++) {
          let item = file[i]
          mLoader.load(
            item,
            (obj) => {
              resolve(obj, item)
            },
            onProgress
          )
        }
      } else {
        mLoader.load(
          file,
          (obj) => {
            resolve(obj, file)
          },
          onProgress
        )
      }
    }
    if (mode == 'obj') {
      let mtlLoader = await getLoader(com, 'mtl')
      if (!mtlLoader) {
        return null
      }
      mtlLoader.load('/modules/obj/male02/male02.mtl', function (materials) {
        materials.preload()
        loadModule(file, materials, (obj, item) => {
          obj.scale.multiplyScalar(0.015)
          scene.add(com.track(obj))
        })
      })
      return true
    } else {
      loadModule(file, null, (obj, item) => {
        if (mode == 'gltf') {
          obj.scene.scale.multiplyScalar(0.5)
          scene.add(com.track(obj.scene))
          createGUI(com, THREE, obj.scene, obj.animations)
        } else if (mode == 'fbx') {
          scene.add(com.track(obj))
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
          scene.add(com.track(obj.scene))
        } else if (mode == 'stl') {
          let mesh = null
          if (item.indexOf('slotted_disk.stl') > 0) {
            let material = com.track(
              new THREE.MeshPhongMaterial({
                color: 0xff9c7c,
                specular: 0x494949,
                shininess: 200
              })
            )
            let fact = 1
            mesh = new THREE.Mesh(obj, material)
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
            mesh = new THREE.Mesh(obj, material)
            mesh.position.set(0, 0.065 * fact, -0.6)
            mesh.rotation.set(-Math.PI / 2, 0, 0)
            mesh.scale.set(fact, fact, fact)

            mesh.castShadow = true
            mesh.receiveShadow = true
          }
          mesh.scale.multiplyScalar(0.5)
          scene.add(com.track(mesh))
        } else if (mode == 'ply') {
          obj.computeVertexNormals()
          const material = com.track(
            new THREE.MeshStandardMaterial({ color: 0x009cff, flatShading: true })
          )
          const mesh = new THREE.Mesh(obj, material)
          let size = com.getSize(mesh)
          let factor = 0
          if (item.indexOf('dolphins.ply') > 0) {
            factor = 0.001 * 3
            mesh.position.z = 0.3
            mesh.rotation.x = -Math.PI / 2
            mesh.scale.multiplyScalar(factor)
            mesh.position.y = (size.y * factor) / 2 + 0.19
          } else if (item.indexOf('Lucy100k.ply') > 0) {
            factor = 0.0006 * 3
            mesh.position.x = -0.2
            mesh.position.z = -0.2
            mesh.scale.multiplyScalar(factor)
            mesh.position.y = (size.y * factor) / 2
          }
          mesh.castShadow = true
          mesh.receiveShadow = true
          scene.add(com.track(mesh))
        }
      })
      return true
    }
  }
  return false
}

let actionsTotal = null
let api = { state: 'Walking' }
let face = null
let previousAction = null
let activeAction = null
const createGUI = function (com, THREE, model, animations) {
  const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing']
  const emotes = ['Jump', 'Yes', 'No', 'Wave', 'Punch', 'ThumbsUp']
  com.gui = com.track(new com.GUI())
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

  function restoreState() {
    mixer.removeEventListener('finished', restoreState)

    fadeToAction(api.state, 0.2)
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
const fadeToAction = function (name, duration) {
  previousAction = activeAction
  activeAction = actionsTotal[name]
  if (previousAction !== activeAction) {
    previousAction.fadeOut(duration)
  }

  activeAction.reset().setEffectiveTimeScale(1).setEffectiveWeight(1).fadeIn(duration).play()
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
        :setLoadModule="setLoadModule"
        :showControls="true"
      />

      <van-button style="position: fixed; top: 100px; z-index: 10000" type="primary" @click="click"
        >change-module</van-button
      >

      <van-action-sheet
        v-model:show="showActionSheet"
        :actions="modules"
        :cancel-text="'取消'"
        description="模型切换"
        @select="onSelected"
      />
    </template>
  </page-root>
</template>

<style scoped>

</style>
<style lang="scss" scoped></style>
