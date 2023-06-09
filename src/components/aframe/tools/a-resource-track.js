import ResourceTracker from '@/components/threejs/tools/track-resource'
import Is from '@/utils/is'
export default class AResourceTracker {
  constructor() {
    this.tracker = new ResourceTracker()
  }
  track(val){
    return this.tracker.track(val)
  }
  async __clearScene(scene) {
    if (scene) {
      // let material = scene.systems?.material
      // if (material && material?.textureCache) {
      //   for (let p in material.textureCache) {
      //     let dd = JSON.parse(p)
      //     let vv = material.textureCache[p]
      //     await vv.then((it) => {
      //       console.log('release-texture', it.uuid + '|' + dd.src)
      //       it.dispose()
      //     })
      //   }
      // }
      if (scene.object3D) {
        this.tracker.track(scene.object3D)
      }
     //  for (let p in scene.systems) {
     //    let vv = scene.systems[p]
     //    if (p == 'geometry') {
     //      for (let cp in vv.cache) {
     //        let cv = vv.cache[cp]
     //        this.tracker.track(cv)
     //      }
     //    } else if (p == 'material') {
     //      for (let cp in vv.materials) {
     //        let cv = vv.materials[cp]
     //        this.tracker.track(cv)
     //      }
     //    }
     //    this.tracker.track(vv)
     //  }
      if (window.AFRAME) {
        this.tracker.dispose(window.AFRAME.THREE)
      }
    }
  }
  // __destory(item) {
  //   if (item.dispose && Is.isFunction(item.dispose)) {
  //     item.dispose()
  //   }
  //   if (item.clear && Is.isFunction(item.clear)) {
  //     item.clear()
  //   }
  //   if (item.destroy && Is.isFunction(item.destroy)) {
  //     item.destroy()
  //   }
  // }
  clearAllScene() {
    if (window.AFRAME != undefined) {
      window.AFRAME.scenes?.forEach((scene) => {
        this.clearRender(scene)
      })
    }
  }
  async clearRender(scene, logTag) {
    let render = scene?.renderer
    await this.__clearScene(scene)
    if (render) {
      this.tracker.clearRender(render, logTag ? logTag : 'a-frame')
    }
    let scenes=window.AFRAME.scenes
    let idx=scenes.indexOf(scene)
    if (idx>=0){
      window.AFRAME.scenes.splice(idx,1)
    }
    if ( scenes.indexOf(scene)==scenes.length-1){
      console.log('--aframe-scenes--',window.AFRAME.scenes.length)
    }
  }
}
