import Api from "@/utils/axios/api";
//以下使用mock 模拟
//定义在 /mock/cookie.mock.ts
export function getToken(data) {
  return Api.Post(data, '/api/get-token')
}
export function login(data) {
  return Api.Post(data, '/api/login')
}

export function logout(data) {
  return Api.Post(data, '/api/logout')
}
export function checLogin(data) {
  return Api.Post(data, '/api/check-login')
}

export default {getToken,login,logout,checLogin}