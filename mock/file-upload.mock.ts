import { defineMock,MockRequest } from 'vite-plugin-mock-dev-server'

export default defineMock([{
  url: '/api/upload',
  method: 'POST',
  body(req) {
    //file：FormData---name
    const file =req.body.file
    return {
      data:file
    }
  },
}])
