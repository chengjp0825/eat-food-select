<script setup>
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth'

const { initialize } = useAuth()

onMounted(() => {
  initialize()
})
</script>

<template>
  <router-view :key="$route.fullPath" />
</template>