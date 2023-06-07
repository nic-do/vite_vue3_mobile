import loaderMap from "@/components/threejs/load/loader-map";
//这里没有引load-help是因为
// 1、loader对象是可以共用的
// 2、这里还有一个全局的 track
const onProgress = function (xhr) {
    if (xhr.lengthComputable) {
        const percentComplete = (xhr.loaded / xhr.total) * 100
        console.log(Math.round(percentComplete, 2) + '% downloaded')
    }
}

const getLoader = async (com,file, materials) => {
    let mLoader = null
    if (com) {
        let suffix = file.split('.')[1]
        let loaderMode = loaderMap[suffix]
        if (!loaderMode) {
            loaderMode = suffix
        }
        mLoader = await com.getLoader(loaderMode)
        if (!mLoader) {
            return null
        }
        if (materials) {
            if (mLoader.setMaterials != undefined) {
                mLoader.setMaterials(materials)
            }
        }
    }
    return mLoader
}
const doLoad = async function (com,mLoader, file) {
    return new Promise(function (resolve) {
        mLoader.load(
            file,
            (obj) => {
                if (obj) {
                    com.track(obj)
                }
                resolve(obj)
            },
            onProgress
        )
    })
}
const loadModule = async (com,file, materials, resolve, resolveall) => {
    let allItems = []
    if (Array.isArray(file)) {
        for (let i = 0; i < file.length; i++) {
            let item = file[i]
            let mLoader = await getLoader(com,item, materials)
            if (!mLoader) {
                if (resolve) resolve(null, file)
            } else {
                let obj = await doLoad(com,mLoader, item).catch((e) => {})
                if (resolveall) {
                    allItems.push({ file: item, obj: obj })
                }
                if (resolve) resolve(obj, item)
            }
        }
        if (resolveall) {
            resolveall(allItems)
        }
    } else {
        let mLoader = await getLoader(com,file, materials)
        if (!mLoader) {
            if (resolve) resolve(null, file)
            return
        }
        let obj = await doLoad(com,mLoader, file).catch((e) => {})
        if (resolve) resolve(obj, file)
        if (resolveall) {
            allItems.push({ file: file, obj: obj })
            resolveall(allItems)
        }
        return Promise.resolve(obj)
    }
    return null
}
window.loadModule=loadModule
export default {loadModule,doLoad,getLoader}