//移动端vw 适配插件
import postcssimport from 'postcss-import'
import postcssurl from 'postcss-url'
import postcsswritesvg from 'postcss-write-svg'
import postcssviewportunits from 'postcss-viewport-units'
import cssnanopresetadvanced from 'cssnano-preset-advanced'
import postcsspxtoviewport from 'postcss-px-to-viewport-8-plugin'
import postcssPresetEnv from 'postcss-preset-env'
import postcssAspectRatioMini from 'postcss-aspect-ratio-mini'
const config = [
  postcsspxtoviewport({
    // 允许媒体查询中转换
    selectorBlackList: [
      'keep-px',
      '.ignore',
      '.hairlines',
      '.caculate-height',
      '.knowledgeScroll',
      '.stick-footer'
    ],
    unitToConvert: 'px',
    viewportWidth: 750, // 使用750px宽度的视觉设计稿，那么100vw = 750px，即1vw = 7.5px
    //viewportHeight: 1334, // 设计稿高度，可以不指定
    // px to vw无法整除时，保留几位小数
    unitPrecision: 5,
    propList: ['*'],
    viewportUnit: 'vw', // 转换成vw单位
    fontViewportUnit: 'vw', // 转换成vw单位
    // 小于1px不转换
    minPixelValue: 1,
    // 允许媒体查询中转换
    mediaQuery: true,
    replace: true,
    exclude: [/node_modules/, /vant/],
    include: [/src/],
    //include: undefined,//[/src/],//如果设置了include，那将只有匹配到的文件才会被转换
    landscape: false, //是否添加根据landscapeWidth生成的媒体查询条件@media(orientation:landscape)
    landscapeUnit: 'vw',
    landscapeWidth: 1334 //横屏时使用的视口宽度
  }),
  postcssviewportunits(),
  postcssimport({
    path: 'src/asset'
  }),
  postcssurl(),
  postcsswritesvg({
    uft8: false
  }),
  cssnanopresetadvanced({
    autoprefixer: true, // 和cssnext同样具有autoprefixer，保留一个
    zindex: false
  }),
  postcssPresetEnv(),
  postcssAspectRatioMini()
]

export default { config }
//备注
// "postcss": //vite内置postcss； postcss扮演一个框架的角色，是一个用javaScript工具和插件转换css代码的工具。postcss将css转换为javaScript可以操作的数据结构。这些数据可以由插件理解和转换，然后处理成各种需要的格式。其本身不对css进行处理，但是通过在该平台上集成插件，如cssnano、postcss-px-to-viewport等，就可以实现对css的处理和操作
// "postcss-preset-env": // 是一个postcss插件,帮助您使用最新的css语法，它将新的css规范转换为更兼容的css,所以你不需要等待浏览器的支持。（之前同功能的postcss-cssnext插件被废弃, 推荐用postcss-preset-env）
// "cssnano": // cssnano是构建于postcss的插件和生态之上的，主要用来压缩和清理css代码，确保最终生成的文件 对生产环境来说体积是最小的
// "cssnano-preset-advanced": // cssnano的高级优化
// "postcss-aspect-ratio-mini":  // 主要用来处理元素容器的固定宽高比
// "postcss-import":// 主要功有是解决@import引入路径问题。使用这个插件，可以让你很轻易的使用本地文件、node_modules或者web_modules的文件。这个插件配合postcss-url让你引入文件变得更轻松
// "postcss-url": // 该插件主要用来处理文件，比如图片文件、字体文件等引用路径的处理。
// "postcss-px-to-viewport":// 自适应的关键所在，将px单位转换为视口单位的 (vw, vh, vmin, vmax) 的postcss插件.如果你的样式需要做根据视口大小来调整宽度，这个脚本可以将你css中的px单位转化为vw，1vw等于1/100视口宽度。
// "postcss-viewport-units":// 插件主要是给css的属性添加content的属性，配合viewport-units-buggyfill库给vw、vh、vmin和vmax做适配的操作。
// "viewport-units-buggyfill"://在main.js中引用； 配合postcss-viewport-units处理兼容问题
// "postcss-write-svg":// 这个库可以让你直接在css中写svg,也是处理移动端1px的解决方案,该插件主要使用的是border-image和background来做1px的相关处理

// 实现自适应最主要的功能实际只需要postcss、postcss-px-to-viewport，其他依赖只是锦上添花或者是为了解决兼容问题，可根据自身情况选择是否安装
// 本文主要介绍配置自适应所需要的插件，其他插件如处理less的less和less-loader等插件，自行研究和下载
