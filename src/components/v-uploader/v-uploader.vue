<template>
  <!--注意 <van-uploader>中间不要放不必要的内容，会填充默认的slot，注释都不行</van-uploader> -->
  <van-uploader
    v-model="fileList"
    v-bind="$attrs"
    :before-read="beforRead"
    :after-read="afterRead"
  >
  </van-uploader>
</template>

<script>
// import * as imageConversion from 'image-conversion'
import Compressor from 'compressorjs'
import Api from '@/utils/axios/api'
export default {
  name: 'v-uploader',
  data() {
    return {
      fileList: []
    }
  },
  methods: {
    beforRead(file) {
      return new Promise((resolve, reject) => {
        if (!Array.isArray(file) && file.type.indexOf('image/') == 0) {
          if (file.size > 1024 * 100) {
            // 大于1M,压缩到1M之内
            // compressorjs 默认开启 checkOrientation 选项
            // 会将图片修正为正确方向,有的图片图片可能显示旋转了
            new Compressor(file, {
              quality: (1024 * 1024) / file.size,
              success: resolve,
              error(err) {
                reject()
                console.log(err.message)
              }
            })
          } else {
            resolve(file)
          }
        } else {
          resolve(file)
        }
      })
    },
    afterRead(file) {
      // 此时可以自行将文件上传至服务器
      Api.UploadFile(file.file, { extra: '6789' }, '/api/upload').catch((err) => {
        console.log('---', err)
      })
    }

    // // 上传之前的钩子函数
    // beforeUpload(file) {
    //   // 判断是图片
    //   const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    //   if (!isJpgOrPng) {
    //     console.log('上传头像图片只能是 JPG 或 PNG 格式!')
    //     return false
    //   }
    //   return new Promise((resolve) => {
    //     // 压缩到100KB,这里的100就是要压缩的大小,可自定义
    //     imageConversion.compressAccurately(file, 100).then((res) => {
    //       console.log(res)
    //       resolve(res)
    //     })
    //   })
    // }
  }
}
</script>

<style scoped></style>