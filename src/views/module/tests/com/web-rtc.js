import { createWS } from '@/views/module/tests/com/web-soc'
import RtcBase from '@/views/module/tests/com/rtc-base'
class WebRtc extends RtcBase {
  ws = null

  constructor(wsUrl, callBack) {
    super(wsUrl, callBack)
    try {
      this.ws = createWS(wsUrl, (message) => {
        let msg = JSON.parse(message)
        if (this.callBack){
          this.callBack(null,'ws',msg)
        }
        if (msg.type == 'login') {
          this.user = msg.data.user
        } else if (msg.type == 'call') {
          let from = msg.data.from
          let offer = msg.data.offer
          this.answer(offer, from)
        } else if (msg.type == 'answer') {
          let from = msg.data.from
          let answer = msg.data.answer
          this.caller_update(answer, from)
        } else if (msg.type == 'candidate-changed') {
          let from = msg.data.from
          let candidate = msg.data.candidate
          this.updateCandidate(candidate, from)
        } else if (msg.type == 'leave') {
          let from = msg.data.from
          this.handleLeave(from)
        }
        // const data = JSON.parse(message);
        // switch (data.type) {
        //   case "onLogin": // 某用户登录
        //     this.handleLogin(data.name);
        //     break;
        //   case "onOffer": // 他人邀请我
        //     this.answer(data.offer, data.name);
        //     break;
        //   case "onAnswer": // 他人应答我
        //     this.handleAnswer(data.answer, data.name);
        //     break;
        //   case "onCandidate": // 他人候选信息-变更 发给我
        //     this.updateCandidate(data.candidate, data.name);
        //     break;
        //   case "onLeave": // 他人离线
        //     this.handleLeave(data.name);
        //     break;
        //   default:
        //     break;
        // }
      })
    } catch (e) {
      console.log('----', e)
    }
  }

  //处理某用户登录
  handleLogin = (name) => {
    console.log(name, '登录系统')
    this.user = name
  }
  /////////////////被呼叫者//////////////////////
  answer = async (offer, from) => {
    if (from && offer) {
      // console.log(name, '邀请', this.user)
      let answer = await this.answer_init(offer, from)
      this.ws.send(
        JSON.stringify({
          type: 'answer',
          answer: answer,
          from: this.user,
          to: from
        })
      )
    }
  }
  //////////////'呼叫'发起者////////////////
  // 呼叫他人
  call = async (name) => {
    let offer = await this.caller_init(name)
    if (offer) {
      this.ws.send(
        JSON.stringify({
          type: 'call',
          offer: offer,
          from: this.user,
          to: name
        })
      )
    } else {
      console.log('--offer--', offer)
    }
  }
  ////////////////////////////////////////////////
  // 本人下线并通知他人
  leave = (name) => {
    // 通知他人关闭
    this.ws.send(
      JSON.stringify({
        type: 'leave',
        name
      })
    )
  }
}
export default WebRtc
