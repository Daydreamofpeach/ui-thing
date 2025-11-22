<template>
  <div class="min-h-screen bg-background">
    <!-- Fluid Cursor Canvas -->
    <canvas id="fluid" class="fixed inset-0 pointer-events-none z-0 w-screen h-screen" style="width: 100vw; height: 100vh;" />
    
    <!-- Simple header with back link -->
    <header class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div class="container flex h-14 items-center">
        <NuxtLink to="/" class="flex items-center space-x-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <Icon name="radix-icons:arrow-left" class="h-4 w-4" />
          <span>Back to Home</span>
        </NuxtLink>
      </div>
    </header>
    
    <!-- Page content -->
    <main>
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
  // Initialize Fluid Cursor
  onMounted(async () => {
    try {
      const { default: useFluidCursor } = await import("~/components/Design/FluidCursor.js");
      useFluidCursor();
    } catch (error) {
      console.warn("Could not load FluidCursor:", error);
    }
  });
</script>

<style scoped>
#fluid {
  width: 100vw !important;
  height: 100vh !important;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  z-index: 0;
  pointer-events: none;
}
</style>
