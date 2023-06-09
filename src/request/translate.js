import { Jsonp } from '@/utils/axios/api'
import { MD5 } from '@/utils/encript/md5' //百度翻译 用到
import { SHA256 } from '@/utils/encript/sha256/sha256' //有道翻译 用到
function truncate(q) {
  //有道翻译 用到
  var len = q.length
  if (len <= 20) return q
  return q.substring(0, 10) + len + q.substring(len - 10, len)
}
function getSign(q, type) {
  if (type == 'baidu') {
    let appid = '' //
    let secretkey = '' //注意：暴露appSecret，有被盗用造成损失的风险
    let salt = new Date().getTime()
    let sign = MD5(appid + q + salt + secretkey)
    return {
      salt: salt,
      appid: appid,
      sign: sign
    }
  } else if (type == 'youdao') {
    let appid = ''
    let key = '' //注意：暴露appSecret，有被盗用造成损失的风险
    let salt = new Date().getTime()
    let curtime = Math.round(new Date().getTime() / 1000)
    let str1 = appid + truncate(q) + salt + curtime + key
    let sign = SHA256(str1)
    return {
      appid: appid,
      salt: salt,
      curtime: curtime,
      sign: sign
    }
  } else {
    return {}
  }
}
function youdaoFanyi(data) {
  // 多个q可以用\n连接  如 q='apple\norange\nbanana\npear'
  let q = data.q
  let to = data.to
  let from = 'auto'
  let vocabId = '' //您的用户词表ID
  let res = getSign(q, 'youdao')
  if (!res.appid) {
    return { error: '需要先配置appid和key' }
  }
  return Jsonp(
    {
      q: q,
      appKey: res.appid,
      salt: res.salt,
      from: from,
      to: to,
      sign: res.sign,
      signType: 'v3',
      curtime: res.curtime,
      vocabId: vocabId
    },
    'https://openapi.youdao.com/api'
  )
}
function baiduFanyi(data) {
  let q = data.q
  let to = data.to
  let from = 'auto'
  let res = getSign(q, 'baidu')
  if (!res.appid) {
    return { error: '需要先配置appid和key' }
  }
  let appid = res.appid
  let salt = res.salt
  let sign = res.sign
  // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
  return Jsonp(
    {
      q: q,
      appid: appid,
      salt: salt,
      from: from,
      to: to,
      sign: sign
    },
    'https://api.fanyi.baidu.com/api/trans/vip/translate'
  )
}

export function translate(data, type) {
  if (type == 'baidu') {
    return baiduFanyi(data)
  } else if (type == 'youdao') {
    return youdaoFanyi(data)
  }
  return new Promise(function (resolve) {
    resolve({
      errormsg: '不支持' + type
    })
  })
}
