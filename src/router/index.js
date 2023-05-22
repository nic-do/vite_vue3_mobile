import { createRouter, createWebHashHistory } from 'vue-router'
import route from './route'
import { keepAliveStore } from '@/stores/keepalive'
import i18n from '@/i18n'
import trackTouchGoBack from './track-touch-goback'
// import { routeStore } from '@/stores/route-store'
const router = createRouter({
  history: createWebHashHistory(),
  routes: route.routes
})

let go = router.go
let back = router.back
let replace = router.replace
let push = router.push
let isForward_replace = null
let isForward = null
let isBack = null
router.push =async function (to) {
  let res=await router.checkAndSetRoute(to)
  if (!res.flag) {
    return false
  }
  isForward = true
  push.call(this, to)
  return true
}
router.replace =async function (to) {
  let res=await router.checkAndSetRoute(to)
  if (!res.flag) {
    return false
  }
  isForward = true
  isForward_replace = true
  replace.call(this, to)
  return true
}
router.back = function () {
  isBack = true
  trackTouchGoBack.reset()
  back.call(this)
}
router.go = async function (num) {
  isBack = true
  trackTouchGoBack.reset()
  go.call(this, num)
}
let goBackResult = null
router.goBack =async function (name, param) {
  let dxToGo = name
  if (!Number.isInteger(name)) {
    let res=await router.checkAndSetRoute({name:name})
    if (!res.flag) {
      return false
    }
    if (res.needReplace){
      //一般是刷新页面，丢失了 前进后退的关系
      if (param) {
        goBackResult = {}
        goBackResult[name] = param
      } else {
        goBackResult = null
      }
      router.replace({
        name:name
      })
      return
    }
    let toidx = keepAliveStore().data.indexOf(name)
    let idx = keepAliveStore().data.indexOf(this.currentRoute.value.name)
    dxToGo = toidx - idx
  } else {
    if (dxToGo >= 0) {
      return false
    }
    let idx = keepAliveStore().data.length + dxToGo - 1
    if (idx < 0) {
      return false
    }
    name = keepAliveStore().data[idx]
  }
  if (param) {
    goBackResult = {}
    goBackResult[name] = param
  } else {
    goBackResult = null
  }
  if (dxToGo < 0) {
    if (dxToGo == -1) {
      go(-1)
    } else {
      go(dxToGo)
    }
  }
}
function clearState() {
  //清理临时状态
  isForward = null
  isBack = null
  isForward_replace = null
  goBackResult = null
}
function clearGoBackResult(to) {
  delete to.params['goBackResult']
  delete history.state['goBackResult']
}
////////////////////////动态加载route----begin
// 1、全局import 这个方式会在页面打开时几就加载
// import routeAsync from './route-dynamic'
let routeAsync=null
router.addDynamicRoute = async function (to) {
  //2、按需加载
  //需要时才加载，例子里时在 点击登录时才加载，不会重复加载，除非刷新里页面
  const moudle = import.meta.glob(`./route-dynamic.js`)
  if (moudle&&moudle['./route-dynamic.js']){
    let text=await moudle['./route-dynamic.js']()
    routeAsync=text.default
  }
  if (routeAsync){
    let it=await routeAsync.getRoute(to.name,to.path)
    if (it){
      router.addRoute(it)
      /////routeStore().addData(it)
      return it
    }
  }
  return null
}
router.hasRoutePath= function (name,path){
  let allroutes=router.getRoutes()
  for (let i=0;i<allroutes.length;i++){
    let it=allroutes[i]
    if (name&&name==it.name){
      return it
    }else if (path&&it.path==path){
      return it
    }
  }
  return null
}
router.checkAndSetRoute= async function (to){
  let find=true
  let needReplace=false
  if (!router.hasRoutePath(to.name, to.path)) {
    //加载全部route
    await router.addDynamicRoute(to)
    find = !!router.hasRoutePath(to.name, to.path)
    needReplace=true
  }
  return {flag:find ,needReplace:needReplace}
}
////////////////////////动态加载route----end
router.beforeEach(async (to, from, next) => {
  //初始化语言，不会重复初始化
  await i18n.init()
  if (window.location.href.indexOf('/login#/') > 0) {
    clearState()
    clearGoBackResult(to)
    // 假如 '/' 对应的是 login，浏览器 手势来回 切换页面 会出现这种异常路径。强制 转登录页面
    window.location.href = window.location.origin + '/#/'
    next(false)
    return
  }
  ////////////////////////动态加载route----begin
  let toname = to.name
  let topath = to.path
  if (!router.hasRoutePath(toname,topath)) {
    //加载全部route
    await router.addDynamicRoute(to)
    let find= router.hasRoutePath(toname,topath)
    if (find) {
      //二次检验，假设 数据是state.data,这里预定好规则应该没问题
      //因为to里缺少match信息，直接重新push简单一些
      router.push({
        name:find.name,
        state:{
          data:history.state.data
        }
      })
    }
    next(false)
    return
  }
  ////////////////////////动态加载route----end
  if (
    (to.path == '/' || to.path == '/login') &&
    (isForward == null || from.href === '' || from.href == undefined)
  ) {
    //逻辑：见'页面keepalive逻辑及刷新崩溃可能引起的问题处理.txt'--总结4
    //清空keepalive
    keepAliveStore().removeAll()
    clearGoBackResult(to)
  } else {
    //逻辑：见'页面前进后退判断逻辑.txt'
    //以下两个状态在pageAnimation中使用，不可删除
    //页面切换前记录位置状态，界面切换后恢复 scroll位置用到
    from._lastScrollY = window.scrollY || window.pageYOffset || document.body.scrollTop
    from._lastScrollX = window.scrollX || window.pageXOffset || document.body.scrollLeft
    //通过push replace go方法加载页面时，记录的前进后退状态，用来判断是否需要keepalive以及切换的动画类型
    to.isForward = isForward
    to.isBack = isBack
    // isForward=null
    // isBack=null

    //逻辑：见'页面切换传参.txt'
    //回退页面时，缓存的回退数据
    if (goBackResult && goBackResult[to.name]) {
      to.params.goBackResult = goBackResult[to.name]
      history.state.goBackResult = to.params.goBackResult
    } else {
      clearGoBackResult(to)
    }
  }
  if (isForward_replace) {
    //逻辑：见'页面keepalive逻辑及刷新崩溃可能引起的问题处理.txt'--总结2
    //删除from页面
    keepAliveStore().removeData(from.name)
  }
  clearState()
  if (!to.matched || to.matched.length <= 0) {
    next(false)
    console.log('--router--', `跳转的页面[name:${to.name}---path:${to.path}]不存在`)
    console.error('--router--', `跳转的页面跳转的页面[name:${to.name}---path:${to.path}]不存在`)
    return
  }
  next()
})
// 时间触发比 全局前置守卫慢些
router.beforeResolve((to, from, next) => {
  // 全局解析守卫
  // console.log('beforeResolve-to',from.name+'-'+to.name)
  next()
})

router.afterEach((to, from) => {
  console.log('afterEach-to', from.name + '-' + to.name)
  // 全局后置守卫、钩子
})
export default { router }
