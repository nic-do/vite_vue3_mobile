import { defineMock } from 'vite-plugin-mock-dev-server'
import user from './data/user'
export default defineMock([
  {
    url: '/api/get-token',
    cookies: {
      token: 'token' + Date.now()
    },
    body(request) {
      const token = request.getCookie('token')
      return {
        code: 200,
        message: 'success',
        data: {
          token: token
        }
      }
    }
  },
  {
    url: '/api/login',
    cookies: {
      token: 'token' + Date.now()
    },
    delay: 1000,
    body(request) {
      let token = null
      let userFind = null
      if (request.body!=null){
        //get 用query post用body
        for (let key in user) {
          if (key == request.body['username'] && user[key].password == request.body['password']) {
            token = request.getCookie('token')
            userFind = user[key]
            break
          }
        }
      }

      let res = {
        code: token == null ? -1 : 200,
        message: token == null ? 'login fail' : 'login success',
        data: null
      }
      if (token != null) {
        res.data = {
          user: userFind,
          token: token
        }
      }
      return res
    }
  },
  {
    url: '/api/logout',
    cookies({ getCookie }) {
      const token = getCookie('token')
      if (token) {
        return {
          token: ['', { expires: new Date(Date.now() - 86400000) }]
        }
      }
      return {}
    },
    body: {
      code: 200,
      message: 'logout success'
    }
  },
  {
    url: '/api/check-login',
    body(request) {
      const token = request.getCookie('token')
      return {
        code: 200,
        message: 'success',
        data: {
          isLogin: !!token
        }
      }
    }
  }
])
