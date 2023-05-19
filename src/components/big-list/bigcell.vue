<script setup>
import { defineProps } from 'vue'
defineProps(['avatar', 'message', 'index'])
</script>
<template>
  <div class="avatar">
    <img :src="avatar" :key="'avatar_' + index" alt="avatar" class="image" />
  </div>
  <div class="text" style="word-break: break-word">{{ message }}</div>
</template>

<script></script>
<style scoped>
.text {
  color: green;
}
</style>
