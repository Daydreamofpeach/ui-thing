<template>
  <div class="node-editor">
    <div class="space-y-4">
      <!-- Table Name -->
      <div>
        <label class="text-sm font-medium text-foreground">Table Name</label>
        <UiInput
          v-model="editingNode.label"
          placeholder="Enter table name"
          class="mt-1"
        />
      </div>

      <!-- Fields -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-sm font-medium text-foreground">Fields</label>
          <UiButton
            size="sm"
            variant="outline"
            @click="addField"
          >
            <Icon name="lucide:plus" class="h-4 w-4 mr-1" />
            Add Field
          </UiButton>
        </div>

        <div class="space-y-2">
          <div
            v-for="(field, index) in editingNode.fields"
            :key="index"
            class="flex items-center gap-2 p-2 border border-border rounded-md bg-muted/30"
          >
            <!-- Field Name -->
            <UiInput
              v-model="field.name"
              placeholder="Field name"
              class="flex-1"
            />
            
            <!-- Field Type -->
            <UiSelect v-model="field.type">
              <UiSelectTrigger class="w-32">
                <UiSelectValue :placeholder="field.type || 'Type'" />
              </UiSelectTrigger>
              <UiSelectContent>
                <UiSelectItem value="int">int</UiSelectItem>
                <UiSelectItem value="varchar">varchar</UiSelectItem>
                <UiSelectItem value="text">text</UiSelectItem>
                <UiSelectItem value="decimal">decimal</UiSelectItem>
                <UiSelectItem value="date">date</UiSelectItem>
                <UiSelectItem value="timestamp">timestamp</UiSelectItem>
                <UiSelectItem value="boolean">boolean</UiSelectItem>
                <UiSelectItem value="json">json</UiSelectItem>
              </UiSelectContent>
            </UiSelect>
            
            <!-- Primary Key -->
            <UiButton
              size="icon"
              variant="ghost"
              :class="field.isPrimary ? 'bg-primary text-primary-foreground' : 'bg-muted'"
              @click="togglePrimary(index)"
            >
              <Icon name="lucide:key" class="h-4 w-4" />
            </UiButton>
            
            <!-- Foreign Key -->
            <UiButton
              size="icon"
              variant="ghost"
              :class="field.isForeign ? 'bg-blue-500 text-white' : 'bg-muted'"
              @click="toggleForeign(index)"
            >
              <Icon name="lucide:link" class="h-4 w-4" />
            </UiButton>
            
            <!-- Delete Field -->
            <UiButton
              size="icon"
              variant="ghost"
              class="text-destructive hover:text-destructive"
              @click="removeField(index)"
            >
              <Icon name="lucide:trash-2" class="h-4 w-4" />
            </UiButton>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 pt-4">
        <UiButton
          v-if="isEditing"
          variant="outline"
          @click="cancelEdit"
        >
          Cancel
        </UiButton>
        <UiButton
          @click="saveNode"
          :disabled="!editingNode.label || editingNode.fields.length === 0"
        >
          {{ isEditing ? 'Update' : 'Create' }} Table
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Node } from "@vue-flow/core";
import type { CustomTableField, CustomTableData } from "./types";

// Props
interface Props {
  node?: Node<CustomTableData>;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  'save': [node: Node<CustomTableData>];
  'cancel': [];
}>();

// Reactive data
const isEditing = computed(() => !!props.node);

const editingNode = ref<CustomTableData>({
  label: '',
  fields: []
});

// Initialize with props or defaults
watch(() => props.node, (node) => {
  if (node) {
    editingNode.value = {
      label: node.data.label,
      fields: [...node.data.fields]
    };
  } else {
    editingNode.value = {
      label: '',
      fields: []
    };
  }
}, { immediate: true });

// Methods
const addField = () => {
  editingNode.value.fields.push({
    name: '',
    type: 'varchar'
  });
};

const removeField = (index: number) => {
  editingNode.value.fields.splice(index, 1);
};

const togglePrimary = (index: number) => {
  // Only one field can be primary
  editingNode.value.fields.forEach((field, i) => {
    field.isPrimary = i === index ? !field.isPrimary : false;
  });
};

const toggleForeign = (index: number) => {
  editingNode.value.fields[index].isForeign = !editingNode.value.fields[index].isForeign;
};

const saveNode = () => {
  if (!editingNode.value.label || editingNode.value.fields.length === 0) {
    return;
  }

  // Validate field names
  const fieldNames = editingNode.value.fields.map(f => f.name).filter(name => name.trim());
  if (fieldNames.length !== editingNode.value.fields.length) {
    alert('All fields must have names');
    return;
  }

  // Check for duplicate field names
  const uniqueNames = new Set(fieldNames);
  if (uniqueNames.size !== fieldNames.length) {
    alert('Field names must be unique');
    return;
  }

  // Create the node data
  const nodeData: CustomTableData = {
    label: editingNode.value.label,
    fields: editingNode.value.fields.filter(f => f.name.trim())
  };

  // Create or update node
  if (props.node) {
    // Update existing node
    const updatedNode: Node<CustomTableData> = {
      ...props.node,
      data: nodeData
    };
    emit('save', updatedNode);
  } else {
    // Create new node
    const newNode: Node<CustomTableData> = {
      id: `table-${Date.now()}`,
      type: 'tableNode',
      position: { x: 100, y: 100 },
      data: nodeData
    };
    emit('save', newNode);
  }
};

const cancelEdit = () => {
  emit('cancel');
};
</script>
