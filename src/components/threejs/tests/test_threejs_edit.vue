<script setup name="test_threejs_edit">
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
  reactive
} from 'vue'
//页面根节点
import PageRoot, { PageNavDef } from '@/components/page/index'
import { useChildren, useParent } from '@vant/use'
import threejsLoad from '@/components/threejs/threejs-load.vue'
import ModuleLoad from '@/components/threejs/tests/module-load'
import ThreejsLoad from '@/components/threejs/threejs-load.vue'
import { AllLoaders } from '@/components/threejs/load/loader-map'
import { FileSelector } from '@/components/media/tools/FileSelector'
const props = defineProps(['relationKey'])
// const { proxy } = getCurrentInstance() //用来获取全局变量用；proxy
// const router = useRouter()
////////////////////////////////////
const { parent } = useParent(props.relationKey)
//通过parent调用父组件通过linkChildren提供数据和方法

//将relationKey 通过 props 传递给子组件
const relationKey = Symbol('test_threejs_edit-relation-Symbol')
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
    },
    rightText: computed(() => {
      return '选择loader'
    }),
    clickRight: function () {
      showActionSheet.value = !showActionSheet.value
      return false
    }
  })
})
//透传nav
provide('navParams', navDef)

onActivated(() => {})
onDeactivated(() => {})
const threejsLoadRef = ref()
const setRender = async function (render, THREE) {
  let com = threejsLoadRef.value
  // let controlsType = 'third' //first third or null
  // let ctrls = com.createOrbitControls(render.domElement, controlsType)
  try {
    // await com.skyBox.createSky(com.scene)
    // com.skyBox.changeSky()
    com.skyBox.test()
  } catch (e) {
    console.error(e)
  }
  return render
}
const loadModule = async (file, materials, resolve, resolveall) => {
  let com = threejsLoadRef.value
  return await ModuleLoad.loadModule(com, file, materials, resolve, resolveall)
}
const setLoadModule2 = function (scene, THREE) {
  return setLoadModule(scene, THREE)
  // return false
}
const setLoadModule = async function (scene, THREE) {
  let com = threejsLoadRef.value
  if (com) {
    let dic = '/unity/Male/3D/Legs/Legs_1'
    let leg_file = `${dic}/Male_Legs_1.FBX`
    let mat_dic = `${dic}/Materials`
    let let_mat = `${mat_dic}/Male_Legs_1_Black.mat`
    //[`${mat_dic}/Male_Legs_1_Black.mat`,`${mat_dic}/Male_Legs_1_Brown.mat`]
    loadModule(let_mat, null, null, (items) => {
      if (!items) {
        console.log('loadModule', '--get failed')
        return
      }
      for (let i = 0; i < items.length; i++) {
        let materials = items[i].obj
        materials.preload()
      }
      loadModule(leg_file, items, (obj, item) => {
        if (!obj) {
          console.log('loadModule', item + '--get failed')
          return
        }
        let params = { height: 1, position: com.getVec3().set(1, 0.49, 0) }
        // if (nav_file == '/modules/gltf/nav.obj') {
        //     params.position.y = -1.523
        //     //
        //     params.height = 1.7
        //     params.position.y = -1.366
        // }
        obj.myname = 'mtl-obj'
        obj.scale.multiplyScalar(1 / 15)
        obj.rotation.x = -Math.PI / 2
        let wrap = com.track(obj)
        scene.add(wrap)
        // makePlayer(com, wrap, params, (player) => {
        //     scene.add(player)
        //     setPlayer(player)
        //     //mini-map 跟随
        //     setMiniMap(com, player)
        // })
      })
    })
    return true
  }
}
const showActionSheet = ref(false)
const onSelected = (action) => {
  showActionSheet.value = false
  loaderOptions.value = action.name
}
const loaderOptions = reactive({
  value: '',
  options: []
})
nextTick(() => {
  for (let i = 0; i < AllLoaders.length; i++) {
    loaderOptions.options.push({ name: AllLoaders[i] })
  }
})
const seledFille = ref('')
const seledFilles = ref('')
const selectFiles = function (type) {
  let selector = new FileSelector()
  // selector.accept = '*.mp3'
  if (type == 1) {
    selector.selectSingleFile(function (data) {
      if (data) {
        if (!Array.isArray(data)) {
          let file = data
          seledFille.value = file.name
          if (file) {
            const reader = new FileReader()
            reader.readAsText(file) // 将文件读取为文本
            reader.onload = () => {
              // 文件读取完成后的回调
              // console.log(reader.result) // 读取到的文件内容
            }
            reader.onerror = (e) => {
              console.log('FileReader-err', file.name)
            }
          }
        }
      }
    })
  } else {
    selector.selectMultipleFiles(function (data) {
      if (data) {
          let com = threejsLoadRef.value
        if (Array.isArray(data)) {
          seledFilles.value = null
          for (let i = 0; i < data.length; i++) {
            let file = data[i]
            if (seledFilles.value != null) {
              seledFilles.value += ';'
            } else {
              seledFilles.value = ''
            }
            seledFilles.value += file.name
            if (file) {
              const reader = new FileReader()
              reader.readAsText(file) // 将文件读取为文本
              reader.onload = () => {
                // let mat=com.THREE.MeshBasicMaterial()
                  //envMap
                // 文件读取完成后的回调
                console.log(reader.result) // 读取到的文件内容
              }
              reader.onerror = (e) => {
                console.log('FileReader-err', file.name)
              }
            }
          }
        }
      }
    })
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
      <div style="width: 100vw; display: flex; flex-direction: row" @click="selectFiles(0)">
        选择材质：
        <div style="flex: 1; overflow: hidden; overflow-x: auto">{{ seledFilles }}</div>
      </div>
      <div @click="selectFiles(1)">选择模型：{{ seledFille }}</div>
      <threejs-load
        ref="threejsLoadRef"
        :showControls="true"
        :setRender="setRender"
        :setLoadModule="setLoadModule2"
      >
      </threejs-load>
      <van-action-sheet
        v-model:show="showActionSheet"
        :actions="loaderOptions.options"
        :cancel-text="'取消'"
        description="Loader切换"
        @select="onSelected"
      />
    </template>
  </page-root>
</template>

<style scoped></style>
<style lang="scss" scoped></style>
