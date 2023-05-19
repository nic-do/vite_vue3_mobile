import { defineMock } from 'vite-plugin-mock-dev-server'
import postList from './data/post'

// Different pages send the same interface and can get different
// data through the query parameter of the source page-animation
export default defineMock([
  // localhost/post.html?from=post-page-animation
  // send request /api/post/list
  {
    url: '/api/post/list',
    validator: {
      refererQuery: { from: 'post-page-animation' },
    },
    body: {
      list: postList,
    },
  },
  // localhost/recommend.html?from=recommend-page-animation
  // send request /api/post/list
  {
    url: '/api/post/list',
    validator: {
      refererQuery: { from: 'recommend-page-animation' },
    },
    body: {
      list: postList.slice(0, 4),
    },
  },
])
