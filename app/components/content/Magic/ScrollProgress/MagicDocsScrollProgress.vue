<template>
  <div class="relative">
    <!-- Custom scroll progress bar that tracks the container -->
    <motion.div
      class="fixed inset-x-0 top-[56px] z-50 h-px origin-left bg-gradient-to-r from-[#A97CF8] via-[#F38CB8] to-[#FDCC92]"
      :style="{
        scaleX: scrollProgress,
      }"
    />
    
    <!-- Scrollable content area -->
    <div 
      ref="scrollContainer"
      class="h-96 overflow-y-auto border rounded-lg p-6 bg-gradient-to-b from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950"
      @scroll="updateScrollProgress"
    >
      <h2 class="text-2xl font-bold mb-6 text-center">Scroll Progress Demo</h2>
      
      <!-- Generate lots of content to make it scrollable -->
      <div v-for="i in 20" :key="i" class="mb-8">
        <h3 class="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-200">
          Section {{ i }}
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </p>
        <div class="h-32 bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900 dark:to-blue-900 rounded-lg flex items-center justify-center">
          <span class="text-sm text-gray-600 dark:text-gray-400">Content Block {{ i }}</span>
        </div>
      </div>
      
      <div class="text-center py-8">
        <p class="text-lg font-medium text-gray-700 dark:text-gray-300">
          You've reached the bottom! The scroll progress bar should now be at 100%.
        </p>
      </div>
    </div>
    
    <div class="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
      <p>Scroll within the box above to see the progress bar in action</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { motion } from 'motion-v'

const scrollContainer = ref<HTMLElement>()
const scrollProgress = ref(0)

const updateScrollProgress = () => {
  if (!scrollContainer.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
  const maxScroll = scrollHeight - clientHeight
  scrollProgress.value = maxScroll > 0 ? scrollTop / maxScroll : 0
}

onMounted(() => {
  updateScrollProgress()
})
</script>
