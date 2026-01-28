<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notificationStore'

const notificationStore = useNotificationStore()

onMounted(() => {
  notificationStore.bootstrap()
})
</script>
<template>
  <RouterView />
</template>
<style scoped></style>
