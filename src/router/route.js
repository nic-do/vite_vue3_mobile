// import Login from '@/views/module/login/login.vue'
var routes = [
  {
    path: '/',
    name: '/',
    redirect:'/login/login'
  },
  // {
  //   path: '/',
  //   name: 'login',
  //   // component: Login
  //   component: () => import('@/views/module/login/login.vue'),
  // },
  // {
  //   path: '/main',
  //   name: 'main',
  //   component: () => import('@/views/module/main/main.vue'),
  //   children: [
  //     {
  //       path: '/main/FTab',
  //       name: 'FTab',
  //       component: () => import('@/views/module/main/childs/FTab.vue')
  //     },
  //     {
  //       path: '/main/STab',
  //       name: 'STab',
  //       component: () => import('@/views/module/main/childs/STab.vue')
  //     },
  //     {
  //       path: '/main/TTab',
  //       name: 'TTab',
  //       component: () => import('@/views/module/main/childs/TTab.vue')
  //     }
  //   ]
  // },
  // {
  //   path: '/list_scroller',
  //   name: 'list_scroller',
  //   component: () => import('@/views/module/tests/list_scroller.vue')
  // },
  // {
  //   path: '/list_van',
  //   name: 'list_van',
  //   component: () => import('@/views/module/tests/list_van.vue')
  // },
  // {
  //   path: '/echarts',
  //   name: 'echarts',
  //   component: () => import('@/views/module/tests/echarts.vue')
  // },
  // {
  //   path: '/data_trans',
  //   name: 'data_trans',
  //   component: () => import('@/views/module/tests/data_trans.vue')
  // },
  // {
  //   path: '/data_trans_sub',
  //   name: 'data_trans_sub',
  //   component: () => import('@/views/module/tests/data_trans_sub.vue')
  // },
  // {
  //   path: '/data_trans_sub_next',
  //   name: 'data_trans_sub_next',
  //   component: () => import('@/views/module/tests/data_trans_sub_next.vue')
  // }
]
export default { routes }
