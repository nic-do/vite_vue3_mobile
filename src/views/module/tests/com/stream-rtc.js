import WebRtc from "./web-rtc";

class StreamRtc extends WebRtc {
  localStream = null;
  constructor(wsUrl, onStream) {
    super(wsUrl, onStream);
    this.setRtcType('stream')
  }
  // getUserMedia2(){
  //   return new Promise(function (resolve, reject) {
  //     navigator.mediaDevices.getUserMedia({
  //       video: true,
  //       audio: true,
  //     }).then(function (stream) {
  //       resolve(stream)
  //     }).catch(function (err) {
  //       console.log('--getUserMedia2--',err)
  //       resolve(null)
  //     })
  //   })
  // }
  // // 发起端通道：实现父类抽象方法
  // requestChannel = async (pc) => {
  //   // const myStream = await navigator.mediaDevices.getUserMedia({
  //   //   video: true,
  //   //   audio: true,
  //   // });
  //   const myStream = await this.getUserMedia2();
  //   this.localStream = myStream;
  //   this.streamCallBack(this.me, myStream);
  //   if (myStream!=null){
  //     // 将媒体流添加到webrtc的音视频收发器
  //     myStream.getTracks().forEach((track) => {
  //       pc.addTrack(track, myStream);
  //     });
  //   }
  //   return new Promise(function (resolve, reject) {
  //     resolve(myStream);
  //   })
  // };

  // 响应端通道：实现父类抽象方法
  // responseChannel = async (pc) => {
  //   await this.requestChannel(pc);
  // };
}

export default StreamRtc;
