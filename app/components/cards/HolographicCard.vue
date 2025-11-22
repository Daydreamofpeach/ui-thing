<template>
  <div class="group relative overflow-hidden rounded-2xl bg-card p-6 transition-all duration-500 hover:scale-[1.02] holographic-card" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave">
    <!-- Holographic background -->
    <div 
      class="absolute inset-0 opacity-30 group-hover:opacity-60 transition-opacity duration-500"
      :style="{ background: `radial-gradient(circle at ${mouseX}% ${mouseY}%, hsl(var(--primary) / 0.3) 0%, hsl(var(--primary) / 0.2) 25%, hsl(var(--primary) / 0.1) 50%, transparent 70%)` }"
    ></div>
    
    <!-- Animated mesh gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/15 via-primary/10 to-primary/5 animate-pulse"></div>
    
    <!-- Holographic border -->
    <div class="absolute inset-0 rounded-2xl border border-transparent bg-gradient-to-r from-primary via-primary/80 via-primary/60 to-primary/40 bg-clip-border opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div class="absolute inset-[1px] rounded-2xl bg-card"></div>
    
    <div class="relative z-10">
      <!-- Holographic icon -->
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center mb-4 group-hover:animate-pulse">
        <svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      </div>
      
      <!-- Content -->
      <h3 class="text-xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2">
        Holographic Card
      </h3>
      <p class="text-muted-foreground text-sm leading-relaxed mb-4">Interactive holographic effects that respond to mouse movement with dynamic color shifts.</p>
      
      <!-- Holographic data visualization -->
      <div class="space-y-3 mb-4">
        <div class="flex justify-between items-center">
          <span class="text-muted-foreground text-sm">Neural Activity</span>
          <span class="text-primary font-mono text-sm">94.7%</span>
        </div>
        <div class="w-full bg-muted rounded-full h-1 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full animate-pulse" style="width: 94.7%"></div>
        </div>
        
        <div class="flex justify-between items-center">
          <span class="text-muted-foreground text-sm">Quantum State</span>
          <span class="text-primary/80 font-mono text-sm">∞</span>
        </div>
        <div class="w-full bg-muted rounded-full h-1 overflow-hidden">
          <div class="h-full bg-gradient-to-r from-primary/80 to-primary/60 rounded-full animate-pulse" style="width: 100%"></div>
        </div>
      </div>
      
      <!-- Action button -->
      <button class="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-primary-foreground text-sm font-medium hover:shadow-lg hover:shadow-primary/50 transition-all duration-300 relative overflow-hidden group/btn">
        <span class="relative z-10">Initialize</span>
        <div class="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/80 to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Component metadata
defineOptions({
  name: 'HolographicCard'
})

const mouseX = ref(50)
const mouseY = ref(50)

const handleMouseMove = (e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  mouseX.value = ((e.clientX - rect.left) / rect.width) * 100
  mouseY.value = ((e.clientY - rect.top) / rect.height) * 100
}

const handleMouseLeave = () => {
  mouseX.value = 50
  mouseY.value = 50
}
</script>
