import fs from 'fs-extra'
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';

// 遍历 build生成（dist文件夹），将rule的图片 生成一份同名的webp图片
// 由于依赖库webp的问题 一直没生成成功；问题 同vite-plugin-imagemin
export default function viteImageminWebp(options) {
  const {
    disable = false,
    // filter = extRE,
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
  } = options;
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
    // 构建阶段的通用钩子：在构建结束后被调用，此处构建只是代表所有模块转义完成
    buildEnd() {
      console.log('--buildEnd--')
    },

    // 输出阶段钩子通用钩子：接受输出参数
    outputOptions(options) {
      console.log('---outputOptions---',options)
    },
    writeBundle: {
      sequential: true,
      order: 'post',
      async handler({ dir }) {
        console.log('--writeBundle--', options)
        try {
          let topLevelFiles = fs.readdirSync(dir)
         await enumFiles(dir, topLevelFiles,options)
        } catch (e) {
          console.log('--writeBundle-e-', e)
        }
      }
    }
  }
}
const defTest= {
  rule: /\.(jpe?g|png)/,
  options: {
    quality: 75
  }
}
async function enumFiles(root, dics,options) {
  for (let i = 0; i < dics.length; i++) {
    let item = dics[i]
    if (item.indexOf('.') < 0) {
      let subRoot = root + '/' + item
      let subDics =fs.readdirSync(subRoot)// await readdir(resolve(subRoot))
      await enumFiles(subRoot, subDics,options)
    } else {
      let path=root+'/'+item
      let idx = item.lastIndexOf('.')
      if (idx > 0) {
        let name = item.substring(0, idx)
        let lowerItem=item.toLowerCase()
        if (options.test&&options.test.length>0){
          for (let j=0;j<options.test.length;j++){
            let ops=options.test[j]
            if ( ops.rule.test(lowerItem)) {
              console.log('-图片-o-', path)
             let buffer= await fs.readFile(path);
             await transToWebp(root+'/'+name,buffer,ops.options)
            }
          }
        }else{
          if (defTest.rule.test(lowerItem)) {
            console.log('-图片-i-', path)
            let buffer= await fs.readFile(path);
            await transToWebp(root + '/' + name, buffer, defTest.options)
          }
        }
      }
    }
  }
  async function transToWebp(name,buffer,options){
    try {
      let content = await imagemin.buffer(buffer, {
        plugins: [imageminWebp(options)],
      });
      // const size = content.byteLength, oldSize = buffer.byteLength;
      var outputPath = name+'.webp';
      console.log('--transToWebp--',outputPath)
      await fs.writeFile(outputPath, content,(err)=>{
        if (err){
          console.log('--transToWebp--',err)
        }
      });
    }catch (e){
      console.log('--transToWebp--',e)
    }
  }
}