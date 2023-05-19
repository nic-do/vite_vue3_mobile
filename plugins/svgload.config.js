import path from 'path';
import {vitePluginSvg} from "@webxrd/vite-plugin-svg";
// 页面首次加载时 加载所有的svg，可能会影响首次 加载的速度
// 处于禁用状态，若要启用，取消注释即可
const config=function (enable){
    let ds=[]
    if (enable){
        ds.push(
            vitePluginSvg({
            // 必要的。必须是绝对路径组成的数组。
            iconDirs: [
                path.resolve(__dirname, '../src/assets/svg'),
                // path.resolve(__dirname, '@/src/assets/other/icons'),
            ],
            // 必要的。入口script
            main: path.resolve(__dirname, '../src/plugins-libs.js'),
            symbolIdFormat: 'icon-[name]'//注意格式
        }))
    }
    return ds
}
export default {config}