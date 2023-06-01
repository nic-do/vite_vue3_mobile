import {toRaw} from "@vue/reactivity";

export class MiniMap {
    _miniMapCamera = null;
    _miniMapRenderer = null;
    _followTarget = null;

    /**
     * 初始化参数
     * @param {Object} options
     * @options.scene 主场景
     * @options.target 小地图以之为中心点的3D目标
     * @options.mapSize 决定了摄像机看到的内容大小，默认10
     * @options.mapRenderSize 决定了小地图2D平面的大小，默认120
     * @options.mapRotateZ number 小地图沿着Z轴（垂直屏幕）旋转角度，默认0
     * @options.mapSyncRotateZ boolean 小地图沿着Z轴（垂直屏幕）是否跟着一同target旋转，默认false
     */
    constructor(
        options = {
            com,
            target,
            mapSize,
            mapRenderSize,
            mapRotateZ,
            mapSyncRotateZ,
        }
    ) {
        this.com=options.com
        this.THREE=options.com.THREE
        this.scene = options.com.scene;
        this.mapSize = options.mapSize || 10;
        this.mapRenderSize = options.mapRenderSize || 120;
        this.mapRotateZ = options.mapRotateZ || 0;
        this.mapSyncRotateZ = options.mapSyncRotateZ || false;
        this._followTarget = options.target;
        if (!this.scene) {
            throw new Error("scene不能为空");
        }
        if (!this._followTarget) {
            throw new Error("target不能为空，表示小地图画面主要跟随对象");
        }

        this.add();
    }

    add() {
        const { mapSize, mapRenderSize, mapRotateZ } = this;

        // 初始化小地图渲染器
        const mapRenderer =  this.com.track(new this.THREE.WebGLRenderer({ alpha: true })) ;
        mapRenderer.setSize(mapRenderSize, mapRenderSize);
        // mapRenderer.setClearColor(0x7d684f);
        mapRenderer.shadowMap.enabled = true;
        mapRenderer.shadowMap.type = this.THREE.PCFSoftShadowMap;
        // mapRenderer.physicallyCorrectLights = true;
        mapRenderer.useLegacyLights = true;
        // mapRenderer.outputEncoding = this.THREE.sRGBEncoding;
        mapRenderer.outputColorSpace = this.THREE.SRGBColorSpace
        // mapRenderer.toneMapping = ACESFilmicToneMapping; //电影渲染效果
        // mapRenderer.toneMappingExposure = 0.6;
        this._miniMapRenderer = mapRenderer;

        // 设置样式，并添加到HTML
        mapRenderer.domElement.id = "mini-map-canvas";
        mapRenderer.domElement.style.position = "absolute";
        mapRenderer.domElement.style.right = "5px";
        mapRenderer.domElement.style.top = "5px";
        mapRenderer.domElement.style.zIndex = "9999";
        mapRenderer.domElement.style.border = "1px dashed #000";
        mapRenderer.domElement.style.transform = `rotateZ(${mapRotateZ}deg)`;
        mapRenderer.domElement.style.borderRadius = "16px";

        this._miniMapDomEl = mapRenderer.domElement;
        document.body.appendChild(mapRenderer.domElement);

        // 初始化小地图相机
        const mapCamera = this.com.track(new this.THREE.OrthographicCamera(
            -mapSize / 2,
            mapSize / 2,
            mapSize / 2,
            -mapSize / 2,
            1,
            100
        )); //在这种投影模式下，无论物体距离相机距离远或者近，在最终渲染的图片中物体的大小都保持不变。这对于渲染2D场景或者UI元素是非常有用的。
        this._miniMapCamera = mapCamera;

        // 更新地图相机位置和朝向
        this.updateCamera();
    }
    logInfo(){
        this.com.resMgr.logRenderInfo(this._miniMapRenderer,'mini-map')
    }
    updateCamera() {
        // 更新小地图css旋转角度，与玩家同步
        if (this.mapSyncRotateZ) {
            let targetRotateY = this.THREE.MathUtils.radToDeg(this._followTarget.rotation.y);
            this._miniMapDomEl.style.transform = `rotateZ(${
                this.mapRotateZ + targetRotateY
            }deg)`;
        }

        // 更新地图相机位置和朝向
        let targetPos = this._followTarget.position;
        this._miniMapCamera.position.set(
            targetPos.x,
            targetPos.y + 10,
            targetPos.z
        );
        this._miniMapCamera.lookAt(targetPos.x, 3, targetPos.z);
    }

    update() {
        if (this.scene){
            // 更新地图相机位置和朝向
            this.updateCamera();
            let sceneRaw=toRaw(this.scene)
            let cameraRaw=toRaw(this._miniMapCamera)
            // 渲染小地图
            this._miniMapRenderer.render(sceneRaw, cameraRaw);
        }
    }
    dispose(){
        this.THREE=null
        this.scene =null;
        this.com.resMgr.clearRender(this._miniMapRenderer,'mini-map')
        this.com=null
        this.mapSize =  10;
        this.mapRenderSize =120;
        this.mapRotateZ = 0;
        this.mapSyncRotateZ = false;
        this._followTarget = null;
        this._miniMapRenderer=null
    }
}
