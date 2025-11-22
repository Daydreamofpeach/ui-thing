<template>
  <div class="group relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-br from-primary via-primary/80 to-primary/60 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/25">
    <!-- Inner card -->
    <div class="relative overflow-hidden rounded-2xl bg-card p-6 h-full transition-all duration-500 group-hover:bg-card/95">
      <!-- Animated background pattern -->
      <div class="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500">
        <div class="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60"></div>
      </div>
      
      <!-- Floating shapes -->
      <div class="absolute top-4 right-4 w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary/80 opacity-20 group-hover:opacity-40 group-hover:scale-125 transition-all duration-500"></div>
      <div class="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-gradient-to-br from-primary/40 to-primary/60 opacity-20 group-hover:opacity-40 group-hover:scale-125 transition-all duration-700"></div>
      
      <div class="relative z-10">
        <!-- Icon with gradient -->
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform duration-300 gradient-icon">
          <svg class="w-7 h-7 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        
        <!-- Content -->
        <h3 class="text-xl font-bold text-card-foreground mb-2 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:via-primary/80 group-hover:to-primary/60 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
          Gradient Border
        </h3>
        <p class="text-muted-foreground text-sm leading-relaxed mb-4">Dynamic gradient borders with smooth hover animations and colorful accents.</p>
        
        <!-- Progress bar -->
        <div class="mb-4">
          <div class="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>85%</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-primary via-primary/80 to-primary/60 rounded-full transition-all duration-1000 group-hover:w-full" style="width: 85%"></div>
          </div>
        </div>
        
        <!-- Action button -->
        <button class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary via-primary/80 to-primary/60 text-primary-foreground font-medium hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:scale-[1.02] gradient-button">
          Get Started
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component metadata
defineOptions({
  name: 'GradientBorderCard'
})
</script>

<style scoped>
/* Gradient effects using theme colors */
.gradient-icon {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}

.gradient-button {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}

.gradient-button:hover {
  box-shadow: 0 0 30px hsl(var(--primary) / 0.4);
}
</style>
