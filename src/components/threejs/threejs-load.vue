<template>
  <div ref="canvasRef" id="three" class="three"></div>
</template>

<script>
import { nextTick, ref, markRaw } from 'vue'
import { MiniMap } from '@/components/threejs/mini-map/mini-map'
import Stats from 'three/addons/libs/stats.module'
import ResourceTracker from '@/components/threejs/tools/track-resource'
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import { ThirdPersonCameraControl } from '@/components/threejs/load/controls/thirdPersonCameraControl'
import IS from '@/utils/is'
import reloadWatch from '@/utils/listener/reload-watch'
import { DashLinesBoxTool } from '@/components/threejs/tools/dash-lines-box-tool'
import { isPromise } from 'vant/es/utils'
import { SkyBox } from '@/components/threejs/tools/sky-box'
import { tag2D, labelRenderer as labelRenderer2D } from '@/components/threejs/tools/tag/tag2d'
import LoadHelper from '@/components/threejs/tools/load-helper'
import { checkRequestAnimationFrame } from '@/components/threejs/tools/requestFrame'
import {
  tag3D,
  tag3DSprite,
  labelRenderer as labelRenderer3D
} from '@/components/threejs/tools/tag/tag3d'
export default {
  name: 'threejs-load',
  props: [
    'module',
    'setScene',
    'setCamera',
    'setLight',
    'setGround',
    'setRender',
    'setLoadModule',
    'setAnimate',
    'showControls',
    'showStats',
    'showTag',
    'useLod'
  ],
  setup(props, context) {},
  watch: {
    module: {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        if (oldVal != undefined && newVal != undefined) {
          nextTick(() => {
            if (this.scene) {
              if (newVal.clear) {
                this.destroyResource()
                this.initFlag = false
                this.init()
              } else {
                this.handleModule(this.scene)
              }
            }
          })
        }
      }
    },
    showStats: {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        if (oldVal != undefined && newVal != undefined) {
          nextTick(() => {
            this.setShowStats(newVal)
          })
        }
      }
    },
    showTag: {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {}
    },
    useLod: {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {}
    }
  },
  data() {
    return {
      THREE: null,
      loader: null,
      GUI: null,
      resMgr: null,

      stats: null,
      clock: null,

      lod: null,
      scene: null,
      camera: null,
      renderer: null,

      gui: null,
      mixer: null,
      loaders: null,
      collision: null,
      collisionModel: null,
      miniMap: null,
      audioLoader: null,
      skyBox: null,
      renderer2D: null,
      renderer3D: null
    }
  },
  created() {
    this.loaders = markRaw({})
    this.collision = markRaw({})
    this.collisionModel = markRaw({})
    reloadWatch.setListener(() => {
      this.destroyResource()
    })
  },
  mounted() {
    this.init()
  },
  activated() {
    this.init()
  },
  deactivated() {
    this.destroyResource()
  },
  beforeUnmount() {
    this.destroyResource()
  },
  methods: {
    onWindowResize() {
      let width = window.innerWidth
      let height = window.innerHeight
      this.camera.aspect = width / height
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(width, height)
      if (this.showTag) {
        if (this.renderer2D) this.renderer2D.setSize(width, height)
        if (this.renderer3D) this.renderer3D.setSize(width, height)
      }
    },
    init() {
      if (!this.initFlag) {
        this.initFlag = true
        window.addEventListener('resize', this.onWindowResize)
        // 在外层定义resMgr和track
        this.resMgr = new ResourceTracker()
        this.setShowStats(this.showStats)
        checkRequestAnimationFrame()

        nextTick(async () => {
          await this.getLoad()
          this.skyBox = markRaw(new SkyBox(this))
          this.lod = this.track(new this.THREE.LOD())
          this.initScene()
        })
      }
    },
    async getCollisionModel(name) {
      if (!this.collisionModel[name]) {
        let res = await LoadHelper.getCollisionModel(name)
        if (res) this.collisionModel[name] = res
      }
      return this.collisionModel[name]
    },
    async getCollisionMgr(name) {
      if (!this.collision[name]) {
        let res = await LoadHelper.getCollisionMgr(name)
        if (res) this.collision[name] = res
      }
      return this.collision[name]
    },
    async getLoad() {
      //必须的
      let res = await LoadHelper.getLoad()
      if (res) this.THREE = res
    },
    async getLoader(mode) {
      //按文件格式 加载 需要的loader
      mode=  mode.toLowerCase()
      if (this.loaders[mode] == null) {
        let res = await LoadHelper.getLoader(mode)
        if (res) this.loaders[mode] = res
      }
      return this.loaders[mode]
    },
    async getGui() {
      if (!this.GUI) {
        let res = await LoadHelper.getGui()
        if (res) this.GUI = res
      }
      return this.GUI
    },
    destroyResource() {
      //注：确保所有new出来的 mesh等需要释放内存的尽量不要 用this.xxx去保存
      //   如果一定要全局保存，destroy时 释放内存后，全部置null，否则似乎有残留
      try {
        window.removeEventListener('resize', this.onWindowResize)
        this.skyBox = null
        if (this.miniMap) {
          this.miniMap.dispose()
          this.miniMap = null
        }

        this.stopAnimate = true
        if (this.scene) {
          if (this.gui) {
            this.gui.destroy()
          }
          if (this.mixer) {
            this.mixer.stopAllAction()
            this.mixer.uncacheRoot(this.mixer.getRoot())
          }
          if (this.resMgr) {
            this.resMgr.dispose(this.THREE)
          }

          this.scene.clear()
          this.resMgr.clearRender(this.renderer)
          this.THREE.Cache.clear()

          if (this.stats) {
            if (this.stats.domElement) this.$refs.canvasRef.removeChild(this.stats.dom)
            this.stats = null
          }
          if (this.clock && this.clock.running) {
            this.clock.stop()
            this.clock = null
          }
          if (this.controls) {
            if (this.controls.dispose != undefined) {
              this.controls.dispose()
            }
          }
          if (this.rendererIdMiniMap) cancelAnimationFrame(this.rendererIdMiniMap)
          if (this.rendererId) cancelAnimationFrame(this.rendererId)
          this.rendererIdMiniMap = null
          this.rendererId = null
          this.lod = null
          this.renderer2D = null
          this.renderer3D = null
          this.audioLoader = null
          this.mixer = null
          this.controls = null
          this.scene.background = null
          this.scene.fog = null
          this.scene = null
          this.renderer = null
          this.camera = null
          this.gui = null
          this.resMgr = null
          this.GUI = null
          // this.loader = null
          this.collision = {}
          this.loaders = {}
          this.collisionModel = {}
          this.THREE = null
          if (this.dashLinesBoxTool) {
            this.dashLinesBoxTool.dispose()
            this.dashLinesBoxTool = null
          }
        }
      } catch (e) {
        console.error('--destroyResource--', e)
      }
      reloadWatch.clearListener()
    },
    logInfo() {
      this.resMgr.logRenderInfo(this.renderer)
      if (this.miniMap) {
        this.miniMap.logInfo()
      }
    },
    track(val) {
      //标记不使用 proxy
      let res = markRaw(this.resMgr.track(val))
      return res
    },
    lodRemove(obj) {
      if (this.lod) {
        this.lod.remove(obj)
      }
    },
    lodLevel(obj, distance = 0, hysteresis = 0) {
      if (this.lod) {
        this.lod.addLevel(obj, distance, hysteresis)
      }
    },
    setShowStats(flag) {
      if (!this.stats && flag) {
        this.stats = new Stats()
      }
      if (this.stats) {
        if (flag) {
          this.stats.domElement.style.top = '44px' //可以调整位置
          if (this.$refs.canvasRef) {
            this.$refs.canvasRef.appendChild(this.stats.dom)
          }
        } else {
          if (this.stats.domElement && this.$refs.canvasRef) {
            this.$refs.canvasRef.removeChild(this.stats.dom)
          }
        }
      }
    },
    async updateControls(delta) {
      //不阻塞
      if (this.controls) {
        if (this.controls.type) {
          this.controls.update(delta)
        } else {
          this.controls.update()
        }
      }
    },
    animate() {
      if (this.stopAnimate || !this.$refs.canvasRef) {
        return
      }
      /////////////////////////////////////////////////////////////
      let delta = null
      if (this.clock) {
        delta = this.clock.getDelta()
      }
      if (delta && this.mixer) {
        this.mixer.update(delta)
      }
      if (this.lod) {
        this.lod.update(this.camera)
      }
      this.updateControls(delta)
      if (IS.isFunction(this.setAnimate)) {
        this.setAnimate(delta, this.camera, this.scene, this.THREE)
      }
      //////////////////////////////////////////////////////////////////////////////////////
      if (this.showTag) {
        if (!this.renderer2D && this.$refs.canvasRef) {
          this.renderer2D = this.track(labelRenderer2D(this.$refs.canvasRef)) //渲染HTML标签对象 CSS2DObject 标签
          this.renderer3D = this.track(labelRenderer3D(this.$refs.canvasRef)) //渲染HTML标签对象 CSS3DObject 标签
        }
        if (this.renderer2D) this.renderer2D.render(this.scene, this.camera)
        if (this.renderer3D) this.renderer3D.render(this.scene, this.camera)
      }
      // let time = new Date().getTime()
      // let dtime = time
      if (this.renderer) {
        //这里的两个renderer 耗时比较大，加起来要120多ms，
        //miniMap单独使用requestAnimationFrame
        //可以是此 animate 执行总时间减小一般
        this.renderer.render(this.scene, this.camera)
        // dtime = new Date().getTime() - time
        // console.log('--6-', dtime)
        let miniMap = this.miniMap
        if (miniMap) {
          if (this.rendererIdMiniMap != undefined) {
            //这里依赖于此处的 定时操作，可能存在 上一次未执行完的request，所以先cancel
            //也可以在  miniMap自己单独使用requestAnimationFrame，就不用每次先cancel了
            cancelAnimationFrame(this.rendererIdMiniMap)
            this.rendererIdMiniMap = null
          }
          //需要bind，不然找不到内部this
          this.rendererIdMiniMap = requestAnimationFrame(miniMap.update.bind(miniMap))
        }
        // dtime = new Date().getTime() - time
        // console.log('--7-', dtime)
      }

      if (this.stats) this.stats.update()

      const resizeRendererToDisplaySize = (renderer) => {
        if (renderer) {
          const canvasEl = renderer.domElement
          var width = window.innerWidth
          var height = window.innerHeight
          //这个一直不一致？？ 猜测可能是 工程针对移动端的配置 window.devicePixelRatio有问题
          // var canvasPixelWidth = canvasEl.width / window.devicePixelRatio
          // var canvasPixelHeight = canvasEl.height / window.devicePixelRatio
          //同样引起了 窗口大小变化时，render的size 显示不正确
          var canvasPixelWidth = canvasEl.width
          var canvasPixelHeight = canvasEl.height

          const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height
          if (needResize) {
            renderer.setSize(width, height, false)
            if (this.showTag) {
              if (this.renderer2D) this.renderer2D.setSize(width, height)
              if (this.renderer3D) this.renderer3D.setSize(width, height)
            }
          }
          return needResize
        }
        return false
      }
      if (this.renderer && resizeRendererToDisplaySize(this.renderer)) {
        const canvasEl = this.renderer.domElement
        this.camera.aspect = canvasEl.width / canvasEl.height //canvasEl.clientWidth / canvasEl.clientHeight
        this.camera.updateProjectionMatrix()
      }
      this.rendererId = requestAnimationFrame(this.animate)
    },
    getTag(params) {
      let tag = null
      if (params) {
        let tagname = params.name
        if (params.type == '3d') {
          if (params.useSprite) {
            tag = tag3DSprite(tagname)
          } else {
            tag = tag3D(tagname)
          }
        } else {
          tag = tag2D(tagname)
        }
      }
      return tag
    },
    getVec3() {
      return new this.THREE.Vector3()
    },
    getBox3() {
      return new this.THREE.Box3()
    },
    getScale(target) {
      if (!this.v3_ForSize) {
        this.v3_ForSize = this.getVec3()
      }
      this.v3_ForSize.set(0, 0, 0)
      target.getWorldScale(this.v3_ForSize)
      return this.v3_ForSize.clone()
    },
    getSize(target) {
      if (!this.box3ForSize) {
        this.box3ForSize = this.getBox3()
      }
      if (!this.v3_ForSize) {
        this.v3_ForSize = this.getVec3()
      }
      this.v3_ForSize.set(0, 0, 0)
      this.box3ForSize.setFromObject(target)
      this.box3ForSize.getSize(this.v3_ForSize)
      return this.v3_ForSize.clone()
    },
    createAudio(isPositonAudio) {
      const listener = new this.THREE.AudioListener()
      this.track(listener)
      let audio = null
      if (isPositonAudio) {
        audio = new this.THREE.PositionalAudio(listener)
      } else {
        audio = new this.THREE.Audio(listener)
      }
      this.track(audio)
      return audio
    },
    loadAudioFile(audioFile, callback) {
      if (!audioFile || !callback) {
        return
      }
      const onProgress = function (xhr) {
        if (xhr.lengthComputable) {
          const percentComplete = (xhr.loaded / xhr.total) * 100
          console.log(Math.round(percentComplete, 2) + '% downloaded')
        }
      }
      if (!this.audioLoader) {
        this.audioLoader = this.track(new this.THREE.AudioLoader())
      }
      if (this.audioLoader) {
        this.audioLoader.load(
          audioFile,
          (buffer) => {
            if (callback) {
              callback(buffer)
            }
          },
          onProgress,
          null
        )
      }
    },
    createCamera() {
      // 创建一个camera用来观看场景里的内容,Three.js提供多种相机，
      // 比较常用的是PerspectiveCamera（透视摄像机）以及OrthographicCamera （正交投影摄像机）。
      let fov = 50,
        aspect = window.innerWidth / window.innerHeight,
        near = 1,
        far = 2000
      let camera = this.track(new this.THREE.PerspectiveCamera(fov, aspect, near, far))
      camera.myname = 'camera-PerspectiveCamera'
      camera.position.set(-5, 4, 7)
      camera.lookAt(new this.THREE.Vector3(0, 0, 0))
      return camera
    },
    createGround() {
      // ground 地面
      let geo = this.track(new this.THREE.PlaneGeometry(50, 50))
      geo.myname = 'ground-PlaneGeometry'
      let material = this.track(
        new this.THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
      )
      material.myname = 'ground-MeshPhongMaterial'
      let ground = this.track(new this.THREE.Mesh(geo, material))
      ground.myname = 'ground-mesh'
      ground.rotation.x = -Math.PI / 2
      ground.receiveShadow = true
      //给地面加个网格，好分辨一些
      let grid = this.track(new this.THREE.GridHelper(30, 40, 0xff0000, 0xff0000))
      grid.myname = 'ground-grid'
      // grid.material.opacity = 0.2
      // grid.material.transparent = true
      return {
        ground: ground,
        grid: grid
      }
    },
    addDirectionalLight(color, intensity, initflag, resolve) {
      let light = this.track(new this.THREE.DirectionalLight(color, intensity))
      light.myname = 'light-DirectionalLight'
      if (initflag) {
        let x = 1,
          y = 1,
          z = 1
        light.position.set(x, y, z)
        light.castShadow = true
        const d = 1
        light.shadow.camera.left = -d
        light.shadow.camera.right = d
        light.shadow.camera.top = d
        light.shadow.camera.bottom = -d
        light.shadow.camera.near = 1
        light.shadow.camera.far = 4
        light.shadow.bias = -0.002
      }
      if (resolve) {
        resolve(light)
      }
      return light
    },
    addHemisphereLight(skyColor, groundColor, intensity, resolve) {
      let light = this.track(new this.THREE.HemisphereLight(skyColor, groundColor, intensity))
      light.myname = 'light-HemisphereLight'
      if (resolve) {
        resolve(light)
      }
      return light
    },
    createLight() {
      //灯光
      // 现在地板有颜色了，还可以添加多个光源，让场景看起来更真实:
      // 半球光光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色。
      // let hemLight = this.addHemisphereLight(0xffffff, 0xffffff, 1)
      let hemLight = this.addHemisphereLight(0xffffff, 0x8d8d8d, 1)
      hemLight.position.set(0, 30, 0)
      // 先添加个平行光:
      let dirLight = this.addDirectionalLight(0xffffff, 0.6, false, (light) => {
        //光源等位置
        light.shadow.camera.top = 20
        light.shadow.camera.bottom = -20
        light.shadow.camera.left = -25
        light.shadow.camera.right = 25
        //   light.angle=Math.PI
        light.position.set(-20, 20, -15)
        light.shadow.camera.near = 10
        light.shadow.camera.far = 100
        //可以产生阴影
        light.castShadow = true
        // light.shadow.mapSize = new this.THREE.Vector2(1024, 1024)
      })
      return { hemLight: hemLight, dirLight: dirLight }
    },
    createRender(params, resolve) {
      let renderer = new this.THREE.WebGLRenderer(params || { antialias: true })
      if (resolve) {
        resolve(renderer)
      }
      return renderer
    },
    getOrbitControls() {
      return this.createOrbitControls(this.renderer.domElement)
    },
    createOrbitControls(dom, type) {
      if (this.controlsType != type) {
        if (this.controls && this.controls.type) {
          this.controls.dispose()
        }
        this.controls = null
      }
      if (this.controls == null && this.camera && dom) {
        let controls = null
        if (type == 'third') {
          controls = new ThirdPersonCameraControl(this, dom)
        } else {
          controls = new OrbitControls(this.camera, dom)
          if (controls.target) controls.target.set(0, 0, 0)
          controls.listenToKeyEvents(document)
        }
        this.controlsType = type
        this.controls = markRaw(controls)
      }
      return this.controls
    },
    setMixer(target, clipAction) {
      let action = null
      if (target && clipAction) {
        this.mixer = this.track(new this.THREE.AnimationMixer(target))
        action = this.mixer.clipAction(clipAction)
      }
      return action
    },
    async initScene() {
      this.clock = markRaw(new this.THREE.Clock())
      //首先为Three.js创建一个scene:
      let scene = this.track(new this.THREE.Scene())
      if (IS.isFunction(this.setScene)) {
        let res = this.setScene(scene, this.THREE)
        if (res != undefined) {
          if (isPromise(res)) {
            scene = await res.catch((e) => {})
          } else {
            scene = res
          }
        }
      }
      /////////////////////////////////
      scene.myname = 'scene-main'
      scene.add(this.lod)
      this.scene = markRaw(scene)

      let camera = this.createCamera()
      if (IS.isFunction(this.setCamera)) {
        let res = this.setCamera(camera, this.THREE)
        if (res != undefined) {
          if (isPromise(res)) {
            camera = await res.catch((e) => {})
          } else {
            camera = res
          }
        }
      }
      this.camera = markRaw(camera)

      let ground = this.createGround()
      if (IS.isFunction(this.setGround)) {
        let res = this.setGround(ground)
        if (res != undefined) {
          if (isPromise(res)) {
            ground = await res.catch((e) => {})
          } else {
            ground = res
          }
        }
      }
      if (ground.ground) scene.add(ground.ground)
      if (ground.grid) scene.add(ground.grid)

      let light = this.createLight()
      if (IS.isFunction(this.setLight)) {
        let res = this.setLight(light)
        if (res != undefined) {
          if (isPromise(res)) {
            light = await res.catch((e) => {})
          } else {
            light = res
          }
        }
      }
      if (light.hemLight) {
        if (Array.isArray(light.hemLight)) {
          light.hemLight.forEach((item) => {
            scene.add(item)
          })
        } else {
          scene.add(light.hemLight)
        }
      }
      if (light.dirLight) {
        if (Array.isArray(light.dirLight)) {
          light.dirLight.forEach((item) => {
            scene.add(item)
          })
        } else {
          scene.add(light.dirLight)
        }
      }

      //创建一个WebGLRenderer，将canvas和配置参数传入:
      let renderer = this.createRender({ antialias: true }, (renderer) => {
        renderer.shadowMap.enabled = true
      })
      if (IS.isFunction(this.setRender)) {
        let res = this.setRender(renderer)
        if (res != undefined) {
          if (isPromise(res)) {
            renderer = await res.catch((e) => {})
          } else {
            renderer = res
          }
        }
      }
      if (renderer) {
        this.renderer = markRaw(renderer)
        this.$refs.canvasRef.appendChild(renderer.domElement)

        if (!this.controls && this.showControls) {
          this.getOrbitControls()
        }
      }
      this.handleModule(scene)
      ///////////////////////////////////////////////////////////////////////////////////////////////////////
      this.stopAnimate = false

      this.rendererId = requestAnimationFrame(this.animate)
    },
    async handleModule(scene) {
      // this.loadModule(scene)
      if (IS.isFunction(this.setLoadModule)) {
        let res = this.setLoadModule(scene, this.THREE)
        if (res != null) {
          if (isPromise(res)) {
            let result = await res.catch((e) => {
              console.log('--setLoadModule--', e)
            })
            if (!result) {
              await this.loadModule(scene)
            }
          }
        } else {
          await this.loadModule(scene)
        }
      } else {
        await this.loadModule(scene)
      }
    },
    async loadModule(scene) {
      //声明一个加载器，加载我们下载的模型,并把它添加到场景中，在animate函数上面添加代码:
      const tLoader = await this.getLoader(this.module.mode)
      //刷新页面，场景里有了模糊的黑色的小人,没有给她添加纹理。
      const toLoad = (item) => {
        tLoader.load(item, (obj) => {
          let mesh = null
          if (obj.type == 'BufferGeometry') {
            //只是上了一个默认的颜色
            const material = this.track(
              new this.THREE.MeshStandardMaterial({ color: 0x009cff, flatShading: true })
            )
            material.myname = 'my-material'
            mesh = this.track(new this.THREE.Mesh(obj, material))
            mesh.myname = 'my-mesh'
          }
          let model = this.track(mesh || obj.scene || obj)
          if (!model.myname) {
            model.myname = 'load-model'
          }
          scene.add(model)
        })
      }
      if (Array.isArray(this.module.file)) {
        this.module.file.forEach((item) => {
          toLoad(item)
        })
      } else {
        toLoad(this.module.file)
      }
    },
    setMiniMap(target) {
      if (!this.miniMap)
        this.miniMap = markRaw(new MiniMap({ com: this, target, mapSize: 15, mapRenderSize: 150 }))
    },
    makeCube(tag, wireframe, color) {
      let material = this.track(
        new this.THREE.MeshBasicMaterial({
          color: color ? color : '#ff0000',
          wireframe: wireframe
        })
      )
      material.myname = `my-cube-${tag}-material`
      let geometry = this.track(new this.THREE.BoxGeometry(1, 2.22, 1))
      geometry.myname = `my-cube-${tag}-geometry`
      let cube = this.track(new this.THREE.Mesh(geometry, material))
      cube.myname = `my-cube-${tag}-mesh`

      // cube.rotation.x = (45 / 180) * Math.PI
      // cube.position.set(0, 0, 0)
      return cube
    },
    setAxesHelper(scene, y) {
      // 创建一个三维坐标轴
      if (!this.axesHelper) {
        const axesHelper = this.track(new this.THREE.AxesHelper(3))
        axesHelper.myname = 'my-axesHelper'
        axesHelper.position.set(0, y, 0)
        this.axesHelper = axesHelper
        // 坐标对象添加到三维场景中
        scene.add(axesHelper)
      }
    },
    setTestCube(scene, position) {
      //////////////////////////////////////////////////////////////////////////////////////////////
      let cube = this.makeCube('test', false)
      // cube.rotation.x = Math.PI / 2
      // // cube.position.set(0, 0, 0)
      // cube.position.set(0, 2.22 + 0.5, 0)
      cube.position.copy(position)
      //////////////////////////////////////////////////
      scene.add(cube)
      // if (this.controls && this.controls.type) {
      //   this.controls.setObstacles(cube)
      // }

      // const cameraHelper = this.track(new this.THREE.CameraHelper(this.camera))
      // axesHelper.myname = 'my-cameraHelper'
      // // 辅助线加入 场景
      // scene.add(cameraHelper)
      ////////////////////////////////////////////
    },
    testEdges(target) {
      //这个相当于场景中 多了一个 物体，还要去找物体geometry，加载的模型很难找
      // let edgesGeometry = this.track(new this.THREE.EdgesGeometry(target.geometry))
      // edgesGeometry.myname = 'my-edges-geometry'
      // let edgesMaterial = this.track(
      //   new this.THREE.LineBasicMaterial({
      //     color: 0xffffff
      //   })
      // )
      // edgesMaterial.myname = 'my-edges-material'
      // let edges = this.track(new this.THREE.LineSegments(edgesGeometry, edgesMaterial))
      // // edges.lookAt(target)
      // // edges.rotation.lookAt(target)
      // edges.position.copy(target.position.clone())
      // edges.rotation.copy(target.rotation.clone())
      // edgesMaterial.myname = 'my-edges-linesegments'
      // this.scene.add(edges)
    },
    testDash(target) {
      // 旋转 未考虑
      // if (!this.dashLinesBoxTool) {
      //   this.dashLinesBoxTool = new DashLinesBoxTool(this)
      //   let lines = this.dashLinesBoxTool.createDashLinesBoxWithObject(target, 0xabcdef)
      //   target.add(lines)
      // }
    },
    testScale(target) {
      if (
        target.isMesh === true &&
        target.geometry &&
        target.geometry.attributes &&
        target.geometry.attributes.position &&
        target.geometry.attributes.position.count > 0 &&
        target.geometry.index &&
        target.geometry.index.array
      ) {
        return target.scale.clone()
      }
      if (target.children) {
        for (let i = 0; i < target.children.length; i++) {
          let scale = this.testScale(target.children[i])
          if (scale != null) {
            return scale
          }
        }
      }
      return null
    },
    testTarget(target) {
      var worldPosition = this.getVec3()
      target.getWorldPosition(worldPosition)
      console.log('--WorldPosition--', worldPosition)
      target.getWorldScale(worldPosition) //不准，模型有关
      console.log('--WorldScale--', worldPosition)
      let scale = this.testScale(target)
      console.log('--scale--', scale)
      // cube.setfrom
      let size = this.getSize2(target)
      let size2 = this.getSize2(target)
      console.log('--size--', size)
      console.log('--size2--', size2)
    },

    test(loadscene) {
      let self = this
      let group = null

      // group = new this.THREE.Group()
      // group.add(loadscene)

      // let bbox = new this.THREE.Box3().setFromObject(group)
      // let mdlen = bbox.max.x - bbox.min.x //边界的最小坐标值 边界的最大坐标值
      // let mdhei = bbox.max.y - bbox.min.y
      // let mdwid = bbox.max.z - bbox.min.z
      //
      // let width = self.renderer.domElement.clientWidth
      // let height = self.renderer.domElement.clientHeight
      // group.position.set(0, 0, 0)
      //
      // let dist = Math.abs(self.camera.position.z - group.position.z - mdwid / 2)
      // //console.log('dist值为:' + dist );
      // let vFov = (self.camera.fov * Math.PI) / 180
      // //console.log('vFov值为:' + vFov );
      // let vheight = 2 * Math.tan(vFov * 0.5) * dist
      // //console.log('vheight值为:' + vheight );
      // let fraction = mdhei / vheight
      // // console.log('fraction值为:' + fraction );
      // let finalHeight = height * fraction
      // //console.log('finalHeight值为:' + finalHeight);
      // let finalWidth = (finalHeight * mdlen) / mdhei
      // //console.log('finalWidth值为:' + finalWidth );
      //
      // let value1 = width / finalWidth
      // console.log('value1缩放比例值为:' + value1)
      // let value2 = height / finalHeight
      // console.log('value2缩放比例值为:' + value2)
      //
      // if (value1 >= value2) {
      //   group.scale.set(value2, value2, value2)
      // } else {
      //   group.scale.set(value1, value1, value1)
      // }
      // let bbox2 = new this.THREE.Box3().setFromObject(group)
      // let mdlen2 = bbox2.max.x - bbox2.min.x
      // let mdhei2 = bbox2.max.y - bbox2.min.y
      // let mdwid2 = bbox2.max.z - bbox2.min.z
      // group.position.set(
      //   -(bbox2.max.x + bbox2.min.x) / 2,
      //   -(bbox2.max.y + bbox2.min.y) / 2,
      //   -(bbox2.max.z + bbox2.min.z) / 2 - (bbox2.max.z - bbox2.min.z) / 2
      // )

      // let y= this.getSize(group).y
      // let ratio=y/2
      // group.scale.multiplyScalar(1/ratio)
      // group.position.set(0, 0, 0)

      //   self.scene.add(group)
      // let boxhelper = new this.THREE.BoxHelper(group, 0xbe1915) //外面红色框
      // self.scene.add(boxhelper)
      //   console.log('----',this.getSize(group))

      let y = this.getSize(loadscene).y
      let ratio = y / 2
      loadscene.scale.multiplyScalar(1 / ratio)
      console.log('----', this.getSize(loadscene))
      self.scene.add(loadscene)
      let boxhelper = new this.THREE.BoxHelper(loadscene, 0xbe1915) //外面红色框
      self.scene.add(boxhelper)
      console.log('----', this.getSize(loadscene))
    }
  }
}
</script>

<style scoped></style>
