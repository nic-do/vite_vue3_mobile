const getCollisionModel=async (name) =>{
    let lib = await import(`../load/collision/model/${name}.js`).catch((err) => {
        console.log('--THREE-collision-model--', err)
    })
    if (lib.default != undefined) {
        return  lib.default
    }
    return null
}
const getCollisionMgr = async (name) =>{
    let lib = await import(`../load/collision/${name}.js`).catch((err) => {
        console.log('--THREE-collision--', err)
    })
    if (lib) {
        if (lib.default != undefined) {
            return  lib.default
        } else if (name == 'cannon-es') {
            return  lib
        }
    }
    return null
}
const getLoad=async ()=> {
    //必须的
    let load = 'load'
    let lib = await import(`../load/${load}.js`).catch((err) => {
        console.log('--THREE-load--', err)
    })
    if (lib.default != undefined) {
        return lib.default
    }
    return null
}
const getLoader=async (mode)=> {
    //按文件格式 加载 需要的loader
    let libLoader = await import(`../load/loader/${mode}.js`).catch((err) => {
        console.log('--THREE-loader--', err)
    })
    let Loader = libLoader ? libLoader.default : null
    if (Loader) {
        return new Loader()
    }
    return null
}
const getGui=async () =>{
    //gui，非必须
    let guiname = 'gui'
    let libGui = await import(`../load/gui/${guiname}.js`).catch((err) => {
        console.log('--THREE-gui--', err)
    })
    if (libGui.default != undefined) {
        return libGui.default
    }
    return null
}
export default {getLoad,getLoader,getCollisionMgr,getCollisionModel,getGui}