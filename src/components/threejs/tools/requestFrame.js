const checkRequestAnimationFrame=function (){
    let requestAnimationFrame = window.requestAnimationFrame
    if (typeof requestAnimationFrame === 'undefined') {
        if (typeof webkitRequestAnimationFrame !== 'undefined') {
            window.requestAnimationFrame = webkitRequestAnimationFrame
        } else if (typeof mozRequestAnimationFrame !== 'undefined') {
            window.requestAnimationFrame = mozRequestAnimationFrame
        } else if (typeof msRequestAnimationFrame !== 'undefined') {
            window.requestAnimationFrame = msRequestAnimationFrame
        } else if (typeof requestAnimationFrame === 'undefined') {
            let lastTime = 0
            window.requestAnimationFrame = function (callback, element) {
                let currTime = new Date().getTime()
                let timeToCall = Math.max(0, 16 - (currTime - lastTime))
                let id = setTimeout(function () {
                    callback(currTime + timeToCall)
                }, timeToCall)
                lastTime = currTime + timeToCall
                return id
            }
            window.cancelAnimationFrame = clearTimeout
            console.error('requestAnimationFrame不支持', '转为setTimeout')
        }
    }
}
export {checkRequestAnimationFrame}