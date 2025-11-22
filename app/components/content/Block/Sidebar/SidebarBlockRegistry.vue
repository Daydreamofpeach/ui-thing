<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Sidebar Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different sidebar designs and variants. Each block showcases a unique approach to navigation sidebars.
      </p>
    </div>

    <StaticBlockShowcase :variants="sidebarVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all sidebar block components
import BlockSidebar01 from './BlockSidebar01.vue';
import BlockSidebar02 from './BlockSidebar02.vue';
import BlockSidebar03 from './BlockSidebar03.vue';
import BlockSidebar04 from './BlockSidebar04.vue';
import BlockSidebar05 from './BlockSidebar05.vue';
import BlockSidebar06 from './BlockSidebar06.vue';
import BlockSidebar07 from './BlockSidebar07.vue';
import BlockSidebar08 from './BlockSidebar08.vue';
import BlockSidebar09 from './BlockSidebar09.vue';
import BlockSidebar10 from './BlockSidebar10.vue';
import BlockSidebar11 from './BlockSidebar11.vue';
import BlockSidebar12 from './BlockSidebar12.vue';
import BlockSidebar13 from './BlockSidebar13.vue';
import BlockSidebar14 from './BlockSidebar14.vue';
import BlockSidebarFirstSidebar from './BlockSidebarFirstSidebar.vue';
import BlockSidebarHeader from './BlockSidebarHeader.vue';
import BlockSidebarFooter from './BlockSidebarFooter.vue';
import BlockSidebarSidebarRail from './BlockSidebarSidebarRail.vue';
import BlockSidebarSidebarGroupAction from './BlockSidebarSidebarGroupAction.vue';
import BlockSidebarSidebarMenuAction from './BlockSidebarSidebarMenuAction.vue';
import BlockSidebarSidebarMenuBadge from './BlockSidebarSidebarMenuBadge.vue';
import BlockSidebarSidebarMenuSub from './BlockSidebarSidebarMenuSub.vue';
import BlockSidebarSidebarMenuSubCollapsible from './BlockSidebarSidebarMenuSubCollapsible.vue';
import BlockSidebarCollapsibleSideGroup from './BlockSidebarCollapsibleSideGroup.vue';
import BlockSidebarControlled from './BlockSidebarControlled.vue';

// Define all sidebar variants with their configurations
const sidebarVariants = [
  {
    title: "Sidebar Style One",
    component: BlockSidebar01,
    iframeHeight: "600px",
    code: `<BlockSidebar01 />`
  },
  {
    title: "Sidebar Style Two",
    component: BlockSidebar02,
    iframeHeight: "600px",
    code: `<BlockSidebar02 />`
  },
  {
    title: "Sidebar Style Three",
    component: BlockSidebar03,
    iframeHeight: "600px",
    code: `<BlockSidebar03 />`
  },
  {
    title: "Sidebar Style Four",
    component: BlockSidebar04,
    iframeHeight: "600px",
    code: `<BlockSidebar04 />`
  },
  {
    title: "Sidebar Style Five",
    component: BlockSidebar05,
    iframeHeight: "600px",
    code: `<BlockSidebar05 />`
  },
  {
    title: "Sidebar Style Six",
    component: BlockSidebar06,
    iframeHeight: "600px",
    code: `<BlockSidebar06 />`
  },
  {
    title: "Sidebar Style Seven",
    component: BlockSidebar07,
    iframeHeight: "600px",
    code: `<BlockSidebar07 />`
  },
  {
    title: "Sidebar Style Eight",
    component: BlockSidebar08,
    iframeHeight: "600px",
    code: `<BlockSidebar08 />`
  },
  {
    title: "Sidebar Style Nine",
    component: BlockSidebar09,
    iframeHeight: "600px",
    code: `<BlockSidebar09 />`
  },
  {
    title: "Sidebar Style Ten",
    component: BlockSidebar10,
    iframeHeight: "600px",
    code: `<BlockSidebar10 />`
  },
  {
    title: "Sidebar Style Eleven",
    component: BlockSidebar11,
    iframeHeight: "600px",
    code: `<BlockSidebar11 />`
  },
  {
    title: "Sidebar Style Twelve",
    component: BlockSidebar12,
    iframeHeight: "600px",
    code: `<BlockSidebar12 />`
  },
  {
    title: "Sidebar Style Thirteen",
    component: BlockSidebar13,
    iframeHeight: "600px",
    code: `<BlockSidebar13 />`
  },
  {
    title: "Sidebar Style Fourteen",
    component: BlockSidebar14,
    iframeHeight: "600px",
    code: `<BlockSidebar14 />`
  },
  {
    title: "First Sidebar",
    component: BlockSidebarFirstSidebar,
    iframeHeight: "600px",
    code: `<BlockSidebarFirstSidebar />`
  },
  {
    title: "Sidebar Header",
    component: BlockSidebarHeader,
    iframeHeight: "600px",
    code: `<BlockSidebarHeader />`
  },
  {
    title: "Sidebar Footer",
    component: BlockSidebarFooter,
    iframeHeight: "600px",
    code: `<BlockSidebarFooter />`
  },
  {
    title: "Sidebar Rail",
    component: BlockSidebarSidebarRail,
    iframeHeight: "600px",
    code: `<BlockSidebarSidebarRail />`
  },
  {
    title: "Sidebar Group Action",
    component: BlockSidebarSidebarGroupAction,
    iframeHeight: "600px",
    code: `<BlockSidebarSidebarGroupAction />`
  },
  {
    title: "Sidebar Menu Action",
    component: BlockSidebarSidebarMenuAction,
    iframeHeight: "600px",
    code: `<BlockSidebarSidebarMenuAction />`
  },
  {
    title: "Sidebar Menu Badge",
    component: BlockSidebarSidebarMenuBadge,
    iframeHeight: "600px",
    code: `<BlockSidebarSidebarMenuBadge />`
  },
  {
    title: "Sidebar Menu Sub",
    component: BlockSidebarSidebarMenuSub,
    iframeHeight: "600px",
    code: `<BlockSidebarSidebarMenuSub />`
  },
  {
    title: "Sidebar Menu Sub Collapsible",
    component: BlockSidebarSidebarMenuSubCollapsible,
    iframeHeight: "600px",
    code: `<BlockSidebarSidebarMenuSubCollapsible />`
  },
  {
    title: "Collapsible Side Group",
    component: BlockSidebarCollapsibleSideGroup,
    iframeHeight: "600px",
    code: `<BlockSidebarCollapsibleSideGroup />`
  },
  {
    title: "Controlled Sidebar",
    component: BlockSidebarControlled,
    iframeHeight: "600px",
    code: `<BlockSidebarControlled />`
  }
];
</script>
