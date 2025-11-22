<template>
  <div>
    <slot v-if="!error" />
    <slot v-else name="error" :error="error" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onErrorCaptured } from 'vue'

const error = ref<Error | null>(null)

onErrorCaptured((err) => {
  error.value = err
  return false // Prevent error from propagating
})
</script>
