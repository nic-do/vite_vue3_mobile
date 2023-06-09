import TWEEN from 'three/addons/libs/tween.module.js'
const addSpotLight = function (com, position) {
  let spotLight = com.track(new com.THREE.SpotLight(0xffffff, 10))
  if (position) {
    spotLight.position.set(position.x+1.5, 4, position.z-2)
  } else {
    spotLight.position.set(0, 6, 0)
  }
  const loader = new com.THREE.TextureLoader().setPath('textures/')
  const texture = loader.load('disturb.jpg')
  com.track(texture)
  spotLight.angle = Math.PI / 10
  spotLight.penumbra = 1
  spotLight.decay = 2
  spotLight.distance = 10
  // spotLight.map = texture

  spotLight.castShadow = true
  spotLight.shadow.mapSize.width = 1024/10
  spotLight.shadow.mapSize.height = 1024/10
  spotLight.shadow.camera.near = 1
  spotLight.shadow.camera.far = 15
  spotLight.shadow.focus = 1
  let lightHelper = com.track(new com.THREE.SpotLightHelper(spotLight))
  return {
    light: spotLight,
    helper: lightHelper
  }
}
function tweenLight(light, helper) {
  new TWEEN.Tween(light)
    .to(
      {
        angle: Math.random() * 0.7 + 0.1,
        penumbra: Math.random() + 0.2
      },
      Math.random() * 3000 + 2000
    )
    .easing(TWEEN.Easing.Quadratic.Out)
    .start()

  new TWEEN.Tween(light.position)
    .to(
      {
        x: Math.random() * -1.5 + 3,
        y: ( Math.random() * 4 ) +1,
        z: Math.random() * -2 + 2
      },
      Math.random() * 3000 + 2000
    )
    .easing(TWEEN.Easing.Quadratic.Out)
    .start()
  // console.log('----',light.position)
  if (helper) helper.update()
}
const tweenUpdate=function (){
  TWEEN.update();
}
export default { addSpotLight, tweenLight,tweenUpdate }
