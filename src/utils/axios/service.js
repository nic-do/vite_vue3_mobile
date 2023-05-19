import axios from 'axios'
import {jsonp} from "vue-jsonp";
import { showLoadingToast, closeToast, showConfirmDialog, showNotify } from 'vant'
import { userInfoStore } from '@/stores/userinfo'
let loadObj = null
let requsetCount = 0
let userInfo = null
const resetRequsetCount = function (minus) {
  if (minus) {
    if (requsetCount > 0) {
      requsetCount--
    }
    if (requsetCount <= 0) {
      if (loadObj) {
        // loadObj.closeToast()
        loadObj = null
      }
      closeToast()
    }
  } else {
    if (requsetCount < 0) {
      requsetCount = 0
    }
    requsetCount++
  }
}
// create an axios instance
//
const axios_timeout = 60 * 1000
const service = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: axios_timeout // request timeout
})

let pending = {} //声明一个数组用于存储每个请求的标识
let cancelToken = axios.CancelToken

//
// request interceptor
service.interceptors.request.use(
  (config) => {
    // do something before request is sent
    try {
      //这里抛错直接进入到respone的onRejected 中，此时只有error信息，读不到调用的相关信息
      //这里加一个try cach 目的是把抛错引回的这个方法中，可以读取到config等信息

      //读取用户信息，根据实际情况 修改
      if (userInfo == null) {
        userInfo = userInfoStore()
      }
      if (config) {
        //根据 请求参数，是否显示 loading等待。不管多少个请求 都只显示一个loading
        //loading 会跟随最后一个请求结束 关闭
        //重置 loading的时间 (剩余loading时间 与 新的loading时间进行比较)
        let timeout = config.timeout != undefined ? config.timeout : axios_timeout
        if (config.params && config.params.loading) {
          if (loadObj == null) {
            loadObj = showLoadingToast({
              duration: timeout,
              message: '加载中...',
              forbidClick: true,
              loadingType: 'spinner'
            })
          } else {
            if (loadObj.duration < timeout) {
              loadObj.duration = timeout //重置
            }
          }
        }
      }
      if (userInfo.data) {
        //设置token，根据实际情况 修改
        config.headers['X-Token'] = userInfo.data.token
      }
      resetRequsetCount(false)
      //过滤 api重复的请求，只保留最后一个，过滤的条件就是下面的 key字段
      if (config.url) {
        config.cancelToken = new cancelToken((c) => {
          // pending存放每一次请求的标识，config.url请求路径，config.params参数，config.method请求方法
          let key = config.url.split('?')[0] + '&' + config.method
          let func = pending[key]
          delete pending[key] //在一个axios发送前执行校验取消操作
          pending[key] = c
          if (func) {
            //执行取消操作后，会进入到respone的onRejected 中
            func('重复请求取消')
          }
        })
      }
      return config
    } catch (error) {
      console.log('--request-use--', config)
      return Promise.reject(error)
    }
  },
  (error) => {
    // do something with request error
    //这里几乎不会运行
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
   */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  (response) => {
    const res = response.data

    // console.log('---', response.config)
    resetRequsetCount(true)
    response.config.cancelToken = null
    if (res.code !== 200) {
      //根据实际修改
      checkStatus(response)
      return Promise.reject(res)
    } else {
      // res为正常返回的内容
      return res
    }
  },
  (error) => {
    //重要： 1、interceptors.request.use抛错也会进入这里，处理error时，需要注意
    //      2、取消操作也会进入这里
    let code = error ? error.code : null
    let message = error ? error.message : null
    if (code == 'ERR_CANCELED') {
      // //取消了请求
      resetRequsetCount(true)
      if (message.indexOf('重复请求取消') >= 0) {
        console.log('-----', message)
        return
      }
    }
    //只有是interceptors.response.use抛错时才有response
    let response = error ? error.response : null
    if (response) {
      resetRequsetCount(true)
      console.log('---', response.config)
      response.config.cancelToken = null
      checkStatus(response)
    }
    return Promise.reject(error)
  }
)
function checkStatus(response) {
  try {
    //根据实际修改
    if (response.status === 404) {
      showNotify({ type: 'danger', message: response.statusText + '：' + response.config.url })
    } else if (response.code === 50008 || response.code === 50012 || response.code === 50014) {
      //这里假设： 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      userInfo.setData(null)
      // to re-login
      showConfirmDialog({
        title: '提示',
        message: '您需要重新登陆。'
      })
        .then(() => {
          // location.reload()
        })
        .catch(() => {
          // on cancel
        })
    }
  } catch (e) {
    console.log('--checkStatus--', e)
  }
}
/*
注： 1、必须带上catch 否则Promise.reject 会报错Uncaught (in promise)并中断
       try catch or
       service(...).then.catch or
       let res=await func().catch(err=>{})
    2、标记的根据实际修改 这里需要根据实际业务进行修改
*/
service.jsonp=function (setting) {
  return jsonp(setting.url,setting.data)
}

export default service
