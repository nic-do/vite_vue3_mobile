import 'webrtc-adapter'
class RtcBase {
  rtcType
  callBack
  localStream
  user = null
  peerConns = {} //所有对等端{[name]:pc}
  constructor(wsUrl, callBack) {
    this.callBack = callBack
    this.localStream = null
  }
  setRtcType(rtcType) {
    this.rtcType = rtcType
  }
  // 更新candidate
  updateCandidate = async (candidate, name) => {
    console.log(name, '发送候选信息给', this.user, candidate)
    const pc = this.peerConns[name]
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate))
    }
  }
  getUserMedia2() {
    return new Promise(function (resolve, reject) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true
        })
        .then(function (stream) {
          resolve(stream)
        })
        .catch(function (err) {
          console.log('--getUserMedia2--', err)
          resolve(null)
        })
    })
  }
  // 发起端通道：实现父类抽象方法
  requestChannel = async (pc, type) => {
    if (this.rtcType == 'text') {
      if (type != 1) {
        const channel = pc.createDataChannel('chat')
        channel.onopen = () => {
          channel.send('Hi')
        }
        // 监听对等方数据体
        channel.onmessage = (e) => {
          this.callBack(pc.myname, 'text', e.data)
        }
        pc.channel = channel
      }
    }
    if (this.rtcType == 'stream') {
      const myStream = await this.getUserMedia2()
      this.localStream = myStream
      this.callBack(pc.myname, 'stream', myStream)
      if (myStream != null) {
        // 将媒体流添加到webrtc的音视频收发器
        myStream.getTracks().forEach((track) => {
          pc.addTrack(track, myStream)
        })
      }
      return new Promise(function (resolve, reject) {
        resolve(myStream)
      })
    }
  }

  // 响应端通道：实现父类抽象方法
  responseChannel = async (pc) => {
    if (this.rtcType == 'text') {
      // 监听对等方创建数据通道
      pc.ondatachannel = (event) => {
        // 直接可以拿到对方通道
        const channel = event.channel
        channel.onopen = () => {
          channel.send('HI')
        }
        channel.onmessage = (e) => {
          const data = e.data
          // 对方数据回调
          this.callBack(pc.myname, 'text', data)
        }
        pc.channel = channel
      }
    }
    if (this.rtcType == 'stream') {
      await this.requestChannel(pc, 1)
    }
  }

  // 消息发送
  sendMsg = (other, msg) => {
    const pc = this.peerConns[other]
    if (pc && pc.channel) {
      this.callBack(pc.myname, 'text', msg)
      if (pc.channel.readyState === 'open') {
        pc.channel.send(msg)
      }
    }
  }
  // 创建与他人点对点连接
  createPC = (name, sendCandidate) => {
    // creating our RTCPeerConnection object
    if (!RTCPeerConnection) {
      alert('浏览器不支持webrtc')
      return
    }
    const iceConfig = {
      iceServers: [{ urls: 'stun:stun2.1.google.com:19302' }]
    }
    let pc = this.peerConns[name]
    if (!pc) {
      pc = new RTCPeerConnection(iceConfig)
      //ICE候选发送到远程对等方,只要本地代理ICE需要通过信令服务器传递信息给其他对等端时就会触发
      //createOffer或createAnswer生成的SDP调用setLocalDescription，ICE采集就会开始
      pc.onicecandidate = (event) => {
        console.log(this.user, '检测到候选信息，即将发给', name)
        console.log('--candidate--', JSON.stringify(event.candidate))
        if (event.candidate) {
          if (sendCandidate) {
            sendCandidate(event.candidate)
          } else {
            this.ws.send(
              JSON.stringify({
                type: 'candidate-changed',
                candidate: event.candidate,
                from:name
              })
            )
          }
        }
      }
      // 监听对等端流媒体
      pc.ontrack = (e) => {
        if (e && e.streams) {
          // 对方流回调
          if (this.callBack) {
            //只有stream才需要
            this.callBack(name, 'stream', e.streams[0])
          }
        }
      }
      // 该连接针对的对象名
      pc.myname = name
      this.peerConns[name] = pc
    }

    return pc
  }
  /////////////////被呼叫者//////////////////////
  answer_init = async (offer, name) => {
    if (name && offer) {
      console.log(name, '邀请', this.user)
      // 应答他人需要新的点对点连接
      const pc = this.createPC(name)
      await pc.setRemoteDescription(new RTCSessionDescription(offer))
      // 此时开启本地流媒体，注意顺序
      await this.responseChannel(pc, name)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      return answer
    }
  }
  //////////////呼叫发起者////////////////
  // 呼叫他人
  caller_init = async (name) => {
    try {
      const pc = this.createPC(name)
      await this.requestChannel(pc, name)
      // 数据通道打开以后创建请求
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      return offer
    } catch (e) {
      console.log('--offer-e--', e)
      return null
    }
  }
  // 处理某用户应答
  caller_update = async (answer, name) => {
    console.log(name, '应答', this.user)
    console.log('--call-client--', name)
    const pc = this.peerConns[name]
    if (pc && answer) {
      // 保存远程应答会话
      await pc.setRemoteDescription(new RTCSessionDescription(answer))
    }
  }
  ////////////////////////////////////////////////

  // 处理我对某人的连接断开
  handleLeave = (name) => {
    // 本地流存在则停止
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        track.stop()
      })
    }
    const pc = this.peerConns[name]
    if (pc) {
      // 关闭本地数据通道
      if (pc.channel) {
        pc.channel.close()
      }
      // 关闭本人对于他人的连接
      pc.close()
      delete this.peerConns[name]
    }
  }

  // 释放
  dispose = () => {
    this.user = null
    // 遍历所有的点对点连接并关闭
    for (let key in this.peerConns) {
      let pc = this.peerConns[key]
      let name = pc.myname
      this.leave(name)
      this.handleLeave(name)
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.peerConns = null
  }

  // 抽象方法，具体由继承类实现.发送 离线状态到服务端
  leave(name) {}
}
export default RtcBase
