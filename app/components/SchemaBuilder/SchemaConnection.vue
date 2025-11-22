<template>
  <div class="schema-connection">
    <!-- Connection Controls -->
    <div class="connection-controls">
      <UiButton
        size="icon"
        variant="ghost"
        class="h-6 w-6 bg-destructive/10 text-destructive hover:bg-destructive/20"
        @click="deleteConnection"
      >
        <Icon name="lucide:x" class="h-3 w-3" />
      </UiButton>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { EdgeProps } from "@vue-flow/core";

// Props
const props = defineProps<EdgeProps>();

// Emits
const emit = defineEmits<{
  'delete': [edgeId: string];
}>();

// Methods
const deleteConnection = () => {
  if (confirm('Are you sure you want to delete this connection?')) {
    emit('delete', props.id);
  }
};
</script>

<style scoped>
.schema-connection {
  position: relative;
}

.connection-controls {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.schema-connection:hover .connection-controls {
  opacity: 1;
}
</style>
