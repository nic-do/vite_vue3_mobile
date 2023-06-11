import type { MockRequest } from 'vite-plugin-mock-dev-server'
import { defineMock } from 'vite-plugin-mock-dev-server'
import { faker } from '@faker-js/faker'
var userData = {}
var users = []
var userRelationShip = {}//试试能否多人接收
export default defineMock({
  url: '/socket.io',
  ws: true,
  setup(wss) {
    const createRoom = function () {
      var time = new Date().getTime()
      return faker.lorem.word(5) + time
    }
    const createUser = function () {
      var time = new Date().getTime()
      return faker.lorem.word(5) + time
    }
    const dataChanged = function (user) {
      var receivers = userRelationShip[user]
      var candidate = userData[user].candidate
      for (var i = 0; i < receivers.length; i++) {
        var userTo = receivers[i]
        var userMsg = userData[userTo]
        if (userData[userTo]) {
          userMsg.ws.send(JSON.stringify({ type: 'candidate-changed', data: { candidate: candidate } }))
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    wss.on('connection', (ws, req: MockRequest) => {
      // req.query
      // req.params
      // req.getCookie
      ws.on('message', (raw) => {
        const message = JSON.parse(String(raw))
        if (message.type == 'login') {
          //初次登录分配 userid
          var user = createUser()
          users.push(user)
          userData[user] = { ws: ws }
          ws.send(JSON.stringify({ type: 'login', data: { user: user } }))
        } else if (message.type == 'alluser') {
          //获取 user列表
          ws.send(JSON.stringify({ type: 'alluser', data: { user: users } }))
        } else if (message.type == 'call') {
          var user = message.from
          var receiver = message.to
          //发送连接请求给对方
          userData[receiver].ws.send(JSON.stringify({ type: 'call', data: { from: user,offer:message.offer } }))
        } else if (message.type == 'answer') {
          var user = message.from
          var receiver = message.to
          var answer=message.answer
          var conns = userRelationShip[user]
          if (!conns) {
            conns = []
            userRelationShip[user] = conns
          }
          conns.push(receiver)

          conns = userRelationShip[receiver]
          if (!conns) {
            conns = []
            userRelationShip[receiver] = conns
          }
          conns.push(user)
          console.log('---',userData)
          console.log('---',userRelationShip)
          //连接请求 应答
          userData[receiver].ws.send(JSON.stringify({ type: 'answer', data: { from: user,answer:answer } }))
        } else if (message.type == 'candidate-changed') {
          var user = message.from
          var candidate = message.candidate
          userData[user].candidate = candidate
          //rtc 变动 通知更新
          dataChanged(user)
        } else if (message.type == 'leave') {
          var user = message.from
          var receiver = message.to
          var conns = userRelationShip[user]
          if (conns) {
            conns.splice(conns.indexOf(user),1)
          }

          conns = userRelationShip[receiver]
          if (conns) {
            conns.splice(conns.indexOf(receiver),1)
          }
          userData[receiver].ws.send(JSON.stringify({ type: 'leave', data: { from: user} }))
        } else if (message.type == 'clear') {
          userData = {}
          users = []
          userRelationShip = {}
          ws.send(JSON.stringify({ type: 'clear'}))
        }
        // eslint-disable-next-line no-console
        console.log(message)
      })
      ws.send(JSON.stringify({ type: 'connected success' }))
    })
  }
})
