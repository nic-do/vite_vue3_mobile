
const getPlayer = async function (com, Capsule,obj, params, callback) {
    if (!Capsule) {
        let res = await com.getCollisionModel('capsule')
        Capsule = res.Capsule
    }
    //缩放比例 到指定高度
    if (obj && params && params.height > 0) {
        // y / height：表示以高为 height米为准，等比缩放
        let y = com.getSize(obj).y
        let ratio = y / params.height
        obj.scale.multiplyScalar(1 / ratio) //缩放比例
    }
    //生成Capsule
    if (Capsule !== undefined) {
        let objSize = com.getSize(obj)
        //刚好能包围模型 x/z 宽度的 球半径
        let xx = objSize.x
        if (obj && params && params.width > 0) {
            //某些模型 是手张开的，宽度就无法作为 计算半径的标准，需要外部传入
            xx = params.width
        }
        let mx = Math.max(xx, objSize.z)
        let playerH = objSize.y //模型的高，应该是 和 params.height 一致的
        let radius = mx / 2 //Capsule的radius

        //Capsule高度 0.66*2+0.9
        let yy = playerH - 2 * radius //Capsule的height
        //Capsul是上下两个半球+中间一个圆柱
        //这里半球球心的y轴 分别为radius 和 radius+yy
        //圆柱的底部y轴是 radius 顶部是 radius+yy
        //因此实际需要按模型调整，
        let start = new com.THREE.Vector3(0, 0, 0)
        let end = new com.THREE.Vector3(0, yy, 0)
        if (params && params.position) {
            start.copy(params.position)
            end.copy(params.position)
            end.y = params.position.y + yy
        }
        let collider = com.track(new Capsule(start, end, radius))
        collider.myname = 'player-collider'
        let player = null
        ///////////////////////////////////////////////////////////////////////////////
        //octree,如果需要设置成 碰撞体collider or obstacle，需要用这个
        const geometry = com.track(new com.THREE.CapsuleGeometry(radius, yy, 4, 8))
        geometry.myname = 'player-geometry'
        const material = com.track(
            new com.THREE.MeshBasicMaterial({
                color: 0xff0000,
                opacity: 0, //隐藏网格线
                alphaTest: 1, //隐藏网格线
                wireframe: true
            })
        )
        material.myname = 'player-material'
        player = com.track(new com.THREE.Mesh(geometry, material))
        // 不带网格 无法生成octree的 collider or obstacle
        // player = com.track(new com.THREE.Mesh())
        ///////////////////////////////////////////////////////////////////////
        player.myname = 'player'
        player.add(obj)
        player.player = obj
        player.collider = collider
        player.centerY = playerH / 2

        /// 偏移
        player.player.position.y = -playerH / 2
        if (params && params.position) {
            player.position.copy(params.position)
        }
        ///
        if (params && params.tag) {
            let tag = com.getTag(params.tag)
            tag.position.copy(player.position.clone())
            player.tag = tag
            com.scene.add(com.track(tag))
        }
        callback(player)
    }
}

export default {getPlayer}