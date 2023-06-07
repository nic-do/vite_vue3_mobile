// function load4399Script(type, url) {
//   var element = document.createElement('script')
//   element.setAttribute(type, url)
//   document.getElementsByTagName('head')[0].appendChild(element)
// }
// window.h5api = { initGame: function () {}, progress: function () {} }
// // load4399Script('src', 'https://cdn.h5wan.4399sj.com/h5mini-2.0/dist/static/js/api.js')
// load4399Script('src', 'cdn.h5wan.4399sj.com/h5mini-2.0/dist/static/js/api.js')
/**
 * 获得是否可以播放广告及剩余次数
 * @param {func} callback 回调函数
 * @return boolean 是否可播放
 */
window.h5api.canPlayAd((data)=>{
    console.log("是否可播放广告", data.canPlayAd, "剩余次数", data.remain);
});
/**
 * 播放全屏广告
 * @param callback   播放广告时的广告状态回调函数
 */
window.h5api.playAd((obj)=>{
    console.log("代码:" + obj.code + ",消息:" + obj.message);
    if (obj.code === 10000) {
        console.log("开始播放");
    } else if (obj.code === 10001) {
        console.log("播放结束");
    } else {
        console.log("广告异常");
    }
});

function init4399(loadScriptFunc){
    if (!window.h5api){
        window.h5api = { initGame: function () {}, progress: function () {} }
    }
    if (loadScriptFunc){
        loadScriptFunc('cdn.h5wan.4399sj.com/h5mini-2.0/dist/static/js/api.js')
    }
}
if (!window.ads){
    window.ads={
        api:{}
    }
}
window.ads.api['4399'].canPlayAd=window.h5api.canPlayAd
window.ads.api['4399'].playAd=window.h5api.playAd
window.ads.api['4399'].init=init4399
export default {init4399}