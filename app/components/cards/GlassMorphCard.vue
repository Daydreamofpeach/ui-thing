<template>
  <div class="group relative overflow-hidden rounded-2xl bg-card/10 backdrop-blur-md border border-border/20 p-6 transition-all duration-500 hover:bg-card/15 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 glass-card">
    <!-- Animated background gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <!-- Floating orbs -->
    <div class="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/60 to-primary/80 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
    <div class="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-primary/40 to-primary/60 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
    
    <div class="relative z-10">
      <!-- Icon -->
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300 glass-icon">
        <svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      
      <!-- Content -->
      <h3 class="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary/80 transition-colors duration-300">Glass Morph Card</h3>
      <p class="text-muted-foreground text-sm leading-relaxed mb-4">Beautiful glass morphism effect with animated background gradients and floating elements.</p>
      
      <!-- Action button -->
      <button class="w-full py-2 px-4 rounded-lg bg-card/10 border border-border/20 text-card-foreground text-sm font-medium hover:bg-card/20 transition-all duration-300 backdrop-blur-sm glass-button">
        Explore More
      </button>
    </div>
  </div>
</template>

<script setup>
// Component metadata
defineOptions({
  name: 'GlassMorphCard'
})
</script>

<style scoped>
/* Glass morphism effects using theme colors */
.glass-card {
  background: hsl(var(--card) / 0.1);
  border: 1px solid hsl(var(--border) / 0.2);
}

.glass-icon {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.3);
}

.glass-button {
  background: hsl(var(--card) / 0.1);
  border: 1px solid hsl(var(--border) / 0.2);
}

.glass-button:hover {
  background: hsl(var(--card) / 0.2);
  border: 1px solid hsl(var(--border) / 0.3);
}
</style>
