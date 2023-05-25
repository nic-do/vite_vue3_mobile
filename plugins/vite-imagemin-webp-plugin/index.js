import fs from 'fs-extra'
import sharp from 'sharp'
// 遍历 build生成（dist文件夹），将rule的图片 生成一份同名的webp图片
// 由于依赖库webp的问题 一直没生成成功；问题 同vite-plugin-imagemin
export default function viteImageminWebp(options) {
  const {
    disable = false,
    verbose = true,
    test = [
      {
        rule: /\.(jpe?g|png)/,
        options: {
          quality: 75
        }
      }
    ],
    overrideExtension = true,
    detailedLogs = false,
    strict = true,
    silent = false
  } = options
  return {
    name: 'vite:imagemin-webp',
    apply: 'build',
    enforce: 'post',
    config(config, { command }) {
      console.log('config', '这里是config钩子--command:' + command)
      if (command === 'build') {
        config.logLevel = 'silent'
      }
    },
    load:{
      async handler(id,option) {
      }
    },
    // 构建阶段的通用钩子：在构建结束后被调用，此处构建只是代表所有模块转义完成
    buildEnd() {
      console.log('--buildEnd--')
    },
    // 输出阶段钩子通用钩子：接受输出参数
    outputOptions(options) {
      // console.log('---outputOptions---', options)
    },
    renderStart(outputOptions, inputOptions) {
      //：每次 bundle.generate 和 bundle.write 调用时都会被触发；
      console.log('---renderStart---')
    },

    augmentChunkHash(chunkInfo) {
      //：用来给 chunk 增加 hash；
    },
    renderChunk(code, chunk, options) {
      //转译单个的chunk时触发。rollup 输出每一个chunk文件的时候都会调用；
    },
    transform(code, id, opt) {
    },
    generateBundle(options, bundle, isWrite) {
      //：在调用 bundle.write 之前立即触发这个 hook；
      // console.log('---generateBundle---', options)
    },
    writeBundle: {
      sequential: true,
      order: 'post',
      async handler(OutputOptions, bundle) {
        let dir = OutputOptions.dir
        // console.log('--writeBundle--', options)
        try {
          let topLevelFiles = fs.readdirSync(dir)
          await enumFiles(dir, topLevelFiles, options)
        } catch (e) {
          console.log('--writeBundle-e-', e)
        }
      }
    }
  }
}
const defTest = {
  rule: /\.(jpe?g|png)/,
  options: {
    quality: 75
  }
}
async function enumFiles(root, dics, options) {
  for (let i = 0; i < dics.length; i++) {
    let item = dics[i]
    if (item.indexOf('.') < 0) {
      let subRoot = root + '/' + item
      let subDics = fs.readdirSync(subRoot) // await readdir(resolve(subRoot))
      await enumFiles(subRoot, subDics, options)
    } else {
      let path = root + '/' + item
      let idx = item.lastIndexOf('.')
      if (idx > 0) {
        let name = item.substring(0, idx)
        let lowerItem = item.toLowerCase()
        if (options.test && options.test.length > 0) {
          for (let j = 0; j < options.test.length; j++) {
            let ops = options.test[j]
            if (ops.rule.test(lowerItem)) {
              // console.log('-图片-o-', path)
              let buffer = await fs.readFile(path)
              await transToWebp(root + '/' + name, buffer, ops.options)
            }
          }
        } else {
          if (defTest.rule.test(lowerItem)) {
            // console.log('-图片-i-', path)
            let buffer = await fs.readFile(path)
            await transToWebp(root + '/' + name, buffer, defTest.options)
          }
        }
      }
    }
  }
  async function transToWebp(name, buffer, options) {
    try {
      const content = await sharp(buffer).webp(options).toBuffer()
      var outputPath = name + '.webp'
      await fs.writeFile(outputPath, content, (err) => {
        if (err) {
          console.log('--transToWebp--', err)
        }
      })
    } catch (e) {
      console.log('--transToWebp--', e)
    }
  }
}
