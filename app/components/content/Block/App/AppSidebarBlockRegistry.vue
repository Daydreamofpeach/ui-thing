<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">App Sidebar Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different app sidebar designs and variants. Each block showcases a unique approach to application sidebars.
      </p>
    </div>

    <StaticBlockShowcase :variants="appSidebarVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all app sidebar block components
import BlockAppSidebar1 from './Sidebar/BlockAppSidebar1.vue';
import BlockAppSidebar2 from './Sidebar/BlockAppSidebar2.vue';

// Define all app sidebar variants with their configurations
const appSidebarVariants = [
  {
    title: "App Sidebar Style One",
    component: BlockAppSidebar1,
    iframeHeight: "600px",
    code: `<BlockAppSidebar1 />`
  },
  {
    title: "App Sidebar Style Two",
    component: BlockAppSidebar2,
    iframeHeight: "600px",
    code: `<BlockAppSidebar2 />`
  }
];
</script>
