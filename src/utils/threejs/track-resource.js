import * as THREE from 'three'
export default class ResourceTracker {
  constructor() {
    this.resources = new Set()
  }
  track(resource) {
    if (!resource) {
      return resource
    }
    let flag = ''
    // handle children and when material is an array of materials or
    // uniform is array of textures
    if (Array.isArray(resource)) {
      resource.forEach((resource) => this.track(resource))
      return resource
    }

    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource)
      flag = true
    }
    if (resource instanceof THREE.Object3D) {
      this.track(resource.geometry)
      this.track(resource.material)
      this.track(resource.children)
    } else if (resource instanceof THREE.Material) {
      // We have to check if there are any textures on the material
      for (const value of Object.values(resource)) {
        if (value instanceof THREE.Texture) {
          this.track(value)
        }
      }
      // We also have to check if any uniforms reference textures or arrays of textures
      if (resource.uniforms) {
        for (const value of Object.values(resource.uniforms)) {
          if (value) {
            const uniformValue = value.value
            if (uniformValue instanceof THREE.Texture || Array.isArray(uniformValue)) {
              this.track(uniformValue)
            }
          }
        }
      }
    }
    if (!flag) {
      console.log('--not track--', resource.type)
    }
    return resource
  }
  untrack(resource) {
    this.resources.delete(resource)
  }
  //只管理了两类实例：1、Object3D实例，2、含dispose() （这里面可能两者都是）
  dispose() {
    for (const resource of this.resources) {
      if (resource instanceof THREE.Object3D) {
       // this.traverse(resource)
        if (resource.parent) {
          resource.parent.remove(resource)
        }
      }
      if (resource.dispose) {
        resource.dispose()
      }
      if (resource.clear) {
        resource.clear()
      }
      if (resource.destroy) {
        resource.destroy()
      }
    }
    this.resources.clear()
  }
  clearRender(render){
    if (render) {
      render.dispose()
      render.forceContextLoss()
      let gl = render.domElement.getContext('webgl')
      gl && gl.getExtension('WEBGL_lose_context').loseContext()
      let node=render.domElement.parentNode
      if (node){
        node.removeChild(render.domElement)
      }
      // canvas.value.removeChild(render.domElement)
      console.log('查看memery字段即可', render.info) //查看memery字段即可
    }
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
