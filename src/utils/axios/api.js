import service from './service'
export async function webCall({ baseURL, url, method, timeout, headers, params, data }) {
  //这里只列出常用参数；其他参数见 axios定义
  if (!headers) {
    headers = { 'Content-Type': 'application/json' }
  }
  return service({
    baseURL,
    url,
    method,
    timeout,
    headers,
    params,
    data
  })
}
export function Get(params, url) {
  return webCall({
    method: 'get',
    url,
    params
  })
}
export function Post(data, url) {
  return webCall({
    method: 'post',
    url,
    data
  })
}
export function Put(id, data, url) {
  return webCall({
    url: (url ? url : '') + id,
    method: 'put',
    data
  })
}
export function Delete(data, id, url) {
  return webCall({
    url: (url ? url : '') + id,
    method: 'delete',
    data
  })
}
export function Update(id, data, url) {
  return webCall({
    url: (url ? url : '') + id,
    method: 'update',
    data
  })
}
export function Jsonp(data, url) {
  return service.jsonp({
    url: url,
    data: data
  })
}
export function UploadFile(file, data, url) {
  if (!file) {
    return Promise.reject(new Error('Error:file is null'))
  }
  let formData = new FormData()
  if (Array.isArray(file)) {
    file.forEach((item,index) => {
      formData.append('file', item,index)
    })
  } else {
    formData.append('file', file)
  }
  if (data){
    formData.append('param',JSON.stringify(data))
  }
  return webCall({
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    url,
    method: 'post',
    data:formData
  })
}
export default { webCall, Get, Post, Delete, Put, Update, UploadFile, Jsonp }

