# Node Configuration Panel - Developer Guide

## Making Your Node Compatible

All nodes are automatically compatible with the configuration panel! The system uses the existing node components and renders them in a dedicated configuration environment.

## Node Component Requirements

### 1. Standard Props Interface

Your node component should accept these standard props:

```typescript
interface NodeProps {
  customNodeProps: {
    id: string;
    type: string;
    data: any;
    position: { x: number; y: number };
    selected: boolean;
    draggable: boolean;
    selectable: boolean;
  };
  updateNodeData: (nodeId: string, key: string, value: any) => void;
  allHandlers?: any;
  organizationId?: string;
  availableHooks?: any[];
  availableTransports?: any[];
  canvasNodes?: any[];
  canvasEdges?: any[];
  canvasViewport?: any;
}
```

### 2. Update Node Data Callback

Always use the `updateNodeData` callback when user modifies configuration:

```vue
<template>
  <input
    v-model="localValue"
    @blur="updateNodeData(customNodeProps.id, 'fieldName', localValue)"
  />
</template>
```

### 3. No Canvas Dependencies

Your node should not depend on VueFlow features when rendered in config panel:

❌ **DON'T:**
```typescript
// Don't access VueFlow instance directly
const { getNodes } = useVueFlow();
```

✅ **DO:**
```typescript
// Use passed props
const nodes = props.canvasNodes;
```

## Configuration Panel Behavior

### What Changes in Config Panel

1. **Connection Handles** - Hidden via CSS
2. **Node Resizers** - Hidden via CSS  
3. **Positioning** - Static (not draggable)
4. **Size** - Can expand to full panel width/height
5. **Focus** - All interactive elements fully accessible

### What Stays the Same

1. **All Props** - Node receives all normal props
2. **Handlers** - All event handlers work normally
3. **Reactivity** - Vue reactivity works as expected
4. **Styles** - Node styles apply normally
5. **Logic** - All business logic works unchanged

## Example: Simple Node

Here's how a simple shape node works with the configuration panel:

```vue
<!-- RectangleNode.vue -->
<template>
  <div class="shape-node rectangle-shape">
    <!-- Connection Handles (hidden in config panel) -->
    <Handle id="left" type="target" :position="Position.Left" />
    <Handle id="right" type="source" :position="Position.Right" />
    
    <!-- Configuration UI (works in both modes) -->
    <input
      v-model="customNodeProps.data.text"
      class="editable-label"
      placeholder="Enter text"
      @blur="updateNodeData(customNodeProps.id, 'text', customNodeProps.data.text)"
    />
    
    <!-- Node Resizer (hidden in config panel) -->
    <NodeResizer v-if="customNodeProps.selected" />
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
import { NodeResizer } from "@vue-flow/node-resizer";

interface Props {
  customNodeProps: any;
  updateNodeData: (nodeId: string, key: string, value: any) => void;
}

defineProps<Props>();
</script>
```

**Works perfectly in both:**
- Configuration Panel (handles/resizer hidden, input works)
- Canvas (handles/resizer visible, input works)

## Example: Complex Node

Here's how a complex node like BrowserNode works:

```vue
<!-- BrowserNode.vue -->
<template>
  <div class="browser-node">
    <!-- Handles (auto-hidden in config panel) -->
    <Handle id="left" type="target" :position="Position.Left" />
    <Handle id="right" type="source" :position="Position.Right" />
    
    <!-- Header -->
    <div class="node-header">
      <h3>{{ customNodeProps.data?.label || 'Browser Node' }}</h3>
    </div>
    
    <!-- URL Configuration -->
    <div class="browser-url-section">
      <input
        :value="customNodeProps.data?.url || ''"
        placeholder="Enter URL"
        @input="handleUrlInput"
      />
      <button @click="loadUrl">Load</button>
    </div>
    
    <!-- Device Presets -->
    <div class="device-presets">
      <button @click="spawnViewport('mobile')">Mobile</button>
      <button @click="spawnViewport('tablet')">Tablet</button>
    </div>
    
    <!-- Browser Content (iframe) -->
    <div class="browser-content">
      <iframe :src="customNodeProps.data?.url" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";

interface Props {
  customNodeProps: any;
  updateNodeData: (nodeId: string, key: string, value: any) => void;
}

const props = defineProps<Props>();

const handleUrlInput = (event: Event) => {
  const url = (event.target as HTMLInputElement).value;
  props.updateNodeData(props.customNodeProps.id, 'url', url);
};

const loadUrl = () => {
  // Load URL logic
};

const spawnViewport = (device: string) => {
  // Spawn viewport logic
};
</script>
```

**Configuration Panel Benefits:**
- Full screen space for iframe preview
- All controls easily accessible
- Can test URL before adding to canvas
- Device presets visible without scrolling

## Common Patterns

### Pattern 1: Form Fields

```vue
<template>
  <input
    v-model="localValue"
    @input="handleInput"
    @blur="saveValue"
  />
</template>

<script setup>
const localValue = ref(props.customNodeProps.data?.fieldName || '');

const handleInput = () => {
  // Optional: real-time validation
};

const saveValue = () => {
  props.updateNodeData(
    props.customNodeProps.id,
    'fieldName',
    localValue.value
  );
};
</script>
```

### Pattern 2: Dropdown Selection

```vue
<template>
  <select
    :value="customNodeProps.data?.selectedOption"
    @change="handleChange"
  >
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
  </select>
</template>

<script setup>
const handleChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  props.updateNodeData(
    props.customNodeProps.id,
    'selectedOption',
    value
  );
};
</script>
```

### Pattern 3: File/Folder Browser

```vue
<template>
  <button @click="browseFolder">Browse Folder</button>
  <div v-if="customNodeProps.data?.folderPath">
    Selected: {{ customNodeProps.data.folderPath }}
  </div>
</template>

<script setup>
const browseFolder = async () => {
  const { open } = await import('@tauri-apps/plugin-dialog');
  const path = await open({ directory: true });
  
  if (path) {
    props.updateNodeData(
      props.customNodeProps.id,
      'folderPath',
      path
    );
  }
};
</script>
```

### Pattern 4: Complex Object Updates

```vue
<script setup>
const updateScriptData = (scriptIndex: number, field: string, value: any) => {
  const scripts = [...customNodeProps.data.scripts];
  scripts[scriptIndex][field] = value;
  
  props.updateNodeData(
    props.customNodeProps.id,
    'scripts',
    scripts
  );
};
</script>
```

## Styling Considerations

### Responsive to Panel Size

Your node can use CSS to adapt to config panel:

```css
/* Node styles that work in both environments */
.my-node {
  width: 100%;
  max-width: 1000px; /* Limit in config panel */
  min-width: 400px;  /* Minimum in both modes */
}

/* Config panel specific (if needed) */
.node-configuration-wrapper .my-node {
  max-width: none; /* Allow full width in config panel */
}
```

### Hide Canvas-Specific Elements

Some elements might only make sense on canvas:

```vue
<template>
  <div class="my-node">
    <!-- Always visible -->
    <div class="configuration-section">
      Configuration UI here
    </div>
    
    <!-- Only visible on canvas (hidden in config panel) -->
    <div v-if="customNodeProps.draggable" class="canvas-only-section">
      Position controls, canvas-specific features
    </div>
  </div>
</template>
```

Since `customNodeProps.draggable` is `false` in config panel, canvas-specific UI is automatically hidden.

## Testing Your Node

### Test Checklist

- [ ] Node opens in configuration panel without errors
- [ ] All configuration fields are accessible
- [ ] Updates via updateNodeData work correctly
- [ ] Node can be added to canvas with configuration
- [ ] Node can be edited from canvas
- [ ] Configuration persists after adding
- [ ] Keyboard shortcuts work (Esc, Cmd+S)
- [ ] Cancel button works without errors
- [ ] Delete button works (edit mode)
- [ ] No console errors in either mode

### Test in Browser DevTools

```javascript
// Open config panel
openNodeConfiguration('yourNodeType', 'sidebar', {
  testField: 'test value'
});

// Check state
console.log(configurationState.value);

// Simulate update
updateConfigurationData('testField', 'new value');

// Check updated state
console.log(configurationState.value.nodeData);
```

## Common Issues

### Issue 1: Node not rendering
**Cause:** Node type not registered in useNodeComponentRegistry
**Fix:** Register your node type in the registry

### Issue 2: Updates not saving
**Cause:** Not calling updateNodeData correctly
**Fix:** Ensure callback is called with correct parameters

### Issue 3: Panel stays open after add
**Cause:** Not emitting close event
**Fix:** Check that handleAddOrUpdate calls handleClose()

### Issue 4: Connection handles visible
**Cause:** CSS specificity issue
**Fix:** Check that `.node-configuration-wrapper :deep(.connection-handle)` rule applies

### Issue 5: Data not persisting
**Cause:** Shallow clone causing reactivity issues
**Fix:** Panel uses JSON.parse(JSON.stringify()) for deep clone

## Advanced Techniques

### Technique 1: Dynamic Form Fields

```vue
<template>
  <div v-for="(field, index) in dynamicFields" :key="index">
    <input
      v-model="field.value"
      @blur="updateFields"
    />
    <button @click="removeField(index)">Remove</button>
  </div>
  <button @click="addField">Add Field</button>
</template>

<script setup>
const dynamicFields = ref(customNodeProps.data?.fields || []);

const updateFields = () => {
  props.updateNodeData(
    props.customNodeProps.id,
    'fields',
    [...dynamicFields.value]
  );
};

const addField = () => {
  dynamicFields.value.push({ name: '', value: '' });
  updateFields();
};

const removeField = (index: number) => {
  dynamicFields.value.splice(index, 1);
  updateFields();
};
</script>
```

### Technique 2: Multi-Step Configuration

```vue
<template>
  <div v-if="configStep === 1">
    <!-- Step 1: Basic Info -->
    <input v-model="name" @blur="saveName" />
    <button @click="configStep = 2">Next</button>
  </div>
  
  <div v-else-if="configStep === 2">
    <!-- Step 2: Advanced Options -->
    <button @click="configStep = 1">Back</button>
    <select v-model="option" @change="saveOption">
      <option>Option 1</option>
    </select>
  </div>
</template>

<script setup>
const configStep = ref(1);
const name = ref(customNodeProps.data?.name || '');
const option = ref(customNodeProps.data?.option || '');

const saveName = () => {
  props.updateNodeData(customNodeProps.id, 'name', name.value);
};

const saveOption = () => {
  props.updateNodeData(customNodeProps.id, 'option', option.value);
};
</script>
```

### Technique 3: Real-Time Preview

```vue
<template>
  <div class="config-section">
    <input v-model="color" @input="updateColor" />
  </div>
  
  <div class="preview-section">
    <div :style="{ background: color }">
      Preview
    </div>
  </div>
</template>

<script setup>
const color = ref(customNodeProps.data?.color || '#000');

const updateColor = () => {
  props.updateNodeData(customNodeProps.id, 'color', color.value);
};
</script>
```

## API Reference

### Props Received by Node

```typescript
customNodeProps: {
  id: string;              // 'temp-config-node' (create) or actual ID (edit)
  type: string;            // Node type identifier
  data: any;               // Current configuration data
  position: { x: 0, y: 0 }; // Always (0, 0) in config panel
  selected: false;         // Never selected in config panel
  draggable: false;        // Never draggable in config panel
  selectable: false;       // Never selectable in config panel
}

updateNodeData: (nodeId: string, key: string, value: any) => void;
// Call this to update configuration

allHandlers: object;
// All canvas handlers (if node needs to trigger actions)

organizationId?: string;
availableHooks?: any[];
availableTransports?: any[];
canvasNodes?: any[];
canvasEdges?: any[];
canvasViewport?: any;
// Context props (if node needs canvas information)
```

### Events Your Node Can Emit

Most nodes don't emit events directly. Instead, use `updateNodeData`:

```typescript
// ❌ Don't emit events
emit('data-changed', newData);

// ✅ Use updateNodeData callback
props.updateNodeData(props.customNodeProps.id, 'myField', newData);
```

## Best Practices

### 1. Immediate Feedback

```vue
<!-- ✅ Good: Immediate visual feedback -->
<input
  v-model="localValue"
  @input="validateInput"
  @blur="saveValue"
/>

<!-- ❌ Bad: No feedback until blur -->
<input
  @blur="handleBlur"
/>
```

### 2. Clear Labels

```vue
<!-- ✅ Good: Clear label with description -->
<div class="field">
  <label>
    Project Path
    <span class="hint">Full path to project folder</span>
  </label>
  <input />
</div>

<!-- ❌ Bad: Unclear -->
<input placeholder="Path" />
```

### 3. Validation

```vue
<script setup>
const validateUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const saveUrl = () => {
  if (!validateUrl(localUrl.value)) {
    alert('Invalid URL');
    return;
  }
  
  props.updateNodeData(
    props.customNodeProps.id,
    'url',
    localUrl.value
  );
};
</script>
```

### 4. Default Values

```vue
<script setup>
const url = ref(props.customNodeProps.data?.url || 'https://');
const width = ref(props.customNodeProps.data?.width || 800);
const height = ref(props.customNodeProps.data?.height || 600);

// Provide sensible defaults for new nodes
</script>
```

### 5. Accessibility

```vue
<template>
  <!-- Good: Proper labels and ARIA -->
  <label for="node-url">URL</label>
  <input
    id="node-url"
    v-model="url"
    aria-label="Node URL"
    aria-required="true"
  />
  
  <button
    @click="loadUrl"
    :disabled="!url"
    aria-label="Load URL"
  >
    Load
  </button>
</template>
```

## Advanced: Custom Configuration UI

If your node needs special configuration UI for the panel:

```vue
<template>
  <div class="my-node">
    <!-- Show different UI in config panel vs canvas -->
    <div v-if="isInConfigPanel" class="extended-config">
      <!-- More detailed configuration options -->
      <div class="config-section">
        <h4>Advanced Settings</h4>
        <!-- More fields -->
      </div>
    </div>
    
    <div v-else class="compact-view">
      <!-- Simplified view for canvas -->
    </div>
  </div>
</template>

<script setup>
const isInConfigPanel = computed(() => {
  // Config panel sets draggable to false
  return !props.customNodeProps.draggable;
});
</script>
```

## Integration Checklist

When adding a new node type, ensure:

- [ ] Node registered in `useNodeComponentRegistry`
- [ ] Node registered in `useNodeMetadata` (for icon/name)
- [ ] Node creator added to `useCanvasNodes`
- [ ] Node accepts standard props interface
- [ ] Node uses `updateNodeData` callback
- [ ] Node doesn't depend on VueFlow instance
- [ ] Node handles in both create and edit modes
- [ ] Default values provided for all fields
- [ ] Configuration persists correctly
- [ ] Node tested in both panel and canvas

## Example: Full Node Implementation

```vue
<!-- MyCustomNode.vue -->
<template>
  <div class="custom-node">
    <!-- Handles (auto-hidden in config panel) -->
    <Handle id="left" type="target" :position="Position.Left" class="connection-handle" />
    <Handle id="right" type="source" :position="Position.Right" class="connection-handle" />
    
    <!-- Custom Resizer (auto-hidden in config panel) -->
    <CustomNodeResizer
      v-if="customNodeProps.selected"
      :min-width="400"
      :min-height="300"
      @resize="handleResize"
    />
    
    <!-- Header -->
    <div class="node-header">
      <UIcon name="i-lucide-settings" class="w-4 h-4 text-primary" />
      <h3>{{ customNodeProps.data?.label || 'Custom Node' }}</h3>
    </div>
    
    <!-- Configuration Section -->
    <div class="node-content">
      <!-- Field 1: Text Input -->
      <div class="field-group">
        <label>Name</label>
        <input
          v-model="name"
          placeholder="Enter name"
          @blur="saveName"
        />
      </div>
      
      <!-- Field 2: Number Input -->
      <div class="field-group">
        <label>Count</label>
        <input
          v-model.number="count"
          type="number"
          @blur="saveCount"
        />
      </div>
      
      <!-- Field 3: Checkbox -->
      <div class="field-group">
        <label>
          <input
            v-model="enabled"
            type="checkbox"
            @change="saveEnabled"
          />
          Enable Feature
        </label>
      </div>
      
      <!-- Field 4: Complex Object -->
      <div class="field-group">
        <label>Options</label>
        <button @click="addOption">Add Option</button>
        <div v-for="(option, index) in options" :key="index">
          <input
            v-model="option.value"
            @blur="saveOptions"
          />
          <button @click="removeOption(index)">Remove</button>
        </div>
      </div>
    </div>
    
    <!-- Action Buttons (optional) -->
    <div class="node-actions">
      <button @click="runAction">Run Action</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Handle, Position } from '@vue-flow/core';
import CustomNodeResizer from '~/components/canvas/shared/CustomNodeResizer.vue';

interface Props {
  customNodeProps: any;
  updateNodeData: (nodeId: string, key: string, value: any) => void;
  allHandlers?: any;
  organizationId?: string;
}

const props = defineProps<Props>();

// Local state with defaults
const name = ref(props.customNodeProps.data?.name || '');
const count = ref(props.customNodeProps.data?.count || 0);
const enabled = ref(props.customNodeProps.data?.enabled || false);
const options = ref(props.customNodeProps.data?.options || []);

// Watch for external data changes (important for edit mode)
watch(() => props.customNodeProps.data, (newData) => {
  if (newData) {
    name.value = newData.name || '';
    count.value = newData.count || 0;
    enabled.value = newData.enabled || false;
    options.value = newData.options || [];
  }
}, { deep: true });

// Save handlers
const saveName = () => {
  props.updateNodeData(props.customNodeProps.id, 'name', name.value);
};

const saveCount = () => {
  props.updateNodeData(props.customNodeProps.id, 'count', count.value);
};

const saveEnabled = () => {
  props.updateNodeData(props.customNodeProps.id, 'enabled', enabled.value);
};

const saveOptions = () => {
  props.updateNodeData(props.customNodeProps.id, 'options', [...options.value]);
};

const addOption = () => {
  options.value.push({ value: '' });
  saveOptions();
};

const removeOption = (index: number) => {
  options.value.splice(index, 1);
  saveOptions();
};

const handleResize = (width: number, height: number) => {
  props.updateNodeData(props.customNodeProps.id, 'width', width);
  props.updateNodeData(props.customNodeProps.id, 'height', height);
};

const runAction = () => {
  // Use allHandlers if node needs to trigger canvas actions
  if (props.allHandlers?.someAction) {
    props.allHandlers.someAction(props.customNodeProps.id);
  }
};
</script>

<style scoped>
.custom-node {
  min-width: 400px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(var(--color-primary-rgb), 0.3);
  border-radius: 8px;
  padding: 16px;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.node-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.field-group input {
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: white;
}

.field-group input:focus {
  outline: none;
  border-color: rgba(var(--color-primary-rgb), 0.5);
}

.connection-handle {
  width: 8px;
  height: 8px;
  background: var(--color-primary);
  border: 2px solid white;
  border-radius: 50%;
}
</style>
```

## Summary

The Node Configuration Panel is designed to work seamlessly with existing node components. Most nodes require **zero changes** to work in the panel. Just ensure:

1. Use standard props interface
2. Call `updateNodeData` when user makes changes
3. Provide sensible defaults
4. Don't depend on VueFlow instance
5. Test in both create and edit modes

The panel handles all the complexity of:
- Rendering nodes in non-canvas environment
- Managing local state
- Hiding canvas-specific UI (handles, resizers)
- Keyboard shortcuts
- Validation and confirmation
- Animations and transitions

Happy node building! 🚀

