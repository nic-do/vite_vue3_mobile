<script setup>
import { provide } from 'vue'
import AppRoot from '@/components/app-root'
//国际化
import i18n from '@/i18n'
const { t } = i18n.useI18n() //t用来解析 字段
provide('i18n_t', t)
</script>

<template>
  <app-root></app-root>
</template>

<style scoped></style>
