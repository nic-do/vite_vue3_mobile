//注：事先约定好name、path的规则，routes 是可以省略的
var routes = [
  {
    path: '/mainhome',
    name: 'mainhome',
    com: 'module/main/main.vue',
    children: [
      {
        path: '/mainhome/FTab',
        name: 'FTab',
        com: 'module/main/childs/FTab.vue'
      },
      {
        path: '/mainhome/STab',
        name: 'STab',
        com: 'module/main/childs/STab.vue'
      },
      {
        path: '/mainhome/TTab',
        name: 'TTab',
        com: 'module/main/childs/TTab.vue'
      }
    ]
  },
  {
    path: '/list_scroller',
    name: 'list_scroller',
    com: 'module/tests/list_scroller.vue'
  },
  {
    path: '/list_van',
    name: 'list_van',
    com: 'module/tests/list_van.vue'
  },
  {
    path: '/echarts',
    name: 'echarts',
    com: 'module/tests/echarts.vue'
  },
  {
    path: '/data_trans',
    name: 'data_trans',
    com: 'module/tests/data_trans.vue'
  },
  {
    path: '/data_trans_sub',
    name: 'data_trans_sub',
    com: 'module/tests/data_trans_sub.vue'
  },
  {
    path: '/data_trans_sub_next',
    name: 'data_trans_sub_next',
    com: 'module/tests/data_trans_sub_next.vue'
  },
  {
    path: '/Particles',
    name: 'Particles',
    com: 'module/tests/Particles.vue'
  }
]

const getComponent = async function (path) {
  const dics = import.meta.glob(['../views/module/**/*.vue'])
  return dics['../views/' + path]
}
const getRoute = async function (name,path) {
  let flag=false
  for (let i = 0; i < routes.length; i++) {
    let route=routes[i]
    if (name&&path){
      flag=route.name == name&&route.path == path
    }else{
      flag=route.name == name||route.path == path
    }
    if (flag) {
      if (route.component==undefined) {
        if (route.children && route.children.length > 0) {
          for (let j = 0; j < route.children.length; j++) {
            let child = route.children[i]
            let com = child.com
            delete child['com']
            child.component = await getComponent(com)
          }
        }
        let com = route.com
        delete route['com']
        route.component = await getComponent(com)
      }
      return route
    }
  }
  return null
}
export default {getRoute }
