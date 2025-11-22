<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Metric Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different metric section designs and variants. Each block showcases a unique approach to displaying statistics and numbers.
      </p>
    </div>

    <StaticBlockShowcase :variants="metricVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import all metric block components
import BlockMetric1 from './BlockMetric1.vue';
import BlockMetric2 from './BlockMetric2.vue';
import BlockMetric3 from './BlockMetric3.vue';
import BlockMetric4 from './BlockMetric4.vue';

// Define all metric variants with their configurations
const metricVariants = [
  {
    title: "Metric Style One",
    component: BlockMetric1,
    iframeHeight: "400px",
    code: `<BlockMetric1 />`
  },
  {
    title: "Metric Style Two",
    component: BlockMetric2,
    iframeHeight: "400px",
    code: `<BlockMetric2 />`
  },
  {
    title: "Metric Style Three",
    component: BlockMetric3,
    iframeHeight: "400px",
    code: `<BlockMetric3 />`
  },
  {
    title: "Metric Style Four",
    component: BlockMetric4,
    iframeHeight: "400px",
    code: `<BlockMetric4 />`
  }
];
</script>
