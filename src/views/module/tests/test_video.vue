<script setup name="test_video">
import Page, { PageNavDef } from '@/components/page'
import { useRouter } from 'vue-router'
import {
  provide,
  ref,
  watch,
  nextTick,
  onActivated,
  onDeactivated,
  onBeforeUnmount,
  reactive,
  computed,
  inject
} from 'vue'
import { MultiStreamsMixer } from '@/components/media/MultiStreamsMixer'
import { RecordRTC } from '@/components/media/RecordRTC'
import { FileSelector } from '@/components/media/tools/FileSelector'
import reloadWatch from '@/utils/listener/reload-watch'
import TextRtc from '@/views/module/tests/com/text-rtc'
import StreamRtc from '@/views/module/tests/com/stream-rtc'
import Is from '@/utils/is'
const router = useRouter()
const i18n_t = inject('i18n_t')
const navDef = reactive({
  nav: PageNavDef.config({
    show: true,
    clickable: true,
    leftArrow: false,
    placeholder: true,
    title: computed(() => {
      // 直接赋值 无响应式，是否有其他方式？？？
      return i18n_t('main.nav.title')
    }),
    leftText: computed(() => {
      return i18n_t('main.nav.leftText')
    }),
    clickLeft: function () {
      return true
    },
    rightText: computed(() => {
      return '选择loader'
    }),
    clickRight: function () {
      return false
    }
  })
})
// watch(params.value, (newValue, oldValue) => {
//   console.log('值发生了变更', newValue, oldValue)
// })
provide('navParams', navDef)
const count = ref(0)
onActivated(() => {
  // count.value++
  // console.log('--onActivated--', '-------'+count.value)
})
onDeactivated(() => {
  // console.log('--onDeactivated--', '-------'+count.value)
  dispose()
  reloadWatch.clearListener()
})
onBeforeUnmount(() => {
  dispose()
  reloadWatch.clearListener()
})
const mainPageRef = ref()
let size = {}
nextTick(function () {
  size.width = mainPageRef.value.$el.clientWidth
  size.height = mainPageRef.value.$el.clientHeight - 200
  reloadWatch.setListener(() => {
    dispose()
    startButton.value = 'start'
  })
    alert('处理中')
})
const onMouseDown = function (event) {
  // event.preventDefault()
  let touch = null
  if (Is.isMobileDevice()) {
    if (event.targetTouches.length > 0) {
      touch = event.targetTouches[0]
    }
  } else {
    touch = event
  }
  if (videoPreview.value) {
    let top = videoPreview.value.offsetTop
    for (let idx in streamsCache) {
      let it = streamsCache[idx]
      if (
        it.top <= touch.clientY - top &&
        it.height + it.top >= touch.clientY - top &&
        it.left <= touch.clientX &&
        it.width + it.left >= touch.clientX
      ) {
        console.log('点击了' + idx)
      }
    }
  }
}
const dispose = function () {
  if (ws) {
    ws.close()
    ws = null
  }
  showVideo.value = false
  updateMediaHTML('')
  if (Is.isMobileDevice()) {
    document.removeEventListener('touchstart', onMouseDown)
  } else {
    document.removeEventListener('mousedown', onMouseDown)
  }
  streamsCache = []
  if (screenStreamGlobal) {
    screenStreamGlobal.getTracks().forEach(function (track) {
      track.stop()
    })
    if (screenStreamGlobal.stop != undefined) {
      screenStreamGlobal.stop()
    }
    screenStreamGlobal = null
  }
  if (recorder) {
    recorder.stopRecording(() => {
      recorder.destroy()
      recorder = null
    })
    // recorder.destroy()
    // recorder = null
  }
  if (audioPreviewRef.value) {
    audioPreviewRef.value.pause()
    audioPreviewRefShow.value = false
  }
  if (videoPreview.value && !videoPreview.value.paused && videoPreview.value.srcObject) {
    videoPreview.value.pause()
    videoPreview.value = false
  }
}
const videoPreview = ref()
const oupput = ref()
const buttonDisabled = ref(false)
const showVideo = ref(false)
let mixer = null

function updateMediaHTML(html) {
  if (oupput.value) oupput.value.innerHTML = html
}
const mixerOptions = reactive({
  value: '(pc)camera-screen',
  options: [
    { name: '(pc)camera-screen' },
    { name: 'multiple-cameras-default' },
    { name: 'multiple-cameras-customized' },
    { name: '(pc)microphone-mp3' }
  ]
})
function getStream() {
  dispose()
  if (startButton.value == 'stop') {
    startButton.value = 'start'
    return
  }
  let flag = Is.isMobileDevice()
  if (flag) {
    document.addEventListener('touchstart', onMouseDown, {
      passive: false
    })
  } else {
    document.addEventListener('mousedown', onMouseDown, false)
  }

  getStream2()
}
const delay = function (time) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve()
    }, time)
  })
}
const getStream2 = async function () {
  audioPreviewRefShow.value = false
  showVideo.value = false
  let idx = 0
  for (idx = 0; idx < mixerOptions.options.length; idx++) {
    if (mixerOptions.options[idx].name == mixerOptions.value) {
      break
    }
  }
  if (idx == 0) {
    audioPreviewRefShow.value = false
    showVideo.value = true
    updateMediaHTML('Capturing screen')
    getMixedCameraAndScreen()

    startButton.value = 'stop'
  }

  if (idx == 1 || idx == 2) {
    audioPreviewRefShow.value = false
    showVideo.value = true
    updateMediaHTML('Capturing camera')
    getMixedMultipleCameras(mixerOptions.value === 'multiple-cameras-customized')

    startButton.value = 'stop'
  }

  if (idx == 3) {
    audioPreviewRefShow.value = true
    updateMediaHTML('Capturing mp3+microphone')
    await delay(500)
    getMixedMicrophoneAndMp3()
    showVideo.value = false
    startButton.value = 'stop'
  }
}
function afterScreenCaptured(screenStream) {
  navigator.mediaDevices.getUserMedia({ video: vopts }).then(function (cameraStream) {
    screenStream.fullcanvas = true
    screenStream.width = size.width // or 3840
    screenStream.height = size.height // or 2160
    screenStreamGlobal = screenStream
    cameraStream.width = parseInt((30 / 100) * screenStream.width)
    cameraStream.height = parseInt((30 / 100) * screenStream.height)
    cameraStream.top = screenStream.height - cameraStream.height
    cameraStream.left = screenStream.width - cameraStream.width

    fullCanvasRenderHandler(screenStream, 'Your Screen!')
    normalVideoRenderHandler(cameraStream, 'Your Camera!')

    mixer = new MultiStreamsMixer([screenStream, cameraStream])

    mixer.frameInterval = 1
    mixer.startDrawingFrames()

    videoPreview.value.srcObject = mixer.getMixedStream()

    updateMediaHTML('Mixed Screen+Camera!')

    addStreamStopListener(screenStream, function () {
      mixer.releaseStreams()
      if (videoPreview.value) {
        videoPreview.value.pause()
        videoPreview.value.src = null
      }

      cameraStream?.getTracks()?.forEach(function (track) {
        track.stop()
      })
    })
  })
}
let screenStreamGlobal
function getMixedCameraAndScreen() {
  if (navigator.getDisplayMedia) {
    navigator.getDisplayMedia({ video: true }).then((screenStream) => {
      afterScreenCaptured(screenStream)
    })
  } else if (navigator.mediaDevices.getDisplayMedia) {
    navigator.mediaDevices.getDisplayMedia({ video: true }).then((screenStream) => {
      afterScreenCaptured(screenStream)
    })
  } else {
    alert('getDisplayMedia API is not supported by this browser.')
    buttonDisabled.value = true
  }
}
function ismobileSafari() {
  var ua = navigator.userAgent.toLowerCase()
  if (
    ua.indexOf('applewebkit') > -1 &&
    ua.indexOf('mobile') > -1 &&
    ua.indexOf('safari') > -1 &&
    ua.indexOf('iphone') > -1
  ) {
    return true
  } else {
    return false
  }
}
//如果有前后镜头--facingMode:user/environment
let vopts = { facingMode: 'user' /* width: 400,height: 300*/ }
let streamsCache = []
function getMixedMultipleCameras(isCustomized) {
  navigator.mediaDevices
    .getUserMedia({ video: vopts, audio: true })
    .then(function (cameraStream) {
      screenStreamGlobal = cameraStream
      if (isCustomized === true) {
        let fullCanvasStream = new MediaStream()
        cameraStream.getTracks().forEach(function (track) {
          fullCanvasStream.addTrack(track)
        })

        fullCanvasStream.fullcanvas = true
        fullCanvasStream.width = size.width // or 3840
        fullCanvasStream.height = size.height // or 2160

        fullCanvasRenderHandler(fullCanvasStream, 'Full Canvas Stream')

        cameraStream.width = parseInt((30 / 100) * fullCanvasStream.width)
        cameraStream.height = parseInt((30 / 100) * fullCanvasStream.height)
        cameraStream.top = fullCanvasStream.height - cameraStream.height
        cameraStream.left = fullCanvasStream.width - cameraStream.width

        let clonedCamera2 = new MediaStream()
        cameraStream.getTracks().forEach(function (track) {
          clonedCamera2.addTrack(track)
        })

        clonedCamera2.width = parseInt((30 / 100) * fullCanvasStream.width)
        clonedCamera2.height = parseInt((30 / 100) * fullCanvasStream.height)
        clonedCamera2.top = fullCanvasStream.height - clonedCamera2.height
        clonedCamera2.left = fullCanvasStream.width - clonedCamera2.width * 2

        normalVideoRenderHandler(clonedCamera2, 'Someone')
        normalVideoRenderHandler(cameraStream, 'You!')

        streamsCache.push(cameraStream)
        streamsCache.push(clonedCamera2)

        mixer = new MultiStreamsMixer([fullCanvasStream, cameraStream, clonedCamera2])
      } else {
        normalVideoRenderHandler(
          cameraStream,
          'Camera',
          function (context, x, y, width, height, idx, textToDisplay) {
            context.font = '30px Georgia'
            textToDisplay += ' #' + (idx + 1)
            let measuredTextWidth = parseInt(context.measureText(textToDisplay).width)
            x = x + parseInt(width - measuredTextWidth) / 2

            y = height - 40

            if (idx == 2 || idx == 3) {
              y = height * 2 - 40
            }

            if (idx == 4 || idx == 5) {
              y = height * 3 - 40
            }

            context.strokeStyle = 'rgb(255, 0, 0)'
            context.fillStyle = 'rgba(255, 255, 0, .5)'
            roundRect(context, x - 20, y - 25, measuredTextWidth + 40, 35, 20, true)
            let gradient = context.createLinearGradient(0, 0, width * 2, 0)
            gradient.addColorStop('0', 'magenta')
            gradient.addColorStop('0.5', 'blue')
            gradient.addColorStop('1.0', 'red')
            context.fillStyle = gradient
            context.fillText(textToDisplay, x, y)
            // console.log('---------','---------222222--------')
          }
        )
        mixer = new MultiStreamsMixer([cameraStream, cameraStream, cameraStream, cameraStream])
        // mixer = new MultiStreamsMixer([cameraStream])
        // try below three lines to append audio stream!
        // let audio = await navigator.mediaDevices.getUserMedia({audio: true});
        // mixer.appendStreams([audio]);
        // videoPreview.srcObject = mixer.getMixedStream();
      }
      mixer.frameInterval = 1
      mixer.startDrawingFrames()
      //ios safari中getMixedStream 异常,直接使用cameraStream 正常
      videoPreview.value.srcObject = mixer.getMixedStream()

      // videoPreview.value.srcObject =cameraStream
      updateMediaHTML('Mixed Multiple Cameras!')
    })
    .catch(function (error) {
      // console.log('mediaDevices.getUserMedia', error.name + ': ' + error.message)
    })
}
let recorder = null
function getMixedMicrophoneAndMp3() {
  updateMediaHTML('Select Mp3 file.')
  if (recorder) {
    recorder.stopRecording(() => {})
  }
  let audioPreview = audioPreviewRef.value
  if (audioPreview) {
    audioPreview.pause()
  }
  getMp3Stream(function (mp3Stream) {
    navigator.mediaDevices
      .getUserMedia({
        audio: true
      })
      .then(function (microphoneStream) {
        try {
          screenStreamGlobal = microphoneStream
          mixer = new MultiStreamsMixer([microphoneStream, mp3Stream])
          // mixer.useGainNode = false;
          // audioPreview = document.createElement('audio')

          // audioPreview.controls = true
          // audioPreview.autoplay = true
          audioPreview.setAttribute('controls', '')
          audioPreview.setAttribute('autoplay', '')
          audioPreview.srcObject = mixer.getMixedStream()

          // videoPreview.value.replaceWith(audioPreview)
          // videoPreview.value = audioPreview

          let secondsLeft = 6
          ;(function looper() {
            if (recorder) {
              secondsLeft--

              if (secondsLeft < 0) {
                updateMediaHTML('Mixed Microphone+Mp3!')
                return
              }
              updateMediaHTML('Seconds left: ' + secondsLeft)
              setTimeout(looper, 1000)
            }
          })()

          recorder = RecordRTC(mixer.getMixedStream(), {
            recorderType: RecordRTC.StereoAudioRecorder
          })

          recorder.startRecording()

          setTimeout(function () {
            if (recorder) {
              recorder.stopRecording(function () {
                audioPreview.removeAttribute('srcObject')
                audioPreview.removeAttribute('src')
                audioPreview.src = URL.createObjectURL(recorder.getBlob())
              })
            }
          }, 5000)
        } catch (e) {
          console.log(e)
          dispose()
          startButton.value = 'start'
        }
      })
  })
}

function getMp3Stream(callback) {
  let selector = new FileSelector()
  selector.accept = '*.mp3'
  selector.selectSingleFile(
    function (mp3File) {
      window.AudioContext = window.AudioContext || window.webkitAudioContext
      let context = new AudioContext()
      let gainNode = context.createGain()
      gainNode.connect(context.destination)
      gainNode.gain.value = 0 // don't play for self

      let reader = new FileReader()
      reader.onload = function (e) {
        // Import callback function
        // provides PCM audio data decoded as an audio buffer
        context.decodeAudioData(e.target.result, createSoundSource)
      }
      reader.readAsArrayBuffer(mp3File)

      function createSoundSource(buffer) {
        let soundSource = context.createBufferSource()
        soundSource.buffer = buffer
        soundSource.start(0, 0 / 1000)
        soundSource.connect(gainNode)
        let destination = context.createMediaStreamDestination()
        soundSource.connect(destination)

        // durtion=second*1000 (milliseconds)
        callback(destination.stream, buffer.duration * 1000)
      }
    },
    function () {
      alert('Please select mp3 file.')
    }
  )
}

// via: https://www.webrtc-experiment.com/webrtcpedia/
function addStreamStopListener(stream, callback) {
  stream.addEventListener(
    'ended',
    function () {
      callback()
      callback = function () {
        console.log('--end--', '111111')
        startButton.value = 'start'
      }
    },
    false
  )
  stream.addEventListener(
    'inactive',
    function () {
      callback()
      callback = function () {}
    },
    false
  )
  stream.getTracks().forEach(function (track) {
    track.addEventListener(
      'ended',
      function () {
        callback()
        callback = function () {
          console.log('ended', '000000')
          dispose()
          startButton.value = 'start'
        }
      },
      false
    )
    track.addEventListener(
      'inactive',
      function () {
        callback()
        callback = function () {}
      },
      false
    )
  })
}
let fontCameraNeedRotate = function () {
  //前置摄像头
  return vopts.facingMode == 'user'
}
function fullCanvasRenderHandler(stream, textToDisplay) {
  //投屏 不需要翻转
  // on-video-render:
  // called as soon as this video stream is drawn (painted or recorded) on canvas2d surface
  stream.onRender = function (context, x, y, width, height, idx) {
    context.font = '50px Georgia'
    let measuredTextWidth = parseInt(context.measureText(textToDisplay).width)
    x = x + (parseInt(width - measuredTextWidth) - 40)
    y = y + 80
    context.strokeStyle = 'rgb(255, 0, 0)'
    context.fillStyle = 'rgba(255, 255, 0, .5)'
    roundRect(context, x - 20, y - 55, measuredTextWidth + 40, 75, 20, true)
    let gradient = context.createLinearGradient(0, 0, width * 2, 0)
    gradient.addColorStop('0', 'magenta')
    gradient.addColorStop('0.5', 'blue')
    gradient.addColorStop('1.0', 'red')
    context.fillStyle = gradient
    context.fillText(textToDisplay, x, y)
  }
}

function normalVideoRenderHandler(stream, textToDisplay, callback) {
  stream.onBeforeRender = function (context, x, y, width, height, idx, ignoreCB) {
    if (fontCameraNeedRotate() && (textToDisplay == 'You!' || idx == 0)) {
      //镜像翻转图片
      context.translate(width + x * 2, 0)
      context.scale(-1, 1)
    }
  }
  // on-video-render:
  // called as soon as this video stream is drawn (painted or recorded) on canvas2d surface
  stream.onRender = function (context, x, y, width, height, idx, ignoreCB) {
    if (fontCameraNeedRotate() && (textToDisplay == 'You!' || idx == 0)) {
      //需要再次翻转回正 ,否则onRender的里的 就反了
      context.translate(width + x * 2, 0)
      context.scale(-1, 1)
    }
    if (!ignoreCB && callback) {
      callback(context, x, y, width, height, idx, textToDisplay)
      return
    }

    context.font = '40px Georgia'
    let measuredTextWidth = parseInt(context.measureText(textToDisplay).width)
    x = x + parseInt(width - measuredTextWidth) / 2
    y = context.canvas.height - height + 50
    context.strokeStyle = 'rgb(255, 0, 0)'
    context.fillStyle = 'rgba(255, 255, 0, .5)'
    roundRect(context, x - 20, y - 35, measuredTextWidth + 40, 45, 20, true)
    let gradient = context.createLinearGradient(0, 0, width * 2, 0)
    gradient.addColorStop('0', 'magenta')
    gradient.addColorStop('0.5', 'blue')
    gradient.addColorStop('1.0', 'red')
    context.fillStyle = gradient
    context.fillText(textToDisplay, x, y)
  }
}

/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
// via: http://stackoverflow.com/a/3368118/552182
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == 'undefined') {
    stroke = true
  }
  if (typeof radius === 'undefined') {
    radius = 5
  }
  if (typeof radius === 'number') {
    radius = {
      tl: radius,
      tr: radius,
      br: radius,
      bl: radius
    }
  } else {
    var defaultRadius = {
      tl: 0,
      tr: 0,
      br: 0,
      bl: 0
    }
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side]
    }
  }
  ctx.beginPath()
  ctx.moveTo(x + radius.tl, y)
  ctx.lineTo(x + width - radius.tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
  ctx.lineTo(x + width, y + height - radius.br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
  ctx.lineTo(x + radius.bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
  ctx.lineTo(x, y + radius.tl)
  ctx.quadraticCurveTo(x, y, x + radius.tl, y)
  ctx.closePath()
  if (fill) {
    ctx.fill()
  }
  if (stroke) {
    ctx.stroke()
  }
}
const showActionSheet = ref(false)
const onSelected = (action) => {
  showActionSheet.value = false
  mixerOptions.value = action.name
}
const changeMixerOption = function () {
  showActionSheet.value = !showActionSheet.value
}
const startButton = ref('start')
const audioPreviewRef = ref()
const audioPreviewRefShow = ref(false)

let ws = null
let wsUrl = 'wss://localhost:5173/socket.io'
let users = null

let rtcMgr = {
  textMgr: null,
  streamMgr: []
}
const makeTextRtc = function () {
  let textRtc = new TextRtc(
    wsUrl, // 流回调
    (name, type, myStream) => {
      let video = null
      if (type == 'ws') {
        if (myStream.type == 'alluser') {
          users = myStream.data.user
          if (users) {
            loaderOptions2.options = []
            users.forEach((it) => {
              if (it != userSelf.value) {
                loaderOptions2.options.push({
                  name: it
                })
              }
            })
            showActionSheet2.value = true
          }
        } else if (myStream.type == 'login') {
          userSelf.value = myStream.data.user
        }
      } else if (type == 'text') {
      } else if (type == 'stream') {
        // video = that.localStream;
        // video.srcObject = that.myStream;
      } else if (type == '') {
        // console.log(`${name}向你发起视频通话`);
        // let index = that.users.indexOf(name);
        // if (index < 0) {
        //     // 建立通信的其它人加入集合
        //     that.users.push(name);
        //     index = that.users.length;
        // }
        // that.nextTick(() => {
        //     video = that.audioDomList[index];
        //     if (video) {
        //         if ("srcObject" in video) {
        //             video.srcObject = myStream;
        //         } else {
        //             video.src = window.URL.createObjectURL(myStream);
        //         }
        //     }
        // });d
      }
    }
  )
  rtcMgr.textMgr = textRtc
  ws = textRtc.ws
}
nextTick(function () {
  makeTextRtc()
})
const websoc = function (type) {
  if (type == 2) {
    //先选人
    if (loaderOptions2.value) {
      rtcMgr.textMgr.call(loaderOptions2.value)
      // ws.send(
      //     JSON.stringify({ type: 'call', data: { caller: user, receiver: loaderOptions2.value } })
      // )
    }
  } else if (type == 1) {
    ws.send(JSON.stringify({ type: 'alluser', data: { a: 1 } }))
  } else if (type == 0) {
    ws.send(JSON.stringify({ type: 'login', data: { a: 1 } }))
  } else if (type == -1) {
    ws.send(JSON.stringify({ type: 'clear', data: { a: 1 } }))
  }
}
const showActionSheet2 = ref(false)
const onSelected2 = (action) => {
  showActionSheet2.value = false
  loaderOptions2.value = action.name
}
const loaderOptions2 = reactive({
  value: '',
  options: []
})
const userSelf = ref('')
</script>
<template>
  <page ref="mainPageRef" class="main-page">
    <template v-slot:body>
      <div>
        <van-button
          :disabled="buttonDisabled"
          type="primary"
          style="margin-right: 10px"
          @click="getStream"
          >{{ startButton }}</van-button
        >
        <van-button type="primary" @click="changeMixerOption">{{ mixerOptions.value }}</van-button>
        <van-action-sheet
          v-model:show="showActionSheet"
          :actions="mixerOptions.options"
          :cancel-text="'取消'"
          description="切换"
          @select="onSelected"
        />

        <van-action-sheet
          v-model:show="showActionSheet2"
          :actions="loaderOptions2.options"
          :cancel-text="'取消'"
          description="切换"
          @select="onSelected2"
        />
      </div>
      <div>
        <van-button type="primary" style="margin-right: 10px" @click="websoc(-1)">clear</van-button>
        <van-button type="primary" style="margin-right: 10px" @click="websoc(0)">login</van-button>
        <van-button type="primary" style="margin-right: 10px" @click="websoc(1)"
          >alluser</van-button
        >
        <van-button type="primary" style="margin-right: 10px" @click="websoc(2)">call</van-button>
        <div>{{ userSelf }}--{{loaderOptions2.value}}</div>
      </div>
      <section class="experiment" style="text-align: center">
        <div id="video-preview">
          <h2 ref="oupput" style="display: block"></h2>
          <video
            id="video-root"
            ref="videoPreview"
            v-if="showVideo"
            webkit-playsinline
            playsinline
            autoplay
            muted="false"
            volume="0"
          ></video>
          <audio v-if="audioPreviewRefShow" ref="audioPreviewRef" controls></audio>
        </div>
      </section>
    </template>
  </page>
</template>
<style>
.van-popover__content {
  width: 50vw;
  .van-popover__action {
    width: 100% !important;
  }
}
</style>
<style scoped>
video {
  max-width: 100%;
  /*border-radius: 5px;*/
  /*border: 1px solid black;*/
  /*padding: 2px;*/
  /*transform: rotateY(180deg);*/
  /*-webkit-transform: rotateY(180deg);*/
  /*-moz-transform: rotateY(180deg);*/
}
</style>
