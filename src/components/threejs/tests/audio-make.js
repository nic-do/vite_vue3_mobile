import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper'
import ModuleLoad from '@/components/threejs/tests/module-load'
const positionAudio = function (com, el, callback) {
  let audio = com.createAudio(true)
  if (audio) {
    audio.setMediaElementSource(el)
    audio.setRefDistance(1)
    audio.setDirectionalCone(180, 230, 0.1)
    const helper = com.track(new PositionalAudioHelper(audio, 0.1))
    audio.add(helper)
    // if (positionAudio) {
    //     controls.player.add(positionAudio)
    // }
    ModuleLoad.loadModule(com, 'modules/gltf/BoomBox.glb', null, (obj, item) => {
      const boomBox = obj.scene
      boomBox.position.set(-1.4,0.9, 0)
      boomBox.scale.set(20, 20, 20)
      boomBox.traverse(function (object) {
        if (object.isMesh) {
          object.geometry.rotateY(-Math.PI)
          object.castShadow = true
          object.receiveShadow = true
        }
      })
      boomBox.myname = 'BoomBox'
      com.track(boomBox)
      // com.lodLevel(boomBox, 5)
      // com.scene.add(boomBox)

      //必须调用
      // positionMusicRef.value.play()
      callback(boomBox)
    })
  }
  return audio
}

const testmmdAudio = async function (com, audio, positionMode, callback) {
  let url = '/audio/mmd/miku/miku_v2.pmd'
  let mLoader = await ModuleLoad.getLoader(com, url, null)
  if (mLoader) {
    let helper = await com.getLoader('mmd-ani-helper')
    let mesh = await ModuleLoad.doLoad(com, mLoader, url).catch((e) => {})
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
                  mesh.castShadow = true
                  mesh.receiveShadow = true
                  mesh.scale.set(0.1, 0.1, 0.1)
                  //调整初始位置
                  let tag = {
                    type: '3d',
                    useSprite: true,
                    name: '我是npc' }
                  let params = { height: 1,
                    noPlayer: true,
                    position: com.getVec3().set(1, 0.49, -2),
                    tag: tag }
                  // if (nav_file == '/modules/gltf/nav.obj')
                  {
                    params.height = 1.7
                    params.position.y = -0.88
                  }
                  mesh.myname = 'mmd-aduio-obj'

                  callback({
                    mesh: mesh,
                    params: params,
                    helper: helper
                  })
                }
                if (positionMode) {
                  if (audio) {
                    com.loadAudioFile('/audio/mmd/audios/wavefile_short.mp3', (buffer) => {
                      audio.setBuffer(buffer)
                      audio.setRefDistance(1)
                      audio.setDirectionalCone(180, 230, 0.1)
                      const helper2 = com.track(new PositionalAudioHelper(audio, 0.1))
                      audio.add(helper2)
                      helper.add(audio, { delayTime: (160 * 1) / 30 })
                      addToControl()
                    })
                  }
                } else {
                  com.loadAudioFile('/audio/mmd/audios/wavefile_short.mp3', (buffer) => {
                    audio.setBuffer(buffer)

                    helper.add(audio, { delayTime: (160 * 1) / 30 })
                    addToControl()
                  })
                }
              },
              (xhr) => {
                if (xhr.lengthComputable) {
                  const percentComplete = (xhr.loaded / xhr.total) * 100
                  console.log(Math.round(percentComplete, 2) + '% downloaded')
                }
              }
            )
          }
        })
      }
    }
  }
}
const mmdAudio = function (com, positionMode, callback) {
  let audio = com.createAudio(positionMode)
  testmmdAudio(com, audio, positionMode, callback)
  return audio
}
export default { positionAudio, mmdAudio }
