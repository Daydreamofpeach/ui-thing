<template>
  <div class="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 transition-all duration-500 hover:border-primary/50 neon-card">
    <!-- Neon glow effect -->
    <div class="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div class="absolute inset-0 neon-glow-inset group-hover:neon-glow-inset-active transition-all duration-500"></div>
    
    <!-- Animated border -->
    <div class="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
    <div class="absolute inset-[1px] rounded-2xl bg-card"></div>
    
    <div class="relative z-10">
      <!-- Glowing icon -->
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4 neon-icon group-hover:neon-icon-active transition-all duration-300">
        <svg class="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      
      <!-- Content -->
      <h3 class="text-xl font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors duration-300">Neon Glow Card</h3>
      <p class="text-muted-foreground text-sm leading-relaxed mb-4">Cyberpunk-inspired design with animated neon borders and glowing effects.</p>
      
      <!-- Stats -->
      <div class="flex justify-between items-center mb-4">
        <div class="text-center">
          <div class="text-lg font-bold text-primary">99%</div>
          <div class="text-xs text-muted-foreground">Efficiency</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-primary/80">24/7</div>
          <div class="text-xs text-muted-foreground">Uptime</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-primary/60">∞</div>
          <div class="text-xs text-muted-foreground">Potential</div>
        </div>
      </div>
      
      <!-- Action button -->
      <button class="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium hover:from-primary/90 hover:to-primary/70 transition-all duration-300 neon-button">
        Activate
      </button>
    </div>
  </div>
</template>

<script setup>
// Component metadata
defineOptions({
  name: 'NeonGlowCard'
})
</script>

<style scoped>
/* Neon glow effects using theme colors */
.neon-glow-inset {
  box-shadow: inset 0 0 50px hsl(var(--primary) / 0.1);
}

.neon-glow-inset-active {
  box-shadow: inset 0 0 50px hsl(var(--primary) / 0.3);
}

.neon-icon {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.5);
}

.neon-icon-active {
  box-shadow: 0 0 30px hsl(var(--primary) / 0.8);
}

.neon-button {
  box-shadow: 0 0 20px hsl(var(--primary) / 0.25);
}

.neon-button:hover {
  box-shadow: 0 0 30px hsl(var(--primary) / 0.4);
}
</style>
