// 懒加载：defineAsyncComponent 方法 注：dev可以用，build以后用不了。
import { defineAsyncComponent } from 'vue'
const _import = (path) =>
  defineAsyncComponent(() => import(`/views/${path}.vue`))
var routes = [
  {
    path: '/login',
    name: 'login',
    component: () => _import('module/login/login')
  },
  {
    path: '/main',
    name: 'main',
    component: () => _import('module/main/main'),
    children: [
      {
        path: '/main/FTab',
        name: 'FTab',
        component: () => _import('module/main/childs/FTab')
      },
      {
        path: '/main/STab',
        name: 'STab',
        component: () => _import('module/main/childs/STab')
      },
      {
        path: '/main/TTab',
        name: 'TTab',
        component: () => _import('module/main/childs/TTab')
      }
    ]
  },
  {
    path: '/list_scroller',
    name: 'list_scroller',
    component: () => _import('module/tests/list_scroller')
  },
  {
    path: '/list_van',
    name: 'list_van',
    component: () => _import('module/tests/list_van')
  },
  {
    path: '/echarts',
    name: 'echarts',
    component: () => _import('module/tests/echarts')
  },
  {
    path: '/data_trans',
    name: 'data_trans',
    component: () => _import('module/tests/data_trans')
  },
  {
    path: '/data_trans_sub',
    name: 'data_trans_sub',
    component: () => _import('module/tests/data_trans_sub')
  },
  {
    path: '/data_trans_sub_next',
    name: 'data_trans_sub_next',
    component: () => _import('module/tests/data_trans_sub_next')
  }
]
export default { routes }
