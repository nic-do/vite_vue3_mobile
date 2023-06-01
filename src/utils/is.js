const toString = Object.prototype.toString
const isBoolean = (val) => typeof val === 'boolean'
const isFunction = (val) => typeof val === 'function'
const isNumber = (val) => typeof val === 'number'
const isUndefined = (val) => typeof val === 'undefined'
const isString = (val) => typeof val === 'string'
const isObject = (val) => toString.call(val) === '[object Object]'
const isArray = (val) => toString.call(val) === '[object Array]'
const isEmpty = (val) => !val && val !== 0

function isMobileDevice() {
  let ua = navigator.userAgent
  let ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
    isIphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
    isAndroid = ua.match(/(Android)\s+([\d.]+)/)
  return isIphone || isAndroid
}
export default {
  isBoolean,
  isFunction,
  isNumber,
  isUndefined,
  isString,
  isObject,
  isArray,
  isEmpty,
  isMobileDevice
}
