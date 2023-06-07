import ModuleLoad from "@/components/threejs/tests/module-load";
const loadWorld = function (com,worldfile, navfile,mgr,pathFind) {
    // let world_file = '/modules/gltf/collision-world.glb' /modules/gltf/nav.obj
    let THREE = com.THREE
    let world_file = worldfile
    let test_world_file = '/modules/gltf/level.glb'
    return new Promise(function (resolve){
        ModuleLoad.loadModule(com,[world_file, navfile], null, (obj, item) => {
            if (!obj) {
                console.log('loadModule', item + '--get failed')
                return
            }
            let wrap = null
            if (item == world_file) {
                if (worldfile == test_world_file) {
                    const levelMesh = obj.scene.getObjectByName('Cube')
                    const levelMat = com.track(
                        new THREE.MeshStandardMaterial({
                            color: 0x606060,
                            flatShading: true,
                            roughness: 1,
                            metalness: 0
                        })
                    )
                    wrap = com.track(new THREE.Mesh(levelMesh.geometry, levelMat))
                } else {
                    wrap = com.track(obj.scene)
                }
                wrap.myname = 'world-scene'
                wrap.name = 'world'
                // let world = groundPlane
                if (mgr != null) {
                    mgr.setWorld(wrap)
                    mgr.showHelper(true)
                }
                wrap.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true
                        child.receiveShadow = true
                        if (child.material.map) {
                            child.material.map.anisotropy = 4
                        }
                    }
                })
            } else {
                let _navmesh = null
                if (world_file == test_world_file) {
                    _navmesh = obj.scene.getObjectByName('Navmesh_Mesh')
                } else {
                    _navmesh = obj.getObjectByName('Navmesh')
                    _navmesh.position.x = -20
                    _navmesh.position.z = -10
                }
               pathFind.createZone('demo', _navmesh.geometry)
                com.track(_navmesh)
                com.scene.add(pathFind.getHelper())
                //查看线
                // const navWireframe = com.track(
                //   new THREE.Mesh(
                //     _navmesh.geometry,
                //     new THREE.MeshBasicMaterial({
                //       color: 0x808080,
                //       wireframe: true
                //     })
                //   )
                // )
                // com.scene.add(navWireframe);
                //面 透明背景
                let material = com.track(
                    new THREE.MeshBasicMaterial({
                        color: 0xffffff,
                        opacity: 0,
                        transparent: true
                    })
                )
                material.myname = 'nav-material'
                wrap = com.track(new THREE.Mesh(_navmesh.geometry, material))
                wrap.name = 'navmesh'
            }
            if (wrap) {
                com.scene.add(wrap)
            }
            resolve()
        })
    })
}
export default {loadWorld}