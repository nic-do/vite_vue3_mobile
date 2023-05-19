import { get, post } from './mockapi'
import Api from '@/utils/axios/api'
import user from "@/request/user";
async function fileExtension() {
  // await get('/api/json')
  // await get('/api/json5')
  // await get('/api/es-module-js')
  // await get('/api/typescript')
  // await get('/api/common-js')
  // await get('/api/javascript')

  var res = await Api.Get(null, '/api/json').catch((err) => {
    console.log('--/api/json-1-', err)
  })
  console.log('--/api/json--res-1-', res)
}

async function allowMethod() {
  // await get('/api/only-get-method')
  // await post('/api/allow-get-and-post')
  // await get('/api/allow-get-and-post')
  // console.log('allowMethod','测试post调用仅供get的方法，会报错，正常的错误逻辑-2')
  // await post('/api/only-get-method')
  await Api.Post(null, '/api/allow-get-and-post').catch((err) => {})
}

async function apiDev() {
  // await get('/api-dev/list/get')
  await Api.Get(null, '/api-dev/list/get').catch((err) => {})
}

async function buffer() {
  // await post('/api/buffer/buffer-type')
  // await post('/api/buffer/buffer-body')

  await Api.Post(null, '/api/buffer/buffer-type').catch((err) => {})
}

async function cookie() {
  // await post('/api/check-login')
  // await post('/api/logout')
  // await post('/api/check-login')

  await Api.Post(null, '/api/login').catch((err) => {})
}

async function delay() {
  // await get('/api/delay')
  // await get('/api/delay-and-fail')
  let test = async function (idx) {
    let text = await Api.Get({ loading: true, tag: idx }, '/api/delay').catch((err) => {
      console.log('-----', err)
    })
    console.log('---delay--response-' + idx + '-', text)
  }
  test(0)
  setTimeout(function () {
    test(1)
  }, 100)
  setTimeout(function () {
    test(2)
  }, 100)
  setTimeout(function () {
    test(3)
  }, 100)
}

async function customHeader() {
  // await get('/api/custom-header')
  // await get('/api/custom-header-fn')

  await Api.Get(null, '/api/custom-header')
}

async function customResponse() {
  // await get('/api/custom-response?a=1&b=2')
  // console.log('customResponse','测试skip=1内部忽略，会报错,正常的错误逻辑')
  // await get('/api-custom-response-skip?skip=1')
  // await get('/api-custom-response-skip')

  await Api.Get(null, '/api/custom-response?a=1&b=2')
}

async function dynamicMatchUrl() {
  // await get('/api/author/10001')
  // await get('/api/author/10002')
  // await get('/api/author/10003')

  await Api.Get(null, '/api/author/10001')
}

async function fail() {
  console.log('customResponse', '测试fail-404，会报错,正常的错误逻辑')
  // await get('/api/fail')

  await Api.Get(null, '/api/fail')
}

async function mockjs() {
  // await get('/api/mockjs')

  await Api.Get(null, '/api/mockjs')
}

async function otherMock() {
  // await post('/api/post/list', { page: 1 })
  // await get('/api/user/list')
  // await get('/api/user/mark2022')

  await Api.Post({ page: 1 }, '/api/post/list')
}

async function validatorBody() {
  // await post('/api/post-update', { shouldUpdate: true })
  // await post('/api/post-update', { shouldUpdate: false })

  await Api.Post({ shouldUpdate: true }, '/api/post-update')
}

async function validatorParams() {
  // await get('/api/post/1001')
  // await get('/api/post/1002')
  // console.log('validatorParams','没有提供测试1003接口，会报错,正常的错误逻辑')
  // await get('/api/post/1003')

  await Api.Get(null, '/api/post/1001')
}

async function validatorQuery() {
  // await get('/api/post?id=1000')
  // await get('/api/post?id=1001&other=1')
  // await get('/api/post?id=1002')
  // await get('/api/post?id=1003&other=1')

  await Api.Get(null, '/api/post?id=1000')
}

async function validatorRequest() {
  // await get('/api/validator-check-cookie')
  // await post('/api/validator-body-include', { ids: [] })

  let res = await Api.Get(null, '/api/validator-check-cookie').catch((err) => {
    console.log('---validator-check-cookie-err-', err)
  })
  console.log('---validator-check-cookie-respone-', res)
  await Api.Post({ ids: [1001] }, '/api/validator-body-include')
}

async function bootstrap() {
  // console.log('Api','test')
  // console.log('utils-mock-tests','---fileExtension---begin-')
  // await fileExtension()
  // console.log('utils-mock-tests','---allowMethod---begin-')
  // await allowMethod()
  // console.log('utils-mock-tests','---apiDev---begin-')
  // await apiDev()
  // console.log('utils-mock-tests','---buffer---begin-')
  // await buffer()
  // console.log('utils-mock-tests','---cookie---begin-')
  // await cookie()
  // console.log('utils-mock-tests','---customHeader---begin-')
  // await customHeader()
  // console.log('utils-mock-tests','---customResponse---begin-')
  // await customResponse()
  // console.log('utils-mock-tests','---dynamicMatchUrl---begin-')
  // await dynamicMatchUrl()
  // console.log('utils-mock-tests','---fail---begin-')
  // await fail()
  // console.log('utils-mock-tests','---mockjs---begin-')
  // await mockjs()
  // console.log('utils-mock-tests','---validatorBody---begin-')
  // await validatorBody()
  // console.log('utils-mock-tests','---validatorParams---begin-')
  // await validatorParams()
  // console.log('utils-mock-tests','---validatorQuery---begin-')
  // await validatorQuery()
  // console.log('utils-mock-tests','---validatorRequest---begin-')
  // await validatorRequest()
  // console.log('utils-mock-tests','---otherMock---begin-')
  // await otherMock()
  // console.log('utils-mock-tests','---delay---begin-')
  // await delay()
  // await fileExtension()
  await user.getToken().catch((err)=>{})
  await user.checLogin().catch((err)=>{})
await delayTime(1000)
  await user.logout().catch((err)=>{})
  await delayTime(1000)
  await user.checLogin().catch((err)=>{})
}
const delayTime=async function(time){
  return new Promise(function (resolve){
    setTimeout(function (){
      resolve()
    },time)
  })
}
function webSocketMock() {
  const ws = new WebSocket('ws://localhost:5173/socket.io')
  ws.addEventListener(
    'open',
    () => {
      // eslint-disable-next-line no-console
      console.log('isOpen')
    },
    { once: true }
  )
  setTimeout(() => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type: 'message', payload: { a: 1 } }))
    }
  }, 3000)
}
const start = function () {
  bootstrap()
  // webSocketMock()//可以测，此处用不到，因此屏蔽
}
export default { start }
