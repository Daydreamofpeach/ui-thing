<template>
  <div class="flex flex-col">
    <!-- Fluid Cursor Canvas -->
    <canvas id="fluid" class="fixed inset-0 pointer-events-none z-0 w-screen h-screen" style="width: 100vw; height: 100vh;" />
    
    <UiNavbar sticky>
      <div class="flex items-center justify-between px-4 py-2">
        <div class="min-w-0 flex-1">
          <!-- Placeholder for primary nav (Mainnav not available here) -->
        </div>
      </div>
    </UiNavbar>
    <main class="grid w-full grid-cols-1 px-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-10">
      <!-- Left sidebar with page links -->
      <div class="sticky top-14 z-20 hidden h-[calc(100dvh-57px)] border-r lg:block">
        <UiScrollArea class="h-[calc(100dvh-57px)] py-5 pr-6">
          <DocsNav :links="navigation" />
        </UiScrollArea>
      </div>
      <!-- Page content -->
       <TopBlob />
       <BottomBlob />
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>
  import { kebabCase } from "lodash-es";
  import TopBlob from "~/components/Design/TopBlob.vue";
  import BottomBlob from "~/components/Design/BottomBlob.vue";

  const route = useRoute();
  const { data: page } = await useAsyncData(kebabCase(route.path), () => {
    return queryCollection("content").path(route.path).first() || "page";
  });
  if (!page.value) {
    throw createError({ statusCode: 404, statusMessage: "Page not found", fatal: true });
  }
  const { data: navigation } = await useAsyncData(
    kebabCase(route.path) + "navigation",
    () => queryCollectionNavigation("content", ["icon", "label", "links", "layout"]) || "route",
    { default: () => [] }
  );

  provide("navigation", navigation);
  provide("page", page);

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
