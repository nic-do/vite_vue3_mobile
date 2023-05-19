// 按需引入 插件
import ViteComponents from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
// 可以用来避免一些 import 声明（建议还是带上好）
import AutoImport from 'unplugin-auto-import/vite'
let resolvers = [
  VantResolver() //内部自动根据环境处理 {importStyle:true}
  // include: [/\.vue$/, /\.vue\?vue/, /\.md$/]
]
//有问题，无法使用vite-plugin-style-import （非必要）
//vite-plugin-style-import 用来解决unplugin-vue-components 不能自动引入的vant函数式组件的问题
//依赖 consola
// import { createStyleImportPlugin, VantResolve } from 'vite-plugin-style-import';

const config = function () {
  return [
    // createStyleImportPlugin({
    //   resolves: [VantResolve()],
    // }),
    ViteComponents({ resolvers: resolvers,dts: "unplugin_resolvers/components.d.js", }),

    AutoImport({ //不参与build打包
      dts: 'unplugin_types/auto-imports.d.js',
      imports: ['vue', 'vuex', 'vue-router']
    }),

  ]
}
//注：unplugin-vue-components 按需加载 存在的问题
//1、按需加载与main.js 全量import是二选一的
//2、vant4.2遇到 样式不显示的问题，不能用。 vant4.3.1目前测试正常。
//3、如下某些组件是不会自动引入的，需要全局或局部手动引入
// Vant 中有个别组件是以函数的形式提供的，包括 Toast，Dialog，Notify 和 ImagePreview 组件。
// 在使用函数组件时，unplugin-vue-components 无法自动引入对应的样式，因此需要手动引入样式。
// // Toast
// import { showToast } from 'vant';
// import 'vant/es/toast/style';
//
// // Dialog
// import { showDialog } from 'vant';
// import 'vant/es/dialog/style';
//
// // Notify
// import { showNotify } from 'vant';
// import 'vant/es/notify/style';
//
// // ImagePreview
// import { showImagePreview } from 'vant';
// import 'vant/es/image-preview/style';

export default { config }
