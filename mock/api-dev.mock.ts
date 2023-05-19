import { defineMock } from 'vite-plugin-mock-dev-server'
import { faker } from '@faker-js/faker'
export default defineMock([
  {
    url: '/api-dev/list/get',
    body(request) {
      const token = request.getCookie('token')
      let page=request.query['page']
      let pageSize=request.query['pageSize']
      const items = []
      if (page*pageSize<50){
        for (let i = 0; i < pageSize; i++) {
          items.push({
            id: page*pageSize+i,
            title:faker.lorem.lines({min:1,max:2}),
            avtar: faker.internet.avatar(),
            message: faker.lorem.lines({min:3,max:4}),
          })
        }
      }
      return {
        code: 200,
        message: 'api-dev--- list get',
        data: {
          datas:items,
          token: token
        }
      }
    }
  }
])
