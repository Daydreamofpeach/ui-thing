<template>
  <div class="schema-node">
    <div class="bg-card border border-border rounded-lg shadow-lg min-w-[200px]">
      <!-- Header -->
      <div class="bg-muted/50 px-3 py-2 border-b border-border rounded-t-lg">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-sm text-foreground">{{ data?.label || 'Unnamed Table' }}</h3>
          <div class="flex items-center gap-1">
            <UiButton
              size="icon"
              variant="ghost"
              class="h-6 w-6"
              @click="editNode"
            >
              <Icon name="lucide:edit" class="h-3 w-3" />
            </UiButton>
            <UiButton
              size="icon"
              variant="ghost"
              class="h-6 w-6 text-destructive hover:text-destructive"
              @click="deleteNode"
            >
              <Icon name="lucide:trash-2" class="h-3 w-3" />
            </UiButton>
          </div>
        </div>
      </div>
      
      <!-- Fields -->
      <div class="p-2">
        <div v-for="field in (data.fields || [])" :key="field.name" class="field-row">
          <div class="field-info text-xs">
            <span class="font-medium text-foreground min-w-0 truncate">
              {{ field.name }}
            </span>
            <span class="text-muted-foreground">{{ field.type }}</span>
            <div v-if="field.isPrimary" class="ml-auto">
              <Icon name="lucide:key" class="h-3 w-3 text-primary" />
            </div>
            <div v-else-if="field.isForeign" class="ml-auto">
              <Icon name="lucide:link" class="h-3 w-3 text-blue-500" />
            </div>
          </div>
          
          <!-- Field handles - always visible for connections -->
          <Handle
            :id="`${field.name}-source`"
            type="source"
            :position="Position.Left"
            class="size-3 rounded-full border-2 border-background transition-all hover:scale-125 cursor-pointer"
            :class="[selected ? '!bg-primary' : '!bg-blue-500']"
            :connectable="true"
            v-tippy="'Click to connect'"
          />
          
          <Handle
            :id="`${field.name}-target`"
            type="target"
            :position="Position.Right"
            class="size-3 rounded-full border-2 border-background transition-all hover:scale-125 cursor-pointer"
            :class="[selected ? '!bg-primary' : '!bg-green-500']"
            :connectable="true"
            v-tippy="'Click to connect'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Handle, Position } from "@vue-flow/core";
import type { NodeProps, Edge } from "@vue-flow/core";
import type { CustomTableField, CustomTableData, CustomTableEvents, CustomNodeType } from "./types";

// Props
const props = defineProps<NodeProps<CustomTableData>>();

// Emits
const emit = defineEmits<{
  'update': [node: CustomNodeType];
  'delete': [nodeId: string];
}>();

// Methods
const editNode = () => {
  emit('update', props as any);
};

const deleteNode = () => {
  if (confirm(`Are you sure you want to delete the "${props.data?.label || 'Unnamed Table'}" table?`)) {
    emit('delete', props.id);
  }
};




</script>

<style scoped>
.schema-node {
  position: relative;
}

.field-row {
  position: relative;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field-row:last-child {
  border-bottom: none;
}

.field-row:hover {
  background-color: var(--muted);
  border-radius: 0.25rem;
}

.field-info {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Handle animations */
.schema-node :deep(.vue-flow__handle) {
  transition: all 0.2s ease;
}

.schema-node :deep(.vue-flow__handle:hover) {
  transform: scale(1.25);
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
}

.schema-node :deep(.vue-flow__handle:active) {
  transform: scale(0.9);
}
</style>
