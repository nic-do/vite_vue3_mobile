const fixeUrl = (url) => {
  if (window.__POWERED_BY_WUJIE__) {
    //如果项目作为（无界微前端的子前端）path根目录会变成主工程的路径,需要替换
    url = url.replace(self.location.host, window.$wujie.location.host)
    //console.log('--getAssetsFile-path1-', url)
  }
  return url
}
export { fixeUrl }
