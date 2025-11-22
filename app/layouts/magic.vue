<template>
  <div class="flex flex-col">
    <!-- Fluid Cursor Canvas -->
    <canvas id="fluid" class="fixed inset-0 pointer-events-none z-0 w-screen h-screen" style="width: 100vw; height: 100vh;" />
    
    <Mainnav />
    <main class="grid w-full grid-cols-1 px-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:gap-10">
      <!-- Left sidebar with page links -->
      <div class="sticky top-14 z-20 hidden h-[calc(100dvh-57px)] border-r lg:block">
        <UiScrollArea class="h-[calc(100dvh-57px)] py-5 pr-6">
          <DocsNav :links="navigation?.[0]?.children" />
        </UiScrollArea>
      </div>
      <!-- Page content -->
      <slot />
    </main>
  </div>
</template>

<script lang="ts" setup>


  const route = useRoute();
  // Static navigation for magic components
  const navigation = [
    {
      title: "Components",
      children: [
        {
          title: "Animated Pointer",
          path: "/magic/pointer",
          icon: "lucide:mouse-pointer"
        },
        {
          title: "Scroll Progress",
          path: "/magic/scroll-progress",
          icon: "lucide:bar-chart-3"
        },
        {
          title: "Marquee",
          path: "/magic/marquee",
          icon: "lucide:move-horizontal"
        },
        {
          title: "Hero Video Dialog",
          path: "/magic/hero-video-dialog",
          icon: "lucide:video"
        },
        {
          title: "Safari Browser Mock",
          path: "/magic/safari",
          icon: "lucide:globe"
        },
        {
          title: "Android Device Mock",
          path: "/magic/android",
          icon: "lucide:smartphone"
        },
        {
          title: "iPhone 15 Pro Mock",
          path: "/magic/iphone-15-pro",
          icon: "lucide:smartphone"
        }
      ]
    }
  ];

  provide("navigation", navigation[0]?.children);

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
