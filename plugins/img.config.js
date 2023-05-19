//图片压缩插件
import viteCompression from 'vite-plugin-compression'
//imagemin 需要系统环境 安装一些库 eg：pngquant等；安装并设置了环境变量也没有成功！！！以后再试试
import viteImagemin from 'vite-plugin-imagemin'
import ImageminWebpPlugin from './vite-imagemin-webp-plugin'
import { resolve } from 'path'

const config = function (val) {
  let configs = []
  if (val) {
    configs.push(
      viteCompression({
        threshold: 10240 // the unit is Bytes
      })
    )
    configs.push(viteImagemin({
        webp:{
            quality: 50,
        },
        gifsicle: {
            optimizationLevel: 7,
            interlaced: false
        },
        optipng: {
            optimizationLevel: 7
        },
        mozjpeg: {
            quality: 20
        },
        pngquant: {
            quality: [0.8, 0.9],
            speed: 4
        },
        svgo: {
            plugins: [
                {
                    name: 'removeViewBox'
                },
                {
                    name: 'removeEmptyAttrs',
                    active: false
                }
            ]
        }
    }))
    // 图片转webp，未完成
    // configs.push(
    //     ImageminWebpPlugin({
    //       test: [
    //         {
    //           rule: /\.(jpe?g|png)/,
    //           options: {
    //             quality: 75,
    //             // lossless: true
    //           }
    //         }
    //       ],
    //       // gifsicle: {
    //       //   // gif
    //       //   interlaced: true,
    //       //   optimizationLevel: 3
    //       // },
    //       // cacheFolder: resolve(__dirname, './imageMinCache'),
    //       overrideExtension: false
    //     })
    // )
  }
  return configs
}

//注：本人的mac环境下，没有压缩成功过，所有错误都发生发生在插件内部 引用其他依赖时
export default { config }
