<template>
  <ExampleShowcase :examples="examples" />
</template>

<script lang="ts" setup>
// Import the ExampleShowcase component
import ExampleShowcase from './ExampleShowcase.vue';

// Import all schema visualizer example components
import SchemaVisualizer from '~/components/Examples/SchemaVisualizer/SchemaVisualizer.vue';
import TemplateSwitcher from '~/components/Examples/SchemaVisualizer/TemplateSwitcher.vue';
import SchemaHeader from '~/components/Examples/SchemaVisualizer/Header.vue';
import Participants from '~/components/Examples/SchemaVisualizer/Participants.vue';
import TableNode from '~/components/Examples/SchemaVisualizer/TableNode.vue';
import SchemaBuilder from '~/components/SchemaBuilder/SchemaBuilder.vue';

// Define all schema visualizer examples
const examples = [
  {
    title: 'Schema Visualizer',
    component: SchemaVisualizer,
    iframeHeight: '600px'
  },
  {
    title: 'Schema Builder',
    component: SchemaBuilder,
    iframeHeight: '600px'
  },
  {
    title: 'Template Switcher',
    component: TemplateSwitcher,
    iframeHeight: '400px'
  },
  {
    title: 'Schema Header',
    component: SchemaHeader,
    iframeHeight: '300px'
  },
  {
    title: 'Participants',
    component: Participants,
    iframeHeight: '300px'
  },
  {
    title: 'Table Node',
    component: TableNode,
    iframeHeight: '400px'
  }
];
</script>
