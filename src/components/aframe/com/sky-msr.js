export class SkyMgr {
  dispose() {}
  constructor() {
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
  ///////////////////////////////////////////
  changeSky(sky, effect) {
    let THREE = window.AFRAME.THREE
    let ctrl = this.skyEffect
    if (effect) {
      Object.assign(ctrl, effect)
    }
    if (sky?.material) {
      const uniforms = sky.material.uniforms
      uniforms['turbidity'].value = ctrl.turbidity
      uniforms['rayleigh'].value = ctrl.rayleigh
      uniforms['mieCoefficient'].value = ctrl.mieCoefficient
      uniforms['mieDirectionalG'].value = ctrl.mieDirectionalG

      const phi = THREE.MathUtils.degToRad(90 - ctrl.elevation)
      const theta = THREE.MathUtils.degToRad(ctrl.azimuth)
      let skySun = new THREE.Vector3()
      skySun.setFromSphericalCoords(1, phi, theta)
      uniforms['sunPosition'].value.copy(skySun)
    }

    // if (renderer) {
    //   renderer.toneMappingExposure = ctrl.exposure
    // }
  }
}
