<template>
  <div class="group relative">
    <!-- Floating shadow -->
    <div class="absolute inset-0 bg-primary/20 rounded-2xl blur-xl transform translate-y-4 group-hover:translate-y-6 group-hover:bg-primary/30 transition-all duration-500"></div>
    
    <!-- Main card -->
    <div class="relative bg-card rounded-2xl p-6 border border-border transform group-hover:-translate-y-2 transition-all duration-500 shadow-lg group-hover:shadow-2xl">
      <!-- Floating elements -->
      <div class="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-bounce [animation-delay:0s]"></div>
      <div class="absolute -top-1 -right-6 w-2 h-2 bg-primary/80 rounded-full animate-bounce [animation-delay:0.5s]"></div>
      <div class="absolute -top-3 -right-10 w-3 h-3 bg-primary/60 rounded-full animate-bounce [animation-delay:1s]"></div>
      
      <!-- Content -->
      <div class="relative z-10">
        <!-- Floating icon -->
        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-300 floating-icon">
          <svg class="w-7 h-7 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
          </svg>
        </div>
        
        <!-- Content -->
        <h3 class="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors duration-300">Floating Card</h3>
        <p class="text-muted-foreground text-sm leading-relaxed mb-4">Levitating design with animated floating elements and smooth hover transitions.</p>
        
        <!-- Floating metrics -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="text-center p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
            <div class="text-lg font-bold text-primary">4.9</div>
            <div class="text-xs text-primary/80">Rating</div>
          </div>
          <div class="text-center p-3 rounded-xl bg-primary/5 group-hover:bg-primary/15 transition-colors duration-300">
            <div class="text-lg font-bold text-primary/80">1.2k</div>
            <div class="text-xs text-primary/60">Reviews</div>
          </div>
        </div>
        
        <!-- Floating action button -->
        <button class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium transform group-hover:scale-105 transition-all duration-300 floating-button">
          Take Flight
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component metadata
defineOptions({
  name: 'FloatingCard'
})
</script>

<style scoped>
/* Floating effects using theme colors */
.floating-icon {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}

.floating-button {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}

.floating-button:hover {
  box-shadow: 0 0 30px hsl(var(--primary) / 0.5);
}
</style>
