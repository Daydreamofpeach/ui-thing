<template>
  <div class="space-y-8">
    <div>
      <h3 class="text-lg font-semibold mb-4">Chart Examples</h3>
      <p class="text-sm text-muted-foreground mb-6">
        See how your chart colors (chart-1 through chart-5) are applied to various chart types.
      </p>
    </div>

    <!-- Grid of Chart Examples -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Bar Chart -->
      <DocsApexChartsBar1 />

      <!-- Line Chart -->
      <DocsApexChartsLine1 />

      <!-- Pie Chart -->
      <DocsApexChartsPieDonut1 />

      <!-- Area Chart -->
      <DocsApexChartsArea1 />
    </div>
  </div>
</template>

<script lang="ts" setup>
import DocsApexChartsBar1 from '~/components/content/Docs/ApexCharts/Bar/DocsApexChartsBar1.vue';
import DocsApexChartsLine1 from '~/components/content/Docs/ApexCharts/Line/DocsApexChartsLine1.vue';
import DocsApexChartsPieDonut1 from '~/components/content/Docs/ApexCharts/PieDonut/DocsApexChartsPieDonut1.vue';
import DocsApexChartsArea1 from '~/components/content/Docs/ApexCharts/Area/DocsApexChartsArea1.vue';
</script>

