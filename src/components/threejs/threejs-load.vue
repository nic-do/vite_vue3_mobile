<template>
  <div ref="canvasRef" id="three" class="three"></div>
</template>

<script>
import { isRef, nextTick, ref, isReactive } from 'vue'
import { toRaw } from '@vue/reactivity'
import Stats from 'three/addons/libs/stats.module'
import ResourceTracker from '@/utils/threejs/track-resource'
import { OrbitControls } from 'three/addons/controls/OrbitControls'
import IS from '@/utils/is'
import { isPromise } from 'vant/es/utils'
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
    'showControls'
  ],
  setup(props, context) {},
  watch: {
    module: {
      deep: true,
      immediate: true,
      handler(newVal, oldVal) {
        if (oldVal != undefined && newVal != undefined) {
          if (this.scene) {
            this.destoryResource()
            this.initFlag = false
            this.init()
          }
        }
      }
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

      scene: null,
      camera: null,
      renderer: null,

      // model: null,
      gui: null,
      mixer: null
    }
  },
  mounted() {
    this.init()
  },
  activated() {
   this.init()
  },
  deactivated() {
    this.destoryResource()
  },
  beforeUnmount() {
    this.destoryResource()
  },
  created() {},
  methods: {
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    init() {
      if (!this.initFlag) {
        this.initFlag = true
        window.addEventListener('resize', this.onWindowResize)
        // 在外层定义resMgr和track
        this.resMgr = new ResourceTracker()
        nextTick(async () => {
          await this.getLoad(this.module.mode)
          this.initScene()
        })
      }
    },
    async getLoad(mode) {
      //必须的
      let load = 'load'
      let lib = await import(`./load/${load}.js`).catch((err) => {
        console.log('--THREE-load--', err)
      })
      if (lib.default != undefined) {
        this.THREE = lib.default
      }
      //gui，非必须
      await this.getGui()
    },
    async getLoader(mode) {
      //按文件格式 加载 需要的loader
      let libLoader = await import(`./load/loader/${mode}.js`).catch((err) => {
        console.log('--THREE-loader--', err)
      })
      return libLoader ? libLoader.default : null
    },
    async getGui() {
      //gui，非必须
      let guiname = 'gui'
      let libGui = await import(`./load/gui/${guiname}.js`).catch((err) => {
        console.log('--THREE-gui--', err)
      })
      if (libGui.default != undefined) {
        this.GUI = libGui.default
      }
      return this.GUI
    },
    destoryResource() {
      try {
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
            this.resMgr.dispose()
          }
          // if (this.model) {
          //   this.model.clear()
          // }
          this.scene.clear()
          this.resMgr.clearRender(this.renderer)

          //cancelAnimationFrame(animationID)
          this.THREE.Cache.clear()

          if (this.stats && this.stats.domElement) {
            this.$refs.canvasRef.removeChild(this.stats.dom)
            this.stats = null
          }
          if (this.clock && this.clock.running) {
            this.clock.stop()
            this.clock = null
          }
          this.controls = null
          this.scene.background = null
          this.scene.fog = null
          this.scene = null
          this.renderer = null
          this.camera = null
          this.gui = null
          this.loader = null
        }
      } catch (e) {
        window.removeEventListener('resize', this.onWindowResize)
      }
    },
    track(val) {
      //option 模式下 需要toRaw解包？
      let res = this.resMgr.track(val)
      if (isRef(res) || isReactive(res)) {
        return toRaw(res)
      }
      return res
    },
    showStats() {
      if (!this.stats) {
        this.stats = new Stats()
        if (this.$refs.canvasRef) {
          this.$refs.canvasRef.appendChild(this.stats.dom)
        }
      }
    },
    animate() {
      if (this.stopAnimate) {
        return
      }
      /////////////////////////////////////////////////////////////
      let delta = null
      if (this.clock) {
        delta = this.clock.getDelta()
      }
      if (IS.isFunction(this.setAnimate)) {
        this.setAnimate(delta, this.camera, this.scene, this.THREE)
      }
      if (delta && this.mixer) {
        this.mixer.update(delta)
      }

      if (this.controls) {
        this.controls.update()
      }

      //////////////////////////////////////////////////////////////////////////////////////
      if (this.renderer) this.renderer.render(toRaw(this.scene), toRaw(this.camera))
      if (this.stats) this.stats.update()
      requestAnimationFrame(this.animate)

      const resizeRendererToDisplaySize = function (renderer) {
        if (renderer) {
          const canvasEl = renderer.domElement
          var width = window.innerWidth
          var height = window.innerHeight
          var canvasPixelWidth = canvasEl.width / window.devicePixelRatio
          var canvasPixelHeight = canvasEl.height / window.devicePixelRatio

          const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height
          if (needResize) {
            renderer.setSize(width, height, false)
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
    },
    getSize(target) {
      if (!this.box3ForSize) {
        this.box3ForSize = new this.THREE.Box3()
      }
      if (!this.v3_ForSize) {
        this.v3_ForSize = new this.THREE.Vector3()
      }
      this.box3ForSize.makeEmpty()
      this.box3ForSize.expandByObject(target)
      this.box3ForSize.getSize(this.v3_ForSize)
      return this.v3_ForSize.clone()
    },
    createCamera() {
      // 创建一个camera用来观看场景里的内容,Three.js提供多种相机，
      // 比较常用的是PerspectiveCamera（透视摄像机）以及OrthographicCamera （正交投影摄像机）。
      let fov = 50,
        aspect = window.innerWidth / window.innerHeight,
        near = 1,
        far = 2000
      let camera = this.track(new this.THREE.PerspectiveCamera(fov, aspect, near, far))
        camera.position.set(-5, 4, 7)
      camera.lookAt(new this.THREE.Vector3(0, 0, 0))
      return camera
    },
    createGround() {
      // ground 地面
      let ground = this.track(
        new this.THREE.Mesh(
          this.track(new this.THREE.PlaneGeometry(2000, 2000)),
          this.track(new this.THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false }))
        )
      )
      ground.rotation.x = -Math.PI / 2
      ground.receiveShadow = true
      //给地面加个网格，好分辨一些
      let grid = this.track(new this.THREE.GridHelper(200, 40, 0x000000, 0x000000))
      grid.material.opacity = 0.2
      grid.material.transparent = true
      return {
        ground: ground,
        grid: grid
      }
    },
    addDirectionalLight(color, intensity, initflag, resolve) {
      let light = this.track(new this.THREE.DirectionalLight(color, intensity))
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
      if (resolve) {
        resolve(light)
      }
      return light
    },
    createLight() {
      //灯光
      // 现在地板有颜色了，还可以添加多个光源，让场景看起来更真实:
      // 半球光光源直接放置于场景之上，光照颜色从天空光线颜色渐变到地面光线颜色。
      let hemLight = this.addHemisphereLight(0xffffff, 0xffffff, 0.6)
      hemLight.position.set(0, 48, 0)
      // 先添加个平行光:
      let dirLight = this.addDirectionalLight(0xffffff, 0.6, false, (light) => {
        //光源等位置
        light.position.set(-10, 8, -5)
        //可以产生阴影
        light.castShadow = true
        light.shadow.mapSize = new this.THREE.Vector2(1024, 1024)
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
    createOrbitControls(dom) {
      if (this.controls == null && this.camera && dom) {
        const controls = new OrbitControls(this.camera, dom)
        if (controls.target) controls.target.set(0, 0, 0)
        this.controls = controls
      }
      return this.controls
    },
    setMixer(target, clipAction) {
      let action = null
      if (target && clipAction) {
        this.mixer = new this.THREE.AnimationMixer(target)
        action = this.mixer.clipAction(clipAction)
      }
      return action
    },
    async initScene() {
      //clock非必要
      this.showStats()
      this.clock = new this.THREE.Clock()
      //首先为Three.js创建一个scene:
      let scene = this.track(new this.THREE.Scene())
      //////////////////////////////////////////////////////////////////////////////////////////////
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
      // let cube = this.track(
      //   new this.THREE.Mesh(
      //     this.track(
      //       new this.THREE.BoxGeometry(1, 1, 1),
      //       this.track(
      //         new this.THREE.MeshBasicMaterial({
      //           color: 0xff0000
      //         })
      //       )
      //     )
      //   )
      // )
      // cube.position.set(0, 0, 0)
      // scene.add(cube)
      // this.cube = cube
      this.scene = scene

      let camera = this.createCamera()
      if (IS.isFunction(this.setCamera)) {
          let res = this.setCamera(camera, this.THREE)
          if (res != undefined) {
              if (isPromise(res)) {
                  camera = await res.catch((e) => {
                  })
              } else {
                  camera = res
              }
          }
      }
      this.camera = camera

      // const cameraHelper = new this.THREE.CameraHelper(camera)
      // // 辅助线加入 场景
      // scene.add(cameraHelper)

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
      if (IS.isFunction(this.setLoadModule)) {
        let res = this.setLoadModule(scene, this.THREE)
        if (res != null) {
          if (isPromise(res)) {
            let result = await res.catch((e) => {})
            if (!result) {
              this.handleModule(scene)
            }
          }
        } else {
          this.handleModule(scene)
        }
      } else {
        this.handleModule(scene)
      }

      //创建一个WebGLRenderer，将canvas和配置参数传入:
      let renderer = this.createRender({ antialias: true }, (renderer) => {
        renderer.shadowMap.enabled = true
      })
      if (IS.isFunction(this.setRender)) {
        let res = this.setRender(renderer)
        if (res != undefined) {
          if (isPromise(res)) {
            renderer = await res()
          } else {
            renderer = res
          }
        }
      }
      if (renderer) {
        this.renderer = renderer
        this.$refs.canvasRef.appendChild(renderer.domElement)

        if (!this.controls && this.showControls) {
          this.getOrbitControls()
        }
      }
      ///////////////////////////////////////////////////////////////////////////////////////////////////////
      this.stopAnimate = false
      requestAnimationFrame(this.animate)
    },
    handleModule(scene) {
      this.loadModule(scene)
    },
    async loadModule(scene) {
      //声明一个加载器，加载我们下载的模型,并把它添加到场景中，在animate函数上面添加代码:
      if (this.loader == undefined) {
        this.loader = await this.getLoader(this.module.mode)
      }
      const tLoader = new this.loader()
      //刷新页面，场景里有了模糊的黑色的小人,没有给她添加纹理。
      const toLoad = (item) => {
        tLoader.load(item, (obj) => {
          let mesh = null
          if (obj.type == 'BufferGeometry') {
            //只是上了一个默认的颜色
            const material = this.track(
              new this.THREE.MeshStandardMaterial({ color: 0x009cff, flatShading: true })
            )
            mesh = new this.THREE.Mesh(obj, material)
          }
          let model = this.track(mesh || obj.scene || obj)
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
    }
  }
}
</script>

<style scoped></style>
