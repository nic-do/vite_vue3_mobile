<script setup name="aframe-load">
import 'aframe'
import { onBeforeUnmount } from 'vue'
import AResourceTracker from '@/components/aframe/tools/a-resource-track'
let tracker = new AResourceTracker()
defineExpose({
    tracker
})
onBeforeUnmount(() => {
  // //如果只有一个scene  AFRAME.scenes[0]
  // var sceneEl = document.querySelector('a-scene')
  // tracker.clearRender(sceneEl)
  tracker.clearAllScene()
})
</script>
<template>
    <slot name="body"></slot>
</template>

<style scoped></style>
<style lang="scss" scoped></style>
