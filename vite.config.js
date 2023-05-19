import fs from 'node:fs' //本地测试用
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuesetupextend from 'vite-plugin-vue-setup-extend'
import vueJsx from '@vitejs/plugin-vue-jsx'
import uppluginConfig from './plugins/unplugin.config'
import vwConfig from './plugins/vw.config'
import imgConfig from './plugins/img.config'
import mockConfig from './plugins/mock.config'
import { visualizer } from 'rollup-plugin-visualizer'
import svgloadConfig from './plugins/svgload.config'

const anlyseBuild = function () {
  if (process.env.npm_lifecycle_event !== 'report') {
    return []
  }
  return [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'report.html'
    })
  ]
}
export default defineConfig(({ command, mode }) => ({
  root: resolve(__dirname, 'src'), //改变了根,多入口需要
  publicDir: resolve(__dirname, 'public'),
  envDir: '../env',
  optimizeDeps: {
    force: false //true 强制进行依赖预构建,忽略缓存node_modules/.vite/deps
  },
  plugins: [
    vue({
      template: {
        img: ['src', 'temp'] //img temp属性 Lazyload-filer的progressive有关
      }
    }),
    vueJsx(),
    vuesetupextend(),
    ...uppluginConfig.config(),
    mockConfig.config,
    ...imgConfig.config(command === 'build'),
    ...anlyseBuild(),
    ...svgloadConfig.config(false)
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src/assets')
    }
  },
  css: {
    postcss: {
      plugins: [...vwConfig.config]
    },
    preprocessorOptions: {
      scss: {
        //全局scss，避免每个scss下手动去引入，可以定义一些全局的变量
        additionalData: '@import "src/assets/scss/global.scss";'
      }
    }
  },
  server: {
    hmr: { overlay: false }, //mock
    // port:8081,
    host: '0.0.0.0',
    // https:true,
    https: {
      key: fs.readFileSync('keys/home2-key.pem'),
      cert: fs.readFileSync('keys/home2-cert.pem')
    },
    proxy: {
      // '/trans/vip': {
      //   //设置跨域
      //   //service的url以/api开头
      //   target: 'http://api.fanyi.baidu.com/api/trans/vip', //目标地址
      //   changeOrigin: true,
      //   //rewrite: (path) => path.replace(/^\/trans\/vip/, '') //替换规则
      // }
    }
  },
  // define 注入的变量， 在 mock文件中也可以使用
  define: {
    __IS_DEVELOPMENT__: JSON.stringify(mode === 'development')
  },
  ///////////////////
  build: {
    assetsInlineLimit: 4096, // 小于此阈值的图片转为图片转 base64,减少http 请求
    outDir: resolve(__dirname, 'dist'), //构建目录
    // 构建目录自动清除
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        secproject: resolve(__dirname, 'src/secproject/index.html'),
        trdproject: resolve(__dirname, 'src/trdproject/index.html')
      },
      output: {
        //非必要，测试
        chunkFileNames: 'static/js/[name]-[hash].js',
        entryFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
      }
    },
    //压缩代码 默认为 Esbuild，它比 terser 快 20-40 倍，压缩率只差 1%-2%。
    minify: 'esbuild' // boolean | 'terser' | 'esbuild'
  },
  esbuild: {
    //去log信息
    // drop: ['console', 'debugger']
    //drop:mode==='production'?['console','debugger']:[]
    // drop: command === 'build' ? ['console', 'debugger'] : []
  }
}))
