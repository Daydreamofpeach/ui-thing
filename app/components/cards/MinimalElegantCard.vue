<template>
  <div class="group relative overflow-hidden rounded-3xl bg-card border border-border p-8 transition-all duration-700 hover:shadow-2xl hover:shadow-foreground/10 hover:-translate-y-2">
    <!-- Subtle gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-muted/50 to-card opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <!-- Animated line -->
    <div class="absolute top-0 left-0 w-0 h-0.5 bg-gradient-to-r from-foreground to-foreground/60 group-hover:w-full transition-all duration-700 ease-out"></div>
    
    <div class="relative z-10">
      <!-- Number badge -->
      <div class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background text-sm font-bold mb-6 group-hover:scale-110 transition-transform duration-300">
        01
      </div>
      
      <!-- Content -->
      <h3 class="text-2xl font-bold text-card-foreground mb-3 group-hover:text-foreground/80 transition-colors duration-300">Minimal Elegance</h3>
      <p class="text-muted-foreground leading-relaxed mb-6">Clean, sophisticated design that focuses on typography and subtle interactions for maximum impact.</p>
      
      <!-- Feature list -->
      <ul class="space-y-2 mb-6">
        <li class="flex items-center text-sm text-card-foreground">
          <div class="w-1.5 h-1.5 rounded-full bg-muted-foreground mr-3 group-hover:bg-foreground transition-colors duration-300"></div>
          Premium Typography
        </li>
        <li class="flex items-center text-sm text-card-foreground">
          <div class="w-1.5 h-1.5 rounded-full bg-muted-foreground mr-3 group-hover:bg-foreground transition-colors duration-300"></div>
          Subtle Animations
        </li>
        <li class="flex items-center text-sm text-card-foreground">
          <div class="w-1.5 h-1.5 rounded-full bg-muted-foreground mr-3 group-hover:bg-foreground transition-colors duration-300"></div>
          Perfect Spacing
        </li>
      </ul>
      
      <!-- Action link -->
      <a href="#" class="inline-flex items-center text-card-foreground font-medium text-sm group-hover:text-foreground/80 transition-colors duration-300">
        Learn More
        <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </a>
    </div>
  </div>
</template>

<script setup>
// Component metadata
defineOptions({
  name: 'MinimalElegantCard'
})
</script>
