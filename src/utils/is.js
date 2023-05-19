const toString = Object.prototype.toString
const isBoolean = (val) => typeof val === 'boolean'
const isFunction = (val) => typeof val === 'function'
const isNumber = (val) => typeof val === 'number'
const isUndefined = (val) => typeof val === 'undefined'
const isString = (val) => typeof val === 'string'
const isObject = (val) => toString.call(val) === '[object Object]'
const isArray = (val) => toString.call(val) === '[object Array]'
const isEmpty = (val) => !val && val !== 0
export default {
  isBoolean,
  isFunction,
  isNumber,
  isUndefined,
  isString,
  isObject,
  isArray,
  isEmpty
}
