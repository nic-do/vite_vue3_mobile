<template>
  <div>
    <van-space style="margin: 20px; padding: 0px 6px" direction="vertical" fill :size="40">
      <van-row>
        <van-col span="6">{{ hexValue }}</van-col>
        <van-col span="4"
          ><div style="width: 40px; height: 20px" :style="{ background: hexValue }"
        /></van-col>
      </van-row>

      <van-slider v-model="values.rValue" :min="0" :max="255" @change="onChange" />
      <van-slider v-model="values.gValue" :min="0" :max="255" @change="onChange" />
      <van-slider v-model="values.bValue" :min="0" :max="255" @change="onChange" />
      <van-slider v-model="values.alphaValue" :min="0" :max="255" @change="onChange" />
    </van-space>
  </div>
</template>

<script>
export default {
  name: 'themeEdit',
  computed: {
    hexValue: function () {
      let alpha = this.values.alphaValue.toString(16)
      let rv = this.values.rValue.toString(16)
      let gv = this.values.gValue.toString(16)
      let bv = this.values.bValue.toString(16)
      if (alpha.length < 2) {
        alpha = '0' + alpha
      }
      if (rv.length < 2) {
        rv = '0' + rv
      }
      if (gv.length < 2) {
        gv = '0' + gv
      }
      if (bv.length < 2) {
        bv = '0' + bv
      }
      //
      return `#${rv}${gv}${bv}${alpha}`
    }
  },
  data() {
    return {
      values: {
        rValue: 255,
        gValue: 255,
        bValue: 255,
        alphaValue: 255
      }
    }
  },
  mounted() {},
  methods: {
    onChange() {},
    getValues() {
      return {
        values: this.values,
        hexValue: this.hexValue
      }
    }
  }
}
</script>

<style scoped></style>
