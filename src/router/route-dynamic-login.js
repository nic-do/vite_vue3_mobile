//module下有页面vue,排除目录中含tests目录以及components目录 (业务相关页面)
const dics = import.meta.glob([
  '@/views/module/**/tests/*.vue','@/components/**/tests/*.vue',
])
export default dics
