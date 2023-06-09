import Is from '@/utils/is'
export default class ResourceTracker {
  constructor() {
    this.source_track = new Set()
    this.resources = new Set()
  }
  track(resource) {
    this.source_track.add(resource)
    return resource
  }
  __track(resource, THREE, myname) {
    if (!THREE) {
      console.error('ResourceTracker__track', 'some error')
    }
    if (!resource) {
      return resource
    }
    let flag = false
    // handle children and when material is an array of materials or
    // uniform is array of textures
    if (Array.isArray(resource)) {
      resource.forEach((resource) => this.track(resource))
      return resource
    }

    if (resource.dispose && Is.isFunction(resource.dispose)) {
      this.resources.add(resource)
      flag = true
    } else if (resource.clear && Is.isFunction(resource.clear)) {
      this.resources.add(resource)
      flag = true
    } else if (resource.destroy && Is.isFunction(resource.destroy)) {
      this.resources.add(resource)
      flag = true
    } else if (resource instanceof THREE.Object3D) {
      this.resources.add(resource)
      flag = true
    }
    if (resource instanceof THREE.Object3D) {
      this.__track(resource.geometry, THREE, myname)
      this.__track(resource.material, THREE, myname)
      this.__track(resource.children, THREE, myname)
    } else if (resource instanceof THREE.Material) {
      // We have to check if there are any textures on the material
      for (const value of Object.values(resource)) {
        if (
          value instanceof THREE.Object3D ||
          value instanceof THREE.Texture ||
          value instanceof THREE.Material
        ) {
          this.__track(value, THREE, myname)
        } else if (value != undefined && value != null) {
          try {
            if (value.children != undefined && Array.isArray(value.children)) {
              this.__track(value.children, THREE, myname)
            }
          } catch (e) {}
        }
      }
      // We also have to check if any uniforms reference textures or arrays of textures
      if (resource.uniforms) {
        for (const value of Object.values(resource.uniforms)) {
          if (value) {
            const uniformValue = value.value
            if (uniformValue instanceof THREE.Texture || Array.isArray(uniformValue)) {
              this.__track(uniformValue, THREE, myname)
            }
          }
        }
      }
    } else {
      for (const value of Object.values(resource)) {
        if (value != undefined && value != null) {
          try {
            if (value.children != undefined && Array.isArray(value.children)) {
              this.__track(value.children, THREE, myname)
            } else if (
              value instanceof THREE.Object3D ||
              value instanceof THREE.Texture ||
              value instanceof THREE.Material
            ) {
              this.__track(value, THREE, myname)
            }
          } catch (e) {}
        }
      }
    }
    if (!flag) {
      console.log(
        '--not track--',
        resource.uuid + '---' + resource.type + '--myname:' + resource.myname
      )
    }
    return resource
  }
  untrack(resource) {
    this.source_track.delete(resource)
  }
  //只管理了两类实例：1、Object3D实例，2、含dispose() （这里面可能两者都是）
  dispose(THREE) {
    // for (let i = 0; i < this.source_track.length; i++) { let obj = this.source_track[i]
    for (const obj of this.source_track) {
      this.__track(obj, THREE, obj.myname)
    }
    this.source_track.clear()
    let op = null
    console.log('--res-dispose-count--', this.resources.size)
    for (const resource of this.resources) {
      if (resource instanceof THREE.Object3D) {
        // this.traverse(resource)
        if (resource.parent) {
          resource.parent.remove(resource)
        }
      }
      op = null
      if (resource.dispose && Is.isFunction(resource.dispose)) {
        op = ' dispose'
        resource.dispose()
      }
      if (resource.clear && Is.isFunction(resource.clear)) {
        op = ' clear'
        resource.clear()
      }
      if (resource.destroy && Is.isFunction(resource.destroy)) {
        op = ' destroy'
        resource.destroy()
      }
      if (!resource.type) {
        console.info('track-resources', resource)
      }
      console.info('track-resources', 'dispose--' + resource.type + '|--myname:' + resource.myname)
      // if (resource.myname) {
      //   console.error(
      //     'res-dispose-op',
      //     'uuid:' + resource.uuid + '--' + op + '--' + resource.type + '--myname:' + resource.myname
      //   )
      // } else {
      //   console.log(
      //     'res-dispose-op',
      //     'uuid:' + resource.uuid + '--' + op + '--' + resource.type + '--myname:' + resource.myname
      //   )
      // }
    }
    this.resources.clear()
  }
  clearRender(render, logTag) {
    if (render) {
      if (render.info.programs && render.info.programs) {
        // 注：render.info.programs一直无法消除
        // 看源码，deallocateMaterial时会destroy相关program
        // 因此这里强制destroy，也没报错（是否有其他影响有待验证）
        let programs = render.info.programs
        for (let i = programs.length - 1; i >= 0; i--) {
          let program = programs[i]
          program.destroy()
        }
        render.info.programs.splice(0, programs.length)
      }
      render.forceContextLoss()
      render.dispose()
      if (render.domElement){
        let gl = render.domElement.getContext('webgl')
        gl && gl.getExtension('WEBGL_lose_context').loseContext()
        let node = render.domElement.parentNode
        if (node) {
          node.removeChild(render.domElement)
        }
      }
      render.context = null
      render.domElement = null
      render.dom = null
      // canvas.value.removeChild(render.domElement)
      this.logRenderInfo(render, logTag)
    }
  }
  logRenderInfo(render, logTag) {
    render.info.reset()
    console.log((logTag != undefined ? `${logTag}:` : '') + '查看memery字段即可', render.info) //查看memery字段即可
  }
  // traverse(object3D) {
  //   object3D.traverse((child) => {
  //     if (child.geometry) {
  //       child.geometry.dispose()
  //     }
  //     if (child.material) {
  //       if (child.material.map) {
  //         child.material.map.dispose()
  //       }
  //       child.material.dispose()
  //     }
  //     if (child.geometries) {
  //       console.log('--object3D.traverse--', '--child.geometries-')
  //     }
  //     if (child.textures){
  //       console.log('--object3D.traverse--', '--child.textures-')
  //     }
  //     //object3D 外部自行处理
  //     if (object3D != child) {
  //       let txt = null
  //       if (child.dispose) {
  //         //这个会不会把child清空掉，导致无法遍历，有待验证
  //         child.dispose()
  //       }
  //       // if (child.clear) {
  //       // 不能在这里clear， 会把child清空掉，导致无法遍历
  //       //   child.clear()
  //       // }
  //       if (child.destroy) {
  //         //这个会不会把child清空掉，导致无法遍历，有待验证
  //         child.destroy()
  //       }
  //     }
  //   })
  // }
}
