<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Header Section Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different header section designs and variants. Each block showcases a unique approach to page headers.
      </p>
    </div>

    <StaticBlockShowcase :variants="headerSectionVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all header section block components
import BlockHeaderSection1 from './BlockHeaderSection1.vue';
import BlockHeaderSection2 from './BlockHeaderSection2.vue';
import BlockHeaderSection3 from './BlockHeaderSection3.vue';
import BlockHeaderSection4 from './BlockHeaderSection4.vue';
import BlockHeaderSection5 from './BlockHeaderSection5.vue';
import BlockHeaderSection6 from './BlockHeaderSection6.vue';
import BlockHeaderSection7 from './BlockHeaderSection7.vue';
import BlockHeaderSection8 from './BlockHeaderSection8.vue';
import BlockHeaderSection9 from './BlockHeaderSection9.vue';
import BlockHeaderSection10 from './BlockHeaderSection10.vue';
import BlockHeaderSection11 from './BlockHeaderSection11.vue';
import BlockHeaderSection12 from './BlockHeaderSection12.vue';
import BlockHeaderSection13 from './BlockHeaderSection13.vue';
import BlockHeaderSection14 from './BlockHeaderSection14.vue';
import BlockHeaderSection15 from './BlockHeaderSection15.vue';

// Define all header section variants with their configurations
const headerSectionVariants = [
  {
    title: "Header Section Style One",
    component: BlockHeaderSection1,
    iframeHeight: "400px",
    code: `<BlockHeaderSection1 />`
  },
  {
    title: "Header Section Style Two",
    component: BlockHeaderSection2,
    iframeHeight: "400px",
    code: `<BlockHeaderSection2 />`
  },
  {
    title: "Header Section Style Three",
    component: BlockHeaderSection3,
    iframeHeight: "400px",
    code: `<BlockHeaderSection3 />`
  },
  {
    title: "Header Section Style Four",
    component: BlockHeaderSection4,
    iframeHeight: "400px",
    code: `<BlockHeaderSection4 />`
  },
  {
    title: "Header Section Style Five",
    component: BlockHeaderSection5,
    iframeHeight: "400px",
    code: `<BlockHeaderSection5 />`
  },
  {
    title: "Header Section Style Six",
    component: BlockHeaderSection6,
    iframeHeight: "400px",
    code: `<BlockHeaderSection6 />`
  },
  {
    title: "Header Section Style Seven",
    component: BlockHeaderSection7,
    iframeHeight: "400px",
    code: `<BlockHeaderSection7 />`
  },
  {
    title: "Header Section Style Eight",
    component: BlockHeaderSection8,
    iframeHeight: "400px",
    code: `<BlockHeaderSection8 />`
  },
  {
    title: "Header Section Style Nine",
    component: BlockHeaderSection9,
    iframeHeight: "400px",
    code: `<BlockHeaderSection9 />`
  },
  {
    title: "Header Section Style Ten",
    component: BlockHeaderSection10,
    iframeHeight: "400px",
    code: `<BlockHeaderSection10 />`
  },
  {
    title: "Header Section Style Eleven",
    component: BlockHeaderSection11,
    iframeHeight: "400px",
    code: `<BlockHeaderSection11 />`
  },
  {
    title: "Header Section Style Twelve",
    component: BlockHeaderSection12,
    iframeHeight: "400px",
    code: `<BlockHeaderSection12 />`
  },
  {
    title: "Header Section Style Thirteen",
    component: BlockHeaderSection13,
    iframeHeight: "400px",
    code: `<BlockHeaderSection13 />`
  },
  {
    title: "Header Section Style Fourteen",
    component: BlockHeaderSection14,
    iframeHeight: "400px",
    code: `<BlockHeaderSection14 />`
  },
  {
    title: "Header Section Style Fifteen",
    component: BlockHeaderSection15,
    iframeHeight: "400px",
    code: `<BlockHeaderSection15 />`
  }
];
</script>
