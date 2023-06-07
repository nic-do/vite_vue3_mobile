if (!window.ads){
  window.ads={
    api:{}
  }
}
window.ads['tx'].type_banner=function (params, carousel, containerid) {
  params['display_type'] = 'banner' // 播放类型: banner广告
  return {
    // placement_id:placement_id,
    // app_id:app_id,
    // type: 'native',
    // display_type: 'banner', // 播放类型: banner广告
    ...params,
    carousel, // 轮播时间，> 3000数字类型，否则轮播会被取消
    containerid, // 广告容器
    onComplete: function (res) {
      if (res.ret == 0) {
        console.log('广告播放成功')
      } else {
        console.log('广告播放失败')
      }
    }
  }
}
window.ads['tx'].type_insertScreen=function(params, count) {
  params['display_type'] = 'interstitial' // 播放类型：插屏
  return {
    ...params,
    count, //拉取广告的数量，必填，默认是3，最高支持10
    onComplete: function (res) {
      if (res && res.ret === 0) {
        TencentGDT.NATIVE.renderAd(res.data[0])
      } else {
        // 加载广告API，当广告使用完成，或无广告，可使用loadAd再次拉取广告
        // 注意：拉取广告频率每分钟不要超过20次，否则会被广告接口过滤，影响广告位填充率
        setTimeout(function () {
          TencentGDT.NATIVE.loadAd(placement_id)
        }, 3000)
      }
    }
  }
}
window.ads['tx'].type_rewardVideo=function (params) {
  delete params['display_type']
  params['type'] = 'rewardVideo' // 类型：激励视频
  return {
    ...params,
    onComplete: function (res) {
      // Function，广告位初始化回调方法，已激励视频接入为例
      if (res.code == 0) {
        //大概是成以后，在任意地方 调用以下 方法
        // 激励视频实例化，注意：插屏广告、模板广告方位为：renderAd
        let video = new window.TencentGDT.NATIVE.rewardVideoAd(function (res) {
          // 激励视频回调参数
          console.log(res)
        })
        // 激励视频加载方法
        video.loadAd()
        // 激励视频播放方法
        video.showAd()
      }
    }
  }
}
window.ads['tx'].type_templateAd=function(params, containerId, count) {
  return {
    ...params,
    count, //拉取广告的数量，必填，默认是3，最高支持10
    onComplete: function (res) {
      if (res && res.constructor === Array) {
        // 原生模板广告位调用 window.TencentGDT.NATIVE.renderAd(res[0], 'containerId') 进行模板广告的渲染
        // res[0] 代表取广告数组第一个数据
        window.TencentGDT.NATIVE.renderAd(res[0], containerId)
      } else {
        // 加载广告API，当广告使用完成，或无广告，可使用loadAd再次拉取广告
        // 注意：拉取广告频率每分钟不要超过20次，否则会被广告接口过滤，影响广告位填充率
        setTimeout(function () {
          window.TencentGDT.NATIVE.loadAd(params.placement_id)
        }, 3000)
      }
    }
  }
}
window.ads['tx'].type_originTemplateAd=function(params, containerId, count) {
  return {
    ...params,
    count, //拉取广告的数量，选填，默认是3，最高支持10
    onComplete: function (res) {
      if (res && res.ret === true) {
        // 此次回调中没有广告信息，开发者自行决定是否填充自己的广告
        let data = res.data[0] // 第0条广告
        //自行处理展示，自行处理 有效曝光反馈 及 用户点击反馈 给腾讯，如下两个接口
        //说明：http://developers.adnet.qq.com/doc/web/self_render_ad
        //广告满足有效曝光条件(曝光曝光面积==50%，并且停留时长>=1s)时，需要进行曝光上报。
        //window.TencentGDT.NATIVE.doExpose(obj);//曝光上报
        //当广告被有效点击后，需要调用点击上报接口，进行点击上报
        //window.TencentGDT.NATIVE.doClick(obj);
      } else {
        // 加载广告API，当广告使用完成，或无广告，可使用loadAd再次拉取广告
        // 注意：拉取广告频率每分钟不要超过20次，否则会被广告接口过滤，影响广告位填充率
        setTimeout(function () {
          TencentGDT.NATIVE.loadAd(params.placement_id)
        }, 3000)
      }
    }
  }
}
window.ads['tx'].params=function (placement_id, app_id) {
  return {
    placement_id,
    app_id,
    type: 'native' //native
  }
}
window.ads['tx'].addTypes=function (ads) {
  //上面5种 type，在ylhInit-addTypesFunc里调用
  window.TencentGDT.push(...ads)
}

window.ads['tx'].init=function (addTypesFunc, loadScriptFunc) {
  //step 说明：见http://developers.adnet.qq.com/doc/web/js_develop
  if (!window.TencentGDT) {
    //step 1:
    window.TencentGDT = window.TencentGDT || []
    //step 2:
    if (addTypesFunc) {
      addTypesFunc()
    }
    // addTypes()
  }
  //step 3
  //load script
  if (loadScriptFunc) {
    loadScriptFunc('//qzs.gdtimg.com/union/res/union_sdk/page/h5_sdk/i.js')//优量汇
  }
}

window.ads['tx'].initSw=function (loadScriptFunc) {
  if (!window._gdtUnSdk){
    // 试玩广告实例化
    window._gdtUnSdk = new window.GDTUnSdk({
      type: 'playable', // String - 类型：试玩广告，必填
      onSuccess: function (res) {
        console.log(res) // 点击成功回调
      },
      onError: (res) => {
        console.log(res) // 异常回调方法
      }
    })
  }

  if (!window.ads['tx'].clickSw){
    // 注意：如下调用是 在需要点击转化的时候，由开发者主动调用点击上报方法
    window.ads['tx'].clickSw = () => {
      window._gdtUnSdk && window._gdtUnSdk.playAble.onClick()
    }
  }
  if (loadScriptFunc){
    loadScriptFunc('//qzs.gdtimg.com/union/res/union_sdk/page/unjs/unsdk.js')//优量汇-试玩广告
  }
}
export default window.ads