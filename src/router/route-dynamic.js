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

const dics = import.meta.glob(['../views/module/**/*.vue'])//module下所有vue
const getRoutes = function () {
  let allroutes = []
  for (let i = 0; i < routes.length; i++) {
    let route = routes[i]
    if (route.component === undefined) {
      if (route.children!=undefined && route.children.length > 0) {
        for (let j = 0; j < route.children.length; j++) {
          let child = route.children[j]
          let com = child.com
          delete child['com']
          // child.component = await getComponent(com)
          child.component =dics['../views/' + com]
        }
      }
      let com = route.com
      delete route['com']
      // route.component = await getComponent(com)
      route.component =dics['../views/' + com]
    }
    allroutes.push(route)
  }
  return allroutes
}
export default { getRoutes }
