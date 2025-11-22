<template>
  <div class="group relative overflow-hidden rounded-3xl bg-muted p-8 transition-all duration-500 neumorphic-shadow hover:neumorphic-shadow-lg">
    <!-- Inner shadow effect -->
    <div class="absolute inset-4 rounded-2xl bg-muted neumorphic-inset opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    
    <div class="relative z-10">
      <!-- Neumorphic icon -->
      <div class="w-16 h-16 rounded-2xl bg-muted neumorphic-elevated flex items-center justify-center mb-6 group-hover:neumorphic-pressed transition-all duration-300">
        <svg class="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      
      <!-- Content -->
      <h3 class="text-2xl font-bold text-foreground mb-3">Neumorphism</h3>
      <p class="text-muted-foreground leading-relaxed mb-6">Soft UI design with subtle shadows and highlights that create a tactile, embossed appearance.</p>
      
      <!-- Neumorphic buttons -->
      <div class="flex gap-3 mb-6">
        <button class="flex-1 py-3 px-4 rounded-xl bg-muted neumorphic-elevated text-foreground font-medium hover:neumorphic-pressed transition-all duration-300">
          Like
        </button>
        <button class="flex-1 py-3 px-4 rounded-xl bg-muted neumorphic-elevated text-foreground font-medium hover:neumorphic-pressed transition-all duration-300">
          Share
        </button>
      </div>
      
      <!-- Stats with neumorphic design -->
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center p-3 rounded-xl bg-muted neumorphic-inset">
          <div class="text-lg font-bold text-foreground">2.4k</div>
          <div class="text-xs text-muted-foreground">Views</div>
        </div>
        <div class="text-center p-3 rounded-xl bg-muted neumorphic-inset">
          <div class="text-lg font-bold text-foreground">156</div>
          <div class="text-xs text-muted-foreground">Likes</div>
        </div>
        <div class="text-center p-3 rounded-xl bg-muted neumorphic-inset">
          <div class="text-lg font-bold text-foreground">23</div>
          <div class="text-xs text-muted-foreground">Shares</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Component metadata
defineOptions({
  name: 'NeumorphismCard'
})
</script>

<style scoped>
/* Neumorphic shadow effects using theme colors */
.neumorphic-shadow {
  box-shadow: 
    10px 10px 30px hsl(var(--muted-foreground) / 0.3),
    -10px -10px 30px hsl(var(--background));
}

.neumorphic-shadow-lg {
  box-shadow: 
    20px 20px 60px hsl(var(--muted-foreground) / 0.4),
    -20px -20px 60px hsl(var(--background));
}

.neumorphic-elevated {
  box-shadow: 
    8px 8px 16px hsl(var(--muted-foreground) / 0.3),
    -8px -8px 16px hsl(var(--background));
}

.neumorphic-pressed {
  box-shadow: 
    inset 8px 8px 16px hsl(var(--muted-foreground) / 0.3),
    inset -8px -8px 16px hsl(var(--background));
}

.neumorphic-inset {
  box-shadow: 
    inset 3px 3px 6px hsl(var(--muted-foreground) / 0.3),
    inset -3px -3px 6px hsl(var(--background));
}
</style>
