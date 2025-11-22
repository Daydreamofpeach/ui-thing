<template>
  <div>
    <UiCard class="flex flex-col">
      <UiCardHeader class="items-center pb-0">
        <UiCardTitle>Pie Chart</UiCardTitle>
        <UiCardDescription>January - June 2024</UiCardDescription>
      </UiCardHeader>
      <UiCardContent class="h-[250px]">
        <UiApexchart type="pie" :series :options />
      </UiCardContent>
      <UiCardFooter class="flex-col gap-2 text-sm">
        <div class="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <Icon name="lucide:trending-up" class="size-4" />
        </div>
        <div class="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </UiCardFooter>
    </UiCard>
  </div>
</template>

<script lang="ts" setup>
  import { faker } from "@faker-js/faker";
  import type { ApexOptions } from "apexcharts";

  const series = ref<ApexOptions["series"]>(
    Array.from({ length: 6 }, () => faker.number.int({ min: 1000, max: 5000 }))
  );

  const options = ref<ApexOptions>({
    stroke: { width: 0 },
    // Colors will use the default from window.Apex which reads from chart-1 through chart-5 CSS variables
    // Removed monochrome theme to use theme chart colors
    labels: ["January", "February", "March", "April", "May", "June"],
    states: { hover: { filter: { type: "none" } }, active: { filter: { type: "none" } } },
    tooltip: { followCursor: true },
  });
</script>
