import Mock from 'mockjs'
import { defineMock } from 'vite-plugin-mock-dev-server'
export default defineMock({
  url: '/api/mockjs',
  body:{
    code: 200,
    message: 'login success',
    result: Mock.mock({
        'list|1-10': [
          {
            'id|+1': 1,
          },
        ],
      }),
  }
  // body: Mock.mock({
  //   'list|1-10': [
  //     {
  //       'id|+1': 1,
  //     },
  //   ],
  // }),
})
