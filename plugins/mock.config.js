//mock 插件
import mockServer from 'vite-plugin-mock-dev-server'
import path from "node:path";
const config=mockServer({
    prefix: '^/api',//这里会影响mock api路径
    wsPrefix: ['/socket.io'],
    include: 'mock/**/*.mock.{ts,js,cjs,mjs,json,json5}',
    formidableOptions: {
        // 配置上传资源存放目录,如配置错误 影响测试
        // uploadDir: path.join(process.cwd(), './mock_cache'),
        // 可修改上传资源名称
        filename: (name, ext, part) => {
            return part.originalFilename
        },
    },
    // build: true,
})
export default {config}