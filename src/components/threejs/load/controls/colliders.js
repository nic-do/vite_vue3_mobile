export class Colliders {
  constructor(THREE) {
    this.datas = []
    this.vector1 = new THREE.Vector3()
    this.vector2 = new THREE.Vector3()
    this.vector3 = new THREE.Vector3()
  }
  add(obj, extra) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        this.datas.push({
          item: item,
          extra: extra
        })
      })
    } else {
      this.datas.push({
        item: obj,
        extra: extra
      })
    }
  }
  octreeRenode(octree, obstacles, THREE) {
    if (octree && obstacles && THREE) {
      if (Array.isArray(obstacles)) {
        for (let i = 0; i < obstacles.length; i++) {
          this.__renode(octree, obstacles[i], THREE)
        }
      } else {
        this.__renode(octree, obstacles, THREE)
      }
      octree.build()
    }
  }

  __renode(octree, collider, THREE) {
    if (collider) {
      if (collider.isGroup) {
        collider.updateWorldMatrix(false, true)
        collider.traverse((obj) => {
          this.renode(octree, obj, THREE)
        })
      } else if (collider.isMesh === true) {
        collider.updateWorldMatrix(false, true)
        let geometry,
          isTemp = false

        if (collider.geometry.index !== null) {
          isTemp = true
          geometry = collider.geometry.toNonIndexed()
        } else {
          geometry = collider.geometry
        }

        const positionAttribute = geometry.getAttribute('position')

        for (let i = 0; i < positionAttribute.count; i += 3) {
          const v1 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i)
          const v2 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 1)
          const v3 = new THREE.Vector3().fromBufferAttribute(positionAttribute, i + 2)

          v1.applyMatrix4(collider.matrixWorld)
          v2.applyMatrix4(collider.matrixWorld)
          v3.applyMatrix4(collider.matrixWorld)

          octree.addTriangle(new THREE.Triangle(v1, v2, v3))
        }
        if (isTemp) {
          geometry.dispose()
        }
      }
    }
  }
}
