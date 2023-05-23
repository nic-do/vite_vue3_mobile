//module下有页面vue,排除目录中含tests目录以及components目录 (业务相关页面)
import { routeStore } from '@/stores/route-store'

const dics = import.meta.glob([
  '@/views/module/**/*.vue', //一开始就要加载的 页面
  '!@/views/module/**/childs/*.vue', //children 分开到dics_childs，方便查找
  '!@/views/module/**/tests/*.vue', //此处排除，测试登录后加载
  '!@/views/module/**/components/**/*.vue' //组件目录
])
//children
const dics_childs = import.meta.glob(['@/views/module/**/childs/*.vue'])

//global/views下所有页面vue，业务无关页面，假如有的话
const dics_global = import.meta.glob([
  '@/global/views/**/*.vue', //通用页面
  '!@/global/views/**/childs/*.vue' //children 分开到dics_global_childs，方便查找
])
//children
const dics_global_childs = import.meta.glob(['@/global/views/**/childs/*.vue'])

const makeRoute = function (key, com) {
  let keys = key.split('/')
  let name = keys[keys.length - 1].replace('.vue', '')
  let path = key.replace('.vue', '')
  let path0 = path
  let component = com
  if (key.indexOf('/views/module/') >= 0) {
    path = path.split('/views/module/')
    path = path[path.length - 1]
    if (path.indexOf('/') < 0) {
      //路径不含'/'是有问题的，替换为全路径
      path = path0
    } else if (path.indexOf('/') != 0) {
      //路径首字符不是'/'是有问题的
      path = '/' + path
    }
  }

  return {
    name: name,
    path: path,
    component: component
  }
}
const fromDics = function (val, keys) {
  if (val) {
    let route = null
    let path0 = null
    let childs = null
    for (let key in keys ? keys : val) {
      route = makeRoute(key, val[key])
      path0 = key.replace(route.name + '.vue', '')
      if (key.indexOf('/global/views/') >= 0) {
        childs = dics_global_childs
      } else if (key.indexOf('/views/module/') >= 0) {
        childs = dics_childs
      }
      for (let childKey in childs) {
        if (childKey.indexOf(path0 + 'childs') == 0) {
          if (route.children == undefined) {
            route.children = []
          }
          route.children.push(makeRoute(childKey, childs[childKey]))
        }
      }
      let duplicate = false
      for (let i = 0; i < allroutes.length; i++) {
        if (allroutes[i].name == route.name) {
          duplicate = true
          break
        }
      }
      if (!duplicate && route.component !== undefined) {
        console.log('--route-dics--', key)
        allroutes.push(route)
      }
    }
  }
}
let allroutes = []
import dics_loginRoute from './route-dynamic-login'
//注：这里设定的页面vuew原则：1、文件名及name 所以文件名不可以重复 2、path 使用 module 之下后的相对路径
const getRoutes = function () {
  if (allroutes.length <= 0) {
    fromDics(dics)
    fromDics(dics_global)
  }
  let len = allroutes.length
  let data=routeStore().data
  if (data&&data.length > 0) {
    let keys={}
    for (let i=0;i<data.length;i++){
      keys[data[i]]=''
    }
    fromDics(dics_loginRoute, keys)
    if (allroutes.length == len) {
      //没变化，缓存应该是有问题的
      routeStore().clearData()
    }
  }
  return allroutes
}
export default { getRoutes, fromDics }
