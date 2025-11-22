<template>
  <div class="relative overflow-x-hidden">
  
    
    <Mainnav v-if="route.path !== '/'" />
    
    <!-- Background Blobs -->
    <TopBlob />
    <BottomBlob />      <!-- Fluid Cursor Canvas -->
    <canvas id="fluid" class="fixed inset-0 pointer-events-none z-0 w-screen h-screen" style="width: 100vw; height: 100vh;" />
    
    <div v-if="route.path !== '/'" class="px-5 py-14 lg:px-2 lg:py-20">
      <home-hero />
    </div>
    <slot />
  </div>
</template>

<script lang="ts" setup>
  import { kebabCase } from "lodash-es";
  import TopBlob from "~/components/Design/TopBlob.vue";
  import BottomBlob from "~/components/Design/BottomBlob.vue";

  const route = useRoute();
  const { data: navigation } = await useAsyncData(
    kebabCase(route.path) + "navigation",
    () => queryCollectionNavigation("content", ["icon", "label", "links", "layout"]),
    { default: () => [] }
  );

  provide("navigation", navigation);

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
