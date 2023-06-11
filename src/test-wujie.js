////////////////////无界微前端-主工程/////////////////////////////
import { setupApp, preloadApp, bus } from 'wujie'
const testInit=function (){
    setupApp({
        name: 'trdproject',
        url: '//192.168.3.4:8080/test/trdproject/#/',//为空，会报错，但是程序可以正常跳转
        exec: true,
        sync: true
    })
// preloadApp({ name: 'trdproject' })//会与加载 trdproject的入口index.js
}
export {testInit}