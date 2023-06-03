export class SkyBox {
  dispose() {
    this.THREE = null
    this.com = null
    this.Sky = null
    this.skyEffect = null
  }
  constructor(com) {
    this.com = com
    this.THREE = com.THREE
    ////////////////////////
    this.Sky = null
    this.skyEffect = {
      turbidity: 10,
      rayleigh: 3,
      mieCoefficient: 0.005,
      mieDirectionalG: 0.7,
      elevation: 2,
      azimuth: 180,
      exposure: 1.0
    }
  }
  track(obj) {
    return this.com.track(obj)
  }
  async getSkyAddon() {
    if (!this.Sky) {
      let load = 'sky-addons'
      let lib = await import(`./${load}.js`).catch((err) => {
        console.log('--sky-addons-load--', err)
      })
      if (lib.default != undefined) {
        this.Sky = lib.default
      }
    }
  }
  ///////////////////////////////////////////
  changeSky(renderer,effect) {
    if (this.sky) {
      let ctrl = this.skyEffect
      if (effect){
        Object.assign(ctrl,effect)
      }
      const uniforms = this.sky.material.uniforms
      uniforms['turbidity'].value = ctrl.turbidity
      uniforms['rayleigh'].value = ctrl.rayleigh
      uniforms['mieCoefficient'].value = ctrl.mieCoefficient
      uniforms['mieDirectionalG'].value = ctrl.mieDirectionalG

      const phi = this.THREE.MathUtils.degToRad(90 - ctrl.elevation)
      const theta = this.THREE.MathUtils.degToRad(ctrl.azimuth)

      this.skySun.setFromSphericalCoords(1, phi, theta)
      uniforms['sunPosition'].value.copy(this.skySun)
      if (renderer){
        renderer.toneMappingExposure = ctrl.exposure
      }else if (this.com.renderer){
        this.com.renderer.toneMappingExposure = ctrl.exposure
      }
    }
  }
  async createSky(scene) {
    await this.getSkyAddon()
    if (this.Sky) {
      if (!this.sky) {
        // Add Sky
        this.sky = this.track(new this.Sky())
        this.sky.myname='Sky'
        this.sky.scale.setScalar(450000)
        this.skySun = new this.THREE.Vector3()
        scene.add(this.sky)
      }
    }
  }
  ///////////////////////////////////////////////////////////
  loadTexture(root, files) {
    if (root && Array.isArray(files)) {
      return this.track(new this.THREE.CubeTextureLoader().setPath(root).load(files))
    }
    return null
  }
  getBoxGeometry(width = 1, height = 1, depth = 1) {
    return this.track(new this.THREE.BoxGeometry(width, height, depth))
  }
  createShader(scene,root, files) {
    if (root && Array.isArray(files)) {
      let texture = this.loadTexture(root, files)
      if (texture) {
        texture.format = this.THREE.RGBAFormat //RGBFormat
        let skyboxShader = this.THREE.ShaderLib['cube']
        skyboxShader.uniforms['tCube'].value = texture
        let geo = this.getBoxGeometry(5000, 5000, 5000)
        let material = this.track(
          new this.THREE.ShaderMaterial({
            fragmentShader: skyboxShader.fragmentShader, //片段着色器
            vertexShader: skyboxShader.vertexShader, //顶点着色器
            uniforms: skyboxShader.uniforms, //是所有顶点都具有相同的值的变量。 比如灯光， 雾，和阴影贴图就是被储存在uniforms中的数据。 uniforms可以通过顶点着色器和片元着色器来访问。
            depthWrite: false, //深度测试
            side: this.THREE.DoubleSide //正反面
            // this.THREE.BackSide //镜像
            // this.THREE.DoubleSide //双面
            /*设置双面，因为你身处在盒子的内部，所以一定要设置双面或者镜像翻转*/
          })
        )
        let skyBox = this.track(new this.THREE.Mesh(geo, material))
        skyBox.name = 'sky-Shader'
        scene.add(skyBox) //在场景中加入天空盒
      }
    }
  }
  createBG(scene,root, files) {
    if (root && Array.isArray(files)) {
      scene.background = this.loadTexture(root, files)
    }
  }
  createBox(scene,root, files) {
    if (root && Array.isArray(files)) {
      //创建盒子，并设置盒子的合适大小
      //1、尺寸要合适
      let skyGeometry = this.getBoxGeometry(500, 500, 500)
      let materials = []
      files.forEach((item) => {
        //let texture = this.track(this.THREE.ImageUtils.loadTexture(root + item))
        let texture=this.track(new this.THREE.TextureLoader().load(root + item))//将图片纹理贴上
        let material = this.track(
          new this.THREE.MeshBasicMaterial({
            map: texture, //将图片纹理贴上
            side:this.THREE.DoubleSide
            // this.THREE.BackSide //镜像
            // this.THREE.DoubleSide //双面
            /*设置双面，因为你身处在盒子的内部，所以一定要设置双面或者镜像翻转*/
          })
        )
        materials.push(material)
      })
      let skyBox = this.track(new this.THREE.Mesh(skyGeometry, materials))
      //创建一个完整的天空盒，填入几何模型和材质的参数
      skyBox.name = 'sky-Box'
      scene.add(skyBox) //在场景中加入天空盒
    }
  }
  test() {
    let root = '/textures/cube/SwedishRoyalCastle/'
    //6个面 右左 上下 前后
    let files = ['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg']
    // this.createBG(this.com.scene,root, files)
    // this.createBox(this.com.scene,root, files)
    // this.createShader(this.com.scene,root, files)
    //
    this.test2()
    //createBG 和 createSky不会被缩放 影响
  }
  async test2(){
    await this.createSky(this.com.scene)
    this.changeSky()
  }
}
