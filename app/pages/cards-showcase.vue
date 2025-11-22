<template>
  <div>
    <!-- Fluid Cursor Canvas -->
    <canvas id="fluid" class="fixed inset-0 pointer-events-none z-0 w-screen h-screen" style="width: 100vw; height: 100vh;" />
    
    <Mainnav />
    
    <!-- Background Blobs -->
    <TopBlob />
    <BottomBlob />
    
    <div class="min-h-screen bg-background py-12 px-4">
      <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-foreground mb-4">Stunning Card Collection</h1>
        <p class="text-muted-foreground max-w-2xl mx-auto">A showcase of unique, reusable card components with award-winning visual effects and smooth animations.</p>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        <div class="bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-1 rounded-2xl">
          <GlassMorphCard />
        </div>
        
        <NeonGlowCard />
        <MinimalElegantCard />
        <GradientBorderCard />
        <NeumorphismCard />
        <HolographicCard />
        <FloatingCard />
        
        <div class="rounded-2xl border-2 border-dashed border-border p-6 flex items-center justify-center min-h-[300px] group hover:border-border/60 transition-colors duration-300">
          <div class="text-center">
            <div class="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4 group-hover:bg-muted/80 transition-colors duration-300">
              <svg class="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <p class="text-muted-foreground text-sm">Add Your Card</p>
          </div>
        </div>
      </div>
      
      <div class="mt-16 bg-card rounded-2xl p-8 border border-border shadow-lg">
        <h2 class="text-2xl font-bold text-card-foreground mb-4">How to Use</h2>
        <div class="prose prose-gray max-w-none">
          <p class="text-muted-foreground mb-4">Each card component is self-contained and ready to use. Simply copy the component code and paste it into your Nuxt project:</p>
          
          <div class="bg-muted rounded-lg p-4 font-mono text-sm mb-4">
            <div class="text-muted-foreground"># Copy any card component to your components directory</div>
            <div class="text-primary">components/cards/GlassMorphCard.vue</div>
          </div>
          
          <p class="text-muted-foreground mb-4">Then import and use in your pages or components:</p>
          
          <div class="bg-muted rounded-lg p-4 font-mono text-sm">
            <div class="text-muted-foreground">&lt;template&gt;</div>
            <div class="text-primary ml-4">&lt;GlassMorphCard /&gt;</div>
            <div class="text-muted-foreground">&lt;/template&gt;</div>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import TopBlob from "~/components/Design/TopBlob.vue";
import BottomBlob from "~/components/Design/BottomBlob.vue";
import GlassMorphCard from "~/components/cards/GlassMorphCard.vue";
import NeonGlowCard from "~/components/cards/NeonGlowCard.vue";
import MinimalElegantCard from "~/components/cards/MinimalElegantCard.vue";
import GradientBorderCard from "~/components/cards/GradientBorderCard.vue";
import NeumorphismCard from "~/components/cards/NeumorphismCard.vue";
import HolographicCard from "~/components/cards/HolographicCard.vue";
import FloatingCard from "~/components/cards/FloatingCard.vue";

// Page metadata
definePageMeta({
  layout: 'blank',
  title: 'Cards Showcase',
  description: 'A showcase of unique, reusable card components with award-winning visual effects and smooth animations.'
})

// SEO
useSeoMeta({
  title: 'Cards Showcase - UI Thing',
  ogTitle: 'Cards Showcase - UI Thing',
  description: 'A showcase of unique, reusable card components with award-winning visual effects and smooth animations.',
  ogDescription: 'A showcase of unique, reusable card components with award-winning visual effects and smooth animations.',
  ogImage: '/cover.png',
  twitterCard: 'summary_large_image',
})

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
