# Schema Builder Components

A collection of reusable Vue components for building and visualizing database schemas using Vue Flow.

## Components

### SchemaCanvas
The main canvas component that provides the interactive schema building interface.

**Features:**
- Drag and drop table nodes
- Create connections between tables
- Zoom and pan controls
- Mini-map navigation
- Background grid

**Props:**
- `initialNodes`: Array of initial table nodes
- `initialEdges`: Array of initial connections

**Events:**
- `update:nodes`: Emitted when nodes change
- `update:edges`: Emitted when edges change
- `node:update`: Emitted when a node is updated
- `node:delete`: Emitted when a node is deleted
- `edge:delete`: Emitted when an edge is deleted
- `connect`: Emitted when a new connection is made

### SchemaNode
Represents a database table with editable fields.

**Features:**
- Display table name and fields
- Show primary key and foreign key indicators
- Edit and delete buttons
- Connection handles for relationships

**Props:**
- Inherits from Vue Flow NodeProps
- Custom data structure with table information

**Events:**
- `update`: Emitted when edit button is clicked
- `delete`: Emitted when delete button is clicked

### SchemaConnection
Represents a relationship between database tables.

**Features:**
- Visual connection line with arrows
- Delete button on hover
- Styled with dashed lines and markers

**Props:**
- Inherits from Vue Flow EdgeProps

**Events:**
- `delete`: Emitted when delete button is clicked

### NodeEditor
A form component for creating and editing table nodes.

**Features:**
- Table name input
- Dynamic field management
- Field type selection
- Primary key and foreign key toggles
- Validation

**Props:**
- `node`: Optional existing node to edit

**Events:**
- `save`: Emitted when node is saved
- `cancel`: Emitted when editing is cancelled

## Usage

### Basic Setup

```vue
<template>
  <div class="h-screen">
    <SchemaCanvas
      :initial-nodes="nodes"
      :initial-edges="edges"
      @update:nodes="onNodesUpdate"
      @update:edges="onEdgesUpdate"
    />
  </div>
</template>

<script setup>
import SchemaCanvas from '~/components/SchemaBuilder/SchemaCanvas.vue';

const nodes = ref([]);
const edges = ref([]);

const onNodesUpdate = (newNodes) => {
  nodes.value = newNodes;
};

const onEdgesUpdate = (newEdges) => {
  edges.value = newEdges;
};
</script>
```

### Creating a New Table

```vue
<template>
  <NodeEditor @save="onNodeSave" @cancel="onCancel" />
</template>

<script setup>
import NodeEditor from '~/components/SchemaBuilder/NodeEditor.vue';

const onNodeSave = (node) => {
  // Add the new node to your canvas
  nodes.value.push(node);
};
</script>
```

## Data Structure

### Table Node
```typescript
interface CustomTableData {
  label: string;           // Table name
  fields: CustomTableField[]; // Array of table fields
  selected?: boolean;       // Selection state
}

interface CustomTableField {
  name: string;            // Field name
  type: string;            // Data type (int, varchar, etc.)
  isPrimary?: boolean;     // Primary key flag
  isForeign?: boolean;     // Foreign key flag
}
```

### Connection Edge
```typescript
interface Edge {
  id: string;              // Unique identifier
  source: string;          // Source table ID
  target: string;          // Target table ID
  sourceHandle: string;    // Source field handle
  targetHandle: string;    // Target field handle
  type: 'smoothstep';      // Edge type
}
```

## Styling

The components use Tailwind CSS classes and CSS custom properties for theming. Key styling variables:

- `--primary`: Primary color for connections and highlights
- `--border`: Border color for tables and connections
- `--muted`: Muted background colors
- `--foreground`: Text colors

## Dependencies

- Vue Flow Core
- Vue Flow Background
- Vue Flow MiniMap
- Tailwind CSS
- UI components from the design system

## Browser Support

- Modern browsers with ES6+ support
- WebGL support for smooth rendering
- Touch support for mobile devices
