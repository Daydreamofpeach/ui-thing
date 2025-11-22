<template>
  <ExampleShowcase :examples="examples" />
</template>

<script lang="ts" setup>
// Import the ExampleShowcase component
import ExampleShowcase from './ExampleShowcase.vue';

// Import all dashboard example components
import DashboardHeader from '~/components/Examples/Dashboard/Header.vue';

// Define all dashboard examples
const examples = [
  {
    title: 'Dashboard Header',
    component: DashboardHeader,
    iframeHeight: '400px'
  }
];
</script>
