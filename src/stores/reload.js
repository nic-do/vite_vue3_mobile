import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const reloadStore = defineStore('counter', () => {
  const count = ref(1)
  // const doubleCount = computed(() => count.value * 2)
  function change() {
    if (count.value==1){
      count.value=2
    }else{
      count.value=1
    }
  }

  return { count, change }
})
