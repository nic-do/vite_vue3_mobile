import WebRtc from "./web-rtc";

class TextRtc extends WebRtc {
  constructor(wsUrl, onData) {
    super(wsUrl, onData);
    this.setRtcType('text')
  }
  //
  // // 发起端通道：实现父类抽象方法
  // requestChannel = (pc) => {
  //   const channel = pc.createDataChannel("chat");
  //   channel.onopen = () => {
  //     channel.send("Hi");
  //   };
  //   // 监听对等方数据体
  //   channel.onmessage = (e) => {
  //     this.callBack(pc.myname, e.data);
  //   };
  //   pc.channel = channel;
  // };
  //
  // // 响应端通道：实现父类抽象方法
  // responseChannel = (pc) => {
  //   // 监听对等方创建数据通道
  //   pc.ondatachannel = (event) => {
  //     // 直接可以拿到对方通道
  //     const channel = event.channel;
  //     channel.onopen = () => {
  //       channel.send("HI");
  //     };
  //     channel.onmessage = (e) => {
  //       const data = e.data;
  //       // 对方数据回调
  //       this.dataCallBack(pc.myname, data);
  //     };
  //     pc.channel = channel;
  //   };
  // };

  // // 消息发送
  // sendMsg = (other, msg) => {
  //   this.dataCallBack(this.me, msg);
  //   const pc = this.peerConns[other];
  //   if (pc && pc.channel && pc.channel.readyState === "open") {
  //     pc.channel.send(msg);
  //   }
  // };
}

export default TextRtc;
