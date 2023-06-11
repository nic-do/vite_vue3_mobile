const createWS = (url, cb) => {
    const ws = new WebSocket(url)
    ws.onopen = function () {
        console.log(`${url} connected`)
    }
    ws.onmessage = function (e) {
        cb(e.data)
    }
    // 需要服务端响应了才会触发，因此服务器端延时会造成客户端关闭延时
    ws.onclose = function () {
        console.log(`${url} closed`)
    }
    ws.onerror = function (e) {
        console.log(`${url} ${e.msg || 'connect failed'}`)
    }
    return ws
}
export {createWS}