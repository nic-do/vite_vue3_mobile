import { defineMock } from 'vite-plugin-mock-dev-server'

export default defineMock([
  {
    url: '/api/validator-check-cookie',
    validator(request) {
      const token = request.getCookie('token')
      return !token //只有true才正常返回
    },
    body: {
      code: 404,
      message: 'token expired.',
    },
  },
  {
    url: '/api/validator-body-include',
    validator(request) {
      const ids = request.body.ids || []
      return !ids.includes('1001')
    },
    body: {
      code: 200,
      message: 'ids must be include 1001',
    },
  },
])
