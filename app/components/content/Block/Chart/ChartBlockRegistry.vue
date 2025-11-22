<template>
  <div class="space-y-8">
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold">Chart Blocks</h1>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        A collection of different chart designs and variants. Each block showcases a unique approach to data visualization.
      </p>
    </div>

    <StaticBlockShowcase :variants="chartVariants" />
  </div>
</template>

<script lang="ts" setup>
// Import the StaticBlockShowcase component
import StaticBlockShowcase from '../StaticBlockShowcase.vue';

// Import all chart block components
import BlockChartRadar from './BlockChartRadar.client.vue';
import BlockChartRadialBar from './BlockChartRadialBar.client.vue';
import BlockChartBar from './BlockChartBar.client.vue';
import BlockChartBubble from './BlockChartBubble.client.vue';
import BlockChartDonut from './BlockChartDonut.client.vue';
import BlockChartLine from './BlockChartLine.client.vue';
import BlockChartPie from './BlockChartPie.client.vue';

// Define all chart variants with their configurations
const chartVariants = [
  {
    title: "Radar Chart",
    component: BlockChartRadar,
    iframeHeight: "500px",
    code: `<BlockChartRadar />`
  },
  {
    title: "Radial Bar Chart",
    component: BlockChartRadialBar,
    iframeHeight: "500px",
    code: `<BlockChartRadialBar />`
  },
  {
    title: "Bar Chart",
    component: BlockChartBar,
    iframeHeight: "500px",
    code: `<BlockChartBar />`
  },
  {
    title: "Bubble Chart",
    component: BlockChartBubble,
    iframeHeight: "500px",
    code: `<BlockChartBubble />`
  },
  {
    title: "Donut Chart",
    component: BlockChartDonut,
    iframeHeight: "500px",
    code: `<BlockChartDonut />`
  },
  {
    title: "Line Chart",
    component: BlockChartLine,
    iframeHeight: "500px",
    code: `<BlockChartLine />`
  },
  {
    title: "Pie Chart",
    component: BlockChartPie,
    iframeHeight: "500px",
    code: `<BlockChartPie />`
  }
];
</script>
